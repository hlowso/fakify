import React, { Component } from "react";

import MenuBar from "../../views/MenuBar/MenuBar";
// import SongListPanel from "../../views/SongListPanel/SongListPanel";
import ChartViewer from "../../views/ChartViewer/ChartViewer";
import Keyboard from "../../views/Keyboard/Keyboard";
import MidSettingsModal from "../../views/MidiSettingsModal/MidiSettingsModal";

import * as Api from "../../../shared/Api";
import * as MusicHelper from "../../../shared/music/MusicHelper";
import { StorageHelper } from "../../../shared/StorageHelper";
import { SessionManager, ImprovSessionManager, ListeningSessionManager } from "../../../shared/music/SessionManager";
import Chart from "../../../shared/music/Chart";

import "./PlayViewController.css";
import { ISong, NoteName, PlayMode, Tempo, IMusicIdx, IChartBar } from "../../../shared/types";
import { Dashboard } from "../../views/Dashboard/Dashboard";
import $ from "jquery";

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
    midiSettingsModalOpen: boolean;
    playMode: PlayMode;
    spaceClickDone: boolean;
}

class PlayViewController extends Component<IPlayVCProps, IPlayVCState> {
    private _chart: Chart;
    private _firstNoteColor = "mediumslateblue";

    constructor(props: IPlayVCProps) {
        super(props);
        this.state = {
            loadingSelectedSong: false,
            songTitles: {},
            selectedSong: {},
            midiSettingsModalOpen: false,
            playMode: PlayMode.None,
            spaceClickDone: true       
        };
    }

    /*****************
        LIFE CYCLE  
    ******************/

    public componentDidMount() {
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

        window.addEventListener("keydown", this._onKeyDown);
        window.addEventListener("keyup", this._onKeyUp);
    }

    public componentWillUnmount() {
        this._stopSession();

        window.removeEventListener("keydown", this._onKeyDown);
        window.removeEventListener("keyup", this._onKeyUp);
    }

    public componentDidUpdate() {
        this._setScrollToPutCurrentBarInView();
    }

    private _setScrollToPutCurrentBarInView = () => {

        let { sessionManager } = this.props;

        if (!sessionManager || !sessionManager.inSession || !sessionManager.sessionIdx) {
            return;
        }

        let { sessionIdx } = sessionManager;

        let $chart = $("#chart-viewer") as any;
        let $currBar: any;

        $(".bar-container").each(function(barIdx) {
            if (barIdx === sessionIdx.barIdx ) {
                $currBar = $( this );
            }
        });

        if (!$currBar) {
            return;
        }

        let doUpdate = false;
        let currBarY = $currBar.offset().top;
        let chartUpperLimit = $chart.offset().top + 100;
        let chartLowerLimit = $chart.offset().top + $chart.height() - 100;

        let chartScrollTop = $chart[0].scrollTop;
        let chartScrollBottom = $chart[0].scrollHeight - $chart.height();

        if (currBarY < chartUpperLimit && chartScrollTop !== 0) {
            $chart[0].scrollTop -= 100;
            doUpdate = true;
        } else if (currBarY > chartLowerLimit && chartScrollTop !== chartScrollBottom) {
            $chart[0].scrollTop += 100;
            doUpdate = true;
        }

        if (doUpdate) {
            this.forceUpdate();
        }
    }

    /**************
        RENDERS  
    **************/

    public render() {
        let { sessionManager } = this.props;
        let { 
            songTitles, 
            selectedSong, 
            midiSettingsModalOpen, 
        } = this.state;

        // let selectedSongId = selectedSong ? (selectedSong as ISong)._id: null;
        let inSession = sessionManager && sessionManager.inSession;
        let sessionFailed = sessionManager && sessionManager.failure;
        let chartIsLoaded = !!this._chart && !sessionFailed;
        let sessionIdx = inSession ? sessionManager.sessionIdx : null;
        let currNoteClasses = inSession ? sessionManager.currKeyNoteClasses : [];
        let firstNote = inSession ? (sessionManager as ListeningSessionManager).firstNote : NaN;
        let rangeStartNote = inSession ? (sessionManager as ListeningSessionManager).rangeStartNote : MusicHelper.LOWEST_A;
        let rangeEndNote = inSession ? (sessionManager as ListeningSessionManager).rangeEndNote : MusicHelper.HIGHEST_C;
        let showKeyChanges = true;

        return (
            <div id="play-view">
                <div>
                    <MenuBar 
                        openMIDISettingsModal={() => this.setState({ midiSettingsModalOpen: true })} 
                        songTitles={songTitles} 
                        onSongTitleClick={this.onSongListItemClick} />
                </div>
                <div className="chart-container" >
                    <ChartViewer
                        editingMode={false}
                        song={selectedSong as ISong}
                        chart={this._chart as Chart} 
                        sessionIdx={sessionIdx as IMusicIdx} 
                        recontextualize={this._recontextualize} 
                        resetTempo={this._resetTempo} 
                        onBarClick={this._onBarClick} 
                        sessionFailed={sessionFailed} 
                        resetChart={this._resetChart} />
                    <Dashboard 
                        inSession={inSession}
                        chartIsLoaded={chartIsLoaded}
                        context={chartIsLoaded ? this._chart.context : undefined}
                        onKeyChange={this._recontextualize}
                        tempo={chartIsLoaded ? this._chart.tempo : undefined}
                        onTempoChange={this._resetTempo}
                        start={this._startSession}
                        stop={this._stopSession} />
                </div>
                
                    {/* <TrainingWindow  
                        startSession={this._startSession} 
                        stopSession={this._stopSession} 
                        setPlayMode={this._setPlayMode} 
                        playMode={playMode} 
                        report={report} 
                        userShouldPlay={userShouldPlay}
                        firstNoteColor={this._firstNoteColor} /> */}
                <Keyboard
                    showKeyChanges={showKeyChanges} 
                    depressedKeys={this.props.StateHelper.getCurrentUserKeysDepressed()} 
                    currentKeyBasePitches={currNoteClasses.map(n => n.basePitch)} 
                    playUserMidiMessage={this.props.SoundActions.playUserMidiMessage} 
                    takeIsPlaying={inSession} 
                    firstNote={firstNote || NaN} 
                    rangeStartNote={rangeStartNote || MusicHelper.LOWEST_A}
                    rangeEndNote={rangeEndNote || MusicHelper.HIGHEST_C} 
                    firstNoteColor={this._firstNoteColor} />

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
        if (!this._chart) {
            return;
        }
        let { playMode } = this.state;
        this.props.SoundActions.playRangeLoop(this._chart, playMode);
    }

    private _stopSession = () => {
        if (!this._chart) {
            return;
        }    
        this.props.SoundActions.killTake();
    }

    // private _setPlayMode = (playMode: PlayMode) => {
    //     this.setState({ playMode });
    // }

    /************
        MUSIC
    ************/

    private _resetChart = () => {
        this._stopSession();
        let { _id, barsBase, originalTempo, originalContext } = this.state.selectedSong as ISong;

        let chartSettings = StorageHelper.getChartSettings(_id as string);
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

        this._chart = new Chart(
            this.forceUpdate.bind(this), 
            barsBase, 
            context, 
            tempo, 
            feel,
            rangeStartIdx, 
            rangeEndIdx,
            _id
        ); 
    }

    /*******************
        CHART VIEWER 
    *******************/

    private _onBarClick = (i: number) => {
        this._stopSession();
        let { selectedSong } = this.state;
        let { rangeEndIdx, rangeStartIdx } = this._chart as Chart;
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

        (this._chart as Chart).rangeStartIdx = rangeStartIdxUpdate;
        (this._chart as Chart).rangeEndIdx = rangeEndIdxUpdate;

        StorageHelper.updateChartSettings((selectedSong as ISong)._id as string, {
            rangeStartIdx: rangeStartIdxUpdate,
            rangeEndIdx: rangeEndIdxUpdate
        });
    }

    private _recontextualize = (newKeyContext: NoteName) => {
        this._stopSession();
        let { selectedSong } = this.state;

        (this._chart as Chart).context = newKeyContext;
        
        StorageHelper.updateChartSettings((selectedSong as ISong)._id as string, {
            context: newKeyContext
        });
    }

    private _resetTempo = (newTempo: Tempo) => {
        this._stopSession();
        let { selectedSong } = this.state;

        (this._chart as Chart).tempo = newTempo;

        StorageHelper.updateChartSettings((selectedSong as ISong)._id as string, {
            tempo: newTempo
        });
    }

    /**********************
        SONG LIST PANEL   
    **********************/

    public onSongListItemClick = (selectedSongId: string) => {
        StorageHelper.setSelectedSongId(selectedSongId);
        
        Api.getSongAsync(selectedSongId)
            .then(selectedSong => {
                if (selectedSong) {
                    this.setState({ selectedSong }, this._resetChart);
                }
            });
    }

    /**
     * GENERAL HANDLERS
     */

    private _onKeyDown: EventListenerOrEventListenerObject = (evt: KeyboardEvent) => {
        switch((evt.code)) {
            case "Space":
                this._onSpace();
                break;

            default:
                break;
        }
    }

    private _onKeyUp: EventListenerOrEventListenerObject = (evt: KeyboardEvent) => {
        this.setState({ 
            spaceClickDone: true 
        });
    }

    private _onSpace = () => {
        let { sessionManager } = this.props;

        if (!this.state.spaceClickDone) {
            return;
        }

        sessionManager && sessionManager.inSession 
            ? this._stopSession() 
            : this._startSession();

        this.setState({ spaceClickDone: false });
    }
    
}

export default PlayViewController;