import React, { Component } from "react";

import MenuBar from "../../views/MenuBar/MenuBar";
import SongListPanel from "../../views/SongListPanel/SongListPanel";
import ChartViewer from "../../views/ChartViewer/ChartViewer";
import TrainingWindow from "../../views/TrainingWindow/TrainingWindow"
import Keyboard from "../../views/Keyboard/Keyboard";
import MidSettingsModal from "../../views/MidiSettingsModal/MidiSettingsModal";

import * as Api from "../../../shared/Api";
import * as Util from "../../../shared/Util";
import * as MusicHelper from "../../../shared/music/MusicHelper";
import { StorageHelper } from "../../../shared/StorageHelper";
import Chart from "../../../shared/music/Chart";

import "./PlayViewController.css";
import { PlayMode } from "../../../shared/types";

class PlayViewController extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loadingSelectedSong: false,
            songTitles: {},
            selectedSong: {},
            chart: {},
            midiSettingsModalOpen: true,
            playMode: "improv"         
        };
    }

    componentWillMount() {
        let { SoundActions, StateHelper } = this.props;
        let midiInputId = StorageHelper.getMidiInputId();
        let selectedSongId = StorageHelper.getSelectedSongId();

        this.SoundActions = SoundActions;
        this.StateHelper = StateHelper;

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
                    }, this.resetChart);
                }
            });
    }

    render() {
        let { sessionManager } = this.props;
        let { 
            songTitles, 
            selectedSong, 
            midiSettingsModalOpen, 
            chart,
            playMode
        } = this.state;

        let selectedSongId = selectedSong ? selectedSong.songId: null;
        let inSession = sessionManager && sessionManager.inSession;
        let sessionIdx = inSession ? sessionManager.sessionIdx : null;
        let currKey = inSession ? sessionManager.currKey : "";

        let report;
        let userShouldPlay;
        if (inSession) {
            switch (playMode) {
                case "improv":
                    report = sessionManager.currImprovScore;
                    break;
                case "listening":
                    report = sessionManager.currListeningScore;
                    userShouldPlay = sessionManager.userShouldPlay;
                    break;
                default:
                    report = null;
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
                        onSongListItemClick={this.onSongListItemClick} />
                    <ChartViewer
                        song={selectedSong}
                        chart={chart} 
                        sessionIdx={sessionIdx} 
                        recontextualize={this.recontextualize} 
                        resetTempo={this.resetTempo} 
                        onBarClick={this.onBarClick} />
                    <TrainingWindow  
                        startSession={this.startSession} 
                        stopSession={this.stopSession} 
                        setPlayMode={this.setPlayMode} 
                        playMode={playMode} 
                        report={report} 
                        userShouldPlay={userShouldPlay} />
                </div>
                <div className="bottom-row">
                    <Keyboard 
                        depressedKeys={this.StateHelper.getCurrentUserKeysDepressed()} 
                        currentKey={currKey} 
                        playUserMidiMessage={this.SoundActions.playUserMidiMessage} 
                        takeIsPlaying={inSession} />
                </div>

                <MidSettingsModal 
                    SoundActions={this.SoundActions} 
                    StateHelper={this.StateHelper} 
                    isOpen={midiSettingsModalOpen} 
                    close={()=> this.setState({ midiSettingsModalOpen: false })} />
            </div>
        ); 
    }

    /*********************
        TRAINING WINDOW
    **********************/

    startSession = () => {
        let { chart, playMode } = this.state;
        this.SoundActions.playRangeLoop(chart, playMode);
    }

    stopSession = () => {
        this.SoundActions.killTake();
    }

    setPlayMode = playMode => {
        this.setState({ playMode });
    }

    /************
        MUSIC
    ************/

    resetChart = () => {
        let { id, barsBase, originalTempo, originalContext, suitableFeels } = this.state.selectedSong;
        let chartSettings = StorageHelper.getChartSettings(id);
        let playMode = StorageHelper.getPlayMode();

        let { tempo, context, feel, rangeStartIdx, rangeEndIdx } = chartSettings;
        if (!tempo) {
            tempo = originalTempo;
        }
        if (!context) {
            context = originalContext;
        }
        if (!feel) {
            feel = suitableFeels[0];
        }
        if (!Number.isInteger(rangeStartIdx)) {
            rangeStartIdx = 0;
        }
        if (!Number.isInteger(rangeEndIdx)) {
            rangeEndIdx = (
                (playMode === "listening")
                        ? 1
                        : barsBase.length - 1
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
        CHART VIEWER
    *******************/

    onBarClick = i => {
        this.stopSession();
        let { selectedSong, chart } = this.state;
        let { rangeEndIdx, rangeStartIdx } = chart;
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

        chart.rangeStartIdx = rangeStartIdxUpdate;
        chart.rangeEndIdx = rangeEndIdxUpdate;

        StorageHelper.updateChartSettings(selectedSong.id, {
            rangeStartIdx: rangeStartIdxUpdate,
            rangeEndIdx: rangeEndIdxUpdate
        });
    }

    recontextualize = newKeyContext => {
        this.stopSession();
        let { selectedSong, chart } = this.state;

        chart.context = newKeyContext;
        
        StorageHelper.updateChartSettings(selectedSong.id, {
            context: newKeyContext
        });
    }

    resetTempo = newTempo => {
        this.stopSession();
        let { selectedSong, chart } = this.state;

        chart.tempo = newTempo;

        StorageHelper.updateChartSettings(selectedSong.id, {
            tempo: newTempo
        });
    }

    /**********************
        SONG LIST PANEL   
    **********************/

    onSongListItemClick = selectedSongId => {
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