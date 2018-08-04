import React, { Component } from "react";

import MenuBar from "../../views/MenuBar/MenuBar";
import SongListPanel from "../../views/SongListPanel/SongListPanel";
import ChartViewer from "../../views/ChartViewer/ChartViewer";
import TrainingWindow from "../../views/TrainingWindow/TrainingWindow"
import Keyboard from "../../views/Keyboard/Keyboard";
import MidSettingsModal from "../../views/MidiSettingsModal/MidiSettingsModal";

import * as Api from "../../../shared/Api";
import * as MusicHelper from "../../../shared/music/MusicHelper";
import { StorageHelper } from "../../../shared/StorageHelper";
import { SessionManager, ImprovSessionManager, ListeningSessionManager } from "../../../shared/music/SessionManager";
import Chart from "../../../shared/music/Chart";

import "./PlayViewController.css";
import { ISong, NoteName, PlayMode, IImprovReport, IListeningReport, Tempo, IMusicIdx, IChartBar } from "../../../shared/types";

export interface IPlayVCProps {
    // TODO: get proper types for all this
    SoundActions: any;
    StateHelper: any;
    sessionManager: SessionManager | ImprovSessionManager | ListeningSessionManager;
}

export interface IPlayVCState {
    loadingSelectedSong: boolean;
    songTitles: { [songId: string]: string }
    selectedSong: ISong | {};
    chart: Chart | {};
    midiSettingsModalOpen: boolean;
    playMode: PlayMode;
}

class PlayViewController extends Component<IPlayVCProps, IPlayVCState> {
    private _firstNoteColor = "mediumslateblue";

    constructor(props: IPlayVCProps) {
        super(props);
        this.state = {
            loadingSelectedSong: false,
            songTitles: {},
            selectedSong: {},
            chart: {},
            midiSettingsModalOpen: false,
            playMode: PlayMode.None         
        };
    }

    public componentWillMount() {
        let { SoundActions } = this.props;
        let midiInputId = StorageHelper.getMidiInputId();
        let selectedSongId = StorageHelper.getSelectedSongId();

        if (midiInputId) {
            let connectionSuccessful = SoundActions.connectToMidiInput(midiInputId);
            if (!connectionSuccessful) {
                StorageHelper.setMidiInputId("");
            }
            this.setState({ midiSettingsModalOpen: !connectionSuccessful });
        }

        Api.getSongTitlesAsync()
            .then(songTitles => {
                this.setState({ songTitles });
                if (selectedSongId in songTitles) {
                    return Api.getSongAsync(selectedSongId);
                } 
                return;
            })
            .then(song => {
                if (song) {
                    this.setState({ 
                        selectedSong: song
                    }, this._resetChart);
                }
            });
    }

    public render() {
        let { sessionManager } = this.props;
        let { 
            songTitles, 
            selectedSong, 
            midiSettingsModalOpen, 
            chart,
            playMode
        } = this.state;

        let selectedSongId = selectedSong ? (selectedSong as ISong).chartId: null;
        let inSession = sessionManager && sessionManager.inSession;
        let sessionIdx = inSession ? sessionManager.sessionIdx : null;
        let currKey: NoteName | "" = inSession ? sessionManager.currKey : "";
        let firstNote = inSession ? (sessionManager as ListeningSessionManager).firstNote : NaN;
        let rangeStartNote = inSession ? (sessionManager as ListeningSessionManager).rangeStartNote : MusicHelper.LOWEST_A;
        let rangeEndNote = inSession ? (sessionManager as ListeningSessionManager).rangeEndNote : MusicHelper.HIGHEST_C;
        let showKeyChanges = true;
        let report: IImprovReport | IListeningReport | undefined;
        let userShouldPlay;

        if (inSession) {
            switch (playMode) {
                case PlayMode.Improv:
                    report = (sessionManager as ImprovSessionManager).currImprovScore;
                    break;
                case PlayMode.Listening:
                    report = (sessionManager as ListeningSessionManager).currListeningScore;
                    userShouldPlay = (sessionManager as ListeningSessionManager).userShouldPlay;
                    showKeyChanges = false;
                    break;
                default:
                    report = undefined;
            }
        }

        return (
            <div id="play-view">
                <div>
                    <MenuBar 
                        openMIDISettingsModal={() => this.setState({ midiSettingsModalOpen: true })} />
                </div>
                <div className="top-row">
                    <SongListPanel 
                        songTitles={songTitles}
                        selectedSongId={selectedSongId} 
                        onSongListItemClick={this._onSongListItemClick} />
                    <ChartViewer
                        editingMode={false}
                        song={selectedSong as ISong}
                        chart={chart as Chart} 
                        sessionIdx={sessionIdx as IMusicIdx} 
                        recontextualize={this._recontextualize} 
                        resetTempo={this._resetTempo} 
                        onBarClick={this._onBarClick} />
                    <TrainingWindow  
                        startSession={this._startSession} 
                        stopSession={this._stopSession} 
                        setPlayMode={this._setPlayMode} 
                        playMode={playMode} 
                        report={report} 
                        userShouldPlay={userShouldPlay}
                        firstNoteColor={this._firstNoteColor} />
                </div>
                <div className="bottom-row">
                    <Keyboard
                        showKeyChanges={showKeyChanges} 
                        depressedKeys={this.props.StateHelper.getCurrentUserKeysDepressed()} 
                        currentKey={currKey} 
                        playUserMidiMessage={this.props.SoundActions.playUserMidiMessage} 
                        takeIsPlaying={inSession} 
                        firstNote={firstNote || NaN} 
                        rangeStartNote={rangeStartNote || MusicHelper.LOWEST_A}
                        rangeEndNote={rangeEndNote || MusicHelper.HIGHEST_C} 
                        firstNoteColor={this._firstNoteColor} />
                </div>

                <MidSettingsModal 
                    SoundActions={this.props.SoundActions} 
                    StateHelper={this.props.StateHelper} 
                    isOpen={midiSettingsModalOpen} 
                    close={()=> this.setState({ midiSettingsModalOpen: false })} />
            </div>
        ); 
    }

    /*********************
        TRAINING WINDOW
    **********************/

    private _startSession = () => {
        let { chart, playMode } = this.state;
        this.props.SoundActions.playRangeLoop(chart, playMode);
    }

    private _stopSession = () => {
        this.props.SoundActions.killTake();
    }

    private _setPlayMode = (playMode: PlayMode) => {
        this.setState({ playMode });
    }

    /************
        MUSIC
    ************/

    private _resetChart = () => {
        let { chartId, barsBase, originalTempo, originalContext } = this.state.selectedSong as ISong;
        let chartSettings = StorageHelper.getChartSettings(chartId as string);
        let playMode = StorageHelper.getPlayMode();

        let { tempo, context, feel, rangeStartIdx, rangeEndIdx } = chartSettings;
        if (!tempo) {
            tempo = originalTempo;
        }
        if (!context) {
            context = originalContext;
        }
        if (!Number.isInteger(rangeStartIdx as number)) {
            rangeStartIdx = 0;
        }
        if (!Number.isInteger(rangeEndIdx as number)) {
            rangeEndIdx = (
                (playMode === "listening")
                        ? 1
                        : (barsBase as IChartBar[]).length - 1
            );
        }

        this.setState({ 
            chart: new Chart(
                barsBase, 
                context, 
                tempo, 
                feel,
                this.forceUpdate.bind(this), 
                rangeStartIdx, 
                rangeEndIdx
            ) 
        });
    }

    /*******************
        CHART VIEWER`
    *******************/

    private _onBarClick = (i: number) => {
        this._stopSession();
        let { selectedSong, chart } = this.state;
        let { rangeEndIdx, rangeStartIdx } = chart as Chart;
        let withinRange = rangeStartIdx <= i && 
                          i <= rangeEndIdx;

        let rangeStartIdxUpdate = (
            withinRange
                ? i
                : i < rangeStartIdx
                    ? i
                    : rangeStartIdx
        );
        let rangeEndIdxUpdate = (
            withinRange
                ? i
                : rangeEndIdx < i
                    ? i
                    : rangeEndIdx
        );

        (chart as Chart).rangeStartIdx = rangeStartIdxUpdate;
        (chart as Chart).rangeEndIdx = rangeEndIdxUpdate;

        StorageHelper.updateChartSettings((selectedSong as ISong).chartId as string, {
            rangeStartIdx: rangeStartIdxUpdate,
            rangeEndIdx: rangeEndIdxUpdate
        });
    }

    private _recontextualize = (newKeyContext: NoteName) => {
        this._stopSession();
        let { selectedSong, chart } = this.state;

        (chart as Chart).context = newKeyContext;
        
        StorageHelper.updateChartSettings((selectedSong as ISong).chartId as string, {
            context: newKeyContext
        });
    }

    private _resetTempo = (newTempo: Tempo) => {
        this._stopSession();
        let { selectedSong, chart } = this.state;

        (chart as Chart).tempo = newTempo;

        StorageHelper.updateChartSettings((selectedSong as ISong).chartId as string, {
            tempo: newTempo
        });
    }

    /**********************
        SONG LIST PANEL   
    **********************/

    private _onSongListItemClick = (selectedSongId: string) => {
        StorageHelper.setSelectedSongId(selectedSongId);
        
        Api.getSongAsync(selectedSongId)
            .then(selectedSong => {
                if (selectedSong) {
                    this.setState({ selectedSong });
                }
            });
    }
    
}

export default PlayViewController;