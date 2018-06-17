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
import PlayModes from "../../../shared/PlayModes";

import "./PlayViewController.css";

class PlayViewController extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loadingSelectedSong: false,
            songTitles: {},
            selectedSong: {},
            sessionChart: {},
            sessionIndex: {},
            currentKey: "",
            midiSettingsModalOpen: true          
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
                    }, this.resetSessionChart);
                }
            });
    }

    render() {
        let { 
            songTitles, 
            selectedSong, 
            midiSettingsModalOpen, 
            sessionChart,
            sessionIndex,
            currentKey 
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
                        chart={sessionChart} 
                        chartIndex={sessionIndex} 
                        recontextualize={this.recontextualize} 
                        resetTempo={this.resetTempo} 
                        onBarClick={this.onBarClick} />
                    <TrainingWindow  
                        startSession={this.startSession} 
                        stopSession={this.stopSession} />
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

    /************
        MUSIC
    ************/

    resetSessionChart() {
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
                (playMode === PlayModes.LISTEN_AND_REPEAT)
                        ? 1
                        : barsBase.length - 1
            );
        }

        let sessionChart = {
            barsV1: MusicHelper.contextualizeBars(
                barsBase,
                keyContext
            ),
            tempo,
            keyContext,
            feel,
            rangeStartIndex,
            rangeEndIndex 
        }

        this.setState({ sessionChart });
    }

    startSession = () => {
        let { sessionChart } = this.state;
        let { barsV1, rangeStartIndex } = sessionChart;

        let onQueue = musicIndex => {
            let { barIdx, chordIdx } = musicIndex;
            let barIndex = barIdx + rangeStartIndex;

            this.setState({ 
                sessionIndex: {
                    bar: barIndex,
                    chordEnvelope: chordIdx
                },
                currentKey: barsV1[barIndex].chordEnvelopes[chordIdx].key
            });
        };

        this.SoundActions.playRangeLoop(sessionChart, onQueue);
    }

    stopSession = () => {
        this.setState({ sessionIndex: {}, currentKey: "" });
        this.SoundActions.killTake();
    }

    /*******************
        CHART VIEWER
    *******************/

    onBarClick = i => {
        this.stopSession();
        let { selectedSong, sessionChart } = this.state;
        let { rangeEndIndex, rangeStartIndex } = sessionChart;
        let sessionChartUpdate = Util.copyObject(sessionChart);
        let withinRange = rangeStartIndex <= i && 
                          i <= rangeEndIndex;

        let rangeStartIndexUpdate = (
            withinRange
                ? i
                : i < rangeStartIndex
                    ? i
                    : rangeStartIndex
        );
        let rangeEndIndexUpdate = (
            withinRange
                ? i
                : rangeEndIndex < i
                    ? i
                    : rangeEndIndex
        );

        sessionChartUpdate = {
            ...sessionChart,
            rangeStartIndex: rangeStartIndexUpdate,
            rangeEndIndex: rangeEndIndexUpdate
        };

        this.setState({ 
            sessionChart: sessionChartUpdate 
        });

        this.StorageHelper.updateChartSettings(selectedSong.id, {
            rangeStartIndex: rangeStartIndexUpdate,
            rangeEndIndex: rangeEndIndexUpdate
        });
    }

    recontextualize = newKeyContext => {
        this.stopSession();
        let { selectedSong, sessionChart } = this.state;
        let sessionChartUpdate = Util.copyObject(sessionChart);

        sessionChartUpdate.keyContext = newKeyContext;
        sessionChartUpdate.barsV1 = MusicHelper.contextualizeBars(
            selectedSong.barsBase,
            newKeyContext
        );
        
        this.setState({ 
            sessionChart: sessionChartUpdate 
        });

        this.StorageHelper.updateChartSettings(selectedSong.id, {
            keyContext: newKeyContext
        });
    }

    resetTempo = newTempo => {
        this.stopSession();
        let { selectedSong, sessionChart } = this.state;
        let sessionChartUpdate = Util.copyObject(sessionChart);

        sessionChartUpdate.tempo = newTempo;

        this.setState({ 
            sessionChart: sessionChartUpdate 
        });

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