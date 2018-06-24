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
import Chart from "../../../shared/music/Chart";

import "./PlayViewController.css";

class PlayViewController extends Component {

    PRECISION_THRESHOLD = 0.2;

    constructor(props) {
        super(props);
        this.state = {
            loadingSelectedSong: false,
            songTitles: {},
            selectedSong: {},
            chart: {},
            sessionIndex: {},
            currentKey: "",
            midiSettingsModalOpen: true,
            playMode: "improv",
            trainingFeedback: {}          
        };
    }

    componentWillMount() {
        let { SoundActions, StorageHelper, StateHelper } = this.props;
        let midiInputId = StorageHelper.getMidiInputId();
        let selectedSongId = StorageHelper.getSelectedSongId();

        this.SoundActions = SoundActions;
        this.StorageHelper = StorageHelper;
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
        let { 
            songTitles, 
            selectedSong, 
            midiSettingsModalOpen, 
            chart,
            sessionIndex,
            currentKey,
            playMode,
            trainingFeedback 
        } = this.state;

        let selectedSongId = selectedSong ? selectedSong.songId: null;

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
                        currChartIdx={sessionIndex} 
                        recontextualize={this.recontextualize} 
                        resetTempo={this.resetTempo} 
                        onBarClick={this.onBarClick} />
                    <TrainingWindow  
                        startSession={this.startSession} 
                        stopSession={this.stopSession} 
                        setPlayMode={this.setPlayMode} 
                        playMode={playMode} 
                        trainingFeedback={trainingFeedback} />
                </div>
                <div className="bottom-row">
                    <Keyboard 
                        depressedKeys={this.StateHelper.getCurrentUserKeysDepressed()} 
                        currentKey={currentKey} 
                        playUserMidiMessage={this.SoundActions.playUserMidiMessage} 
                        takeIsPlaying={this.StateHelper.getState().sessionId} />
                </div>

                <MidSettingsModal 
                    SoundActions={this.SoundActions} 
                    StorageHelper={this.StorageHelper}
                    StateHelper={this.StateHelper} 
                    isOpen={midiSettingsModalOpen} 
                    close={event => { 
                        event.preventDefault(); 
                        this.setState({ midiSettingsModalOpen: false }); 
                    }} />
            </div>
        ); 
    }

    /*********************
        TRAINING WINDOW
    **********************/

    setPlayMode = playMode => {
        this.setState({ playMode });
    }

    /************
        MUSIC
    ************/

    resetChart = () => {
        let { id, barsBase, originalTempo, originalKeyContext, suitableFeels } = this.state.selectedSong;
        let chartSettings = this.StorageHelper.getChartSettings(id);
        let playMode = this.StorageHelper.getPlayMode();

        let { tempo, keyContext, feel, rangeStartIndex, rangeEndIndex } = chartSettings;
        if (!tempo) {
            tempo = originalTempo;
        }
        if (!keyContext) {
            keyContext = originalKeyContext;
        }
        if (!feel) {
            feel = suitableFeels[0];
        }
        if (!Number.isInteger(rangeStartIndex)) {
            rangeStartIndex = 0;
        }
        if (!Number.isInteger(rangeEndIndex)) {
            rangeEndIndex = (
                (playMode === "listenAndRepeat")
                        ? 1
                        : barsBase.length - 1
            );
        }

        this.setState({ 
            chart: new Chart(
                barsBase, 
                keyContext, 
                tempo, 
                feel,
                this.forceUpdate.bind(this), 
                rangeStartIndex, 
                rangeEndIndex
            ) 
        });
    }

    startSession = () => {
        let { chart, playMode } = this.state;
        let { barsV1, rangeStartIndex } = chart;

        // switch(playMode) {
        //     case "improv":
        //         this.setState({
        //             trainingFeedback: {
        //                 notesOutOfTime: 0,
        //                 notesInKeyAndInTime: 0,
        //                 notesInTime: 0
        //             }
        //         })
        //         this.StateHelper.subscribeToUserSessionKeyStroke(
        //             keyStrokeRecord => {
        //                 let { trainingFeedback, currentKey } = this.state;
        //                 let trainingFeedbackUpdate = Util.copyObject(trainingFeedback);

        //                 if (Math.abs(keyStrokeRecord.precision) > this.PRECISION_THRESHOLD) {
        //                     trainingFeedbackUpdate.notesOutOfTime++;
        //                 } else {
        //                     if (MusicHelper.noteIsInKey(keyStrokeRecord.note, currentKey)) {
        //                         trainingFeedbackUpdate.notesInKeyAndInTime++;
        //                     }
        //                     trainingFeedbackUpdate.notesInTime++;
        //                 }

        //                 this.setState({ trainingFeedback: trainingFeedbackUpdate });
        //             }
        //         );
        //         break;
        // }

        this.SoundActions.playRangeLoop(chart);
    }

    stopSession = () => {
        this.setState({ 
            // sessionIndex: {}, 
            // currentKey: "",
            trainingFeedback: {} 
        });
        this.SoundActions.killTake();
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

        this.StorageHelper.updateChartSettings(selectedSong.id, {
            rangeStartIdx: rangeStartIdxUpdate,
            rangeEndIdx: rangeEndIdxUpdate
        });
    }

    recontextualize = newKeyContext => {
        this.stopSession();
        let { selectedSong, chart } = this.state;

        chart.context = newKeyContext;
        
        this.StorageHelper.updateChartSettings(selectedSong.id, {
            keyContext: newKeyContext
        });
    }

    resetTempo = newTempo => {
        this.stopSession();
        let { selectedSong, chart } = this.state;

        chart.tempo = newTempo;

        this.StorageHelper.updateChartSettings(selectedSong.id, {
            tempo: newTempo
        });
    }

    /**********************
        SONG LIST PANEL   
    **********************/

    onSongListItemClick = selectedSongId => {
        this.StorageHelper.setSelectedSongId(selectedSongId);
        
        Api.getSongAsync(selectedSongId)
            .then(selectedSong => {
                if (selectedSong) {
                    this.setState({ selectedSong });
                }
            });
    }
    
}

export default PlayViewController;