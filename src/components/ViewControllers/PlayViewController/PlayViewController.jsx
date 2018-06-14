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
            sessionSong: {},
            chartIndex: {},
            currentKey: "",
            midiSettingsModalOpen: true,
            feel: "swing"            
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
            .then(songBase => {
                if (songBase) {
                    return new Promise(resolve => this.setState({ 
                        sessionSong: this.prepareSessionSong(songBase)
                    }, resolve));
                }
            });

    }

    render() {
        let { 
            songTitles, 
            selectedSong, 
            midiSettingsModalOpen, 
            sessionSong,
            chartIndex,
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
                        song={sessionSong} 
                        chartIndex={chartIndex} 
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

    prepareSessionSong(songBase) {
        let chartSettings = this.StorageHelper.getSongSettings(songBase.id);
        let { tempo, keySignature, rangeStartIndex, rangeEndIndex } = chartSettings;
        let playMode = this.StorageHelper.getPlayMode();

        let sessionSong = MusicHelper.contextualize(songBase, keySignature);
        if (tempo) sessionSong.chart.tempo = tempo;

        sessionSong.chart.rangeStartIndex = (
            rangeStartIndex 
                ? rangeStartIndex
                : 0 
        );

        sessionSong.chart.rangeEndIndex = (
            rangeEndIndex
                ? rangeEndIndex
                : (playMode === PlayModes.LISTEN_AND_REPEAT)
                    ? 1
                    : sessionSong.chart.barsV1.length - 1
        );

        return sessionSong;
    }

    startSession = () => {
        let { sessionSong, feel } = this.state;
        let onQueue = data => {
            let { barIndex, chordEnvelopeIndex } = data;
            this.setState({ 
                chartIndex: {
                    bar: barIndex,
                    chordEnvelope: chordEnvelopeIndex
                },
                currentKey: sessionSong.chart.barsV1[barIndex].chordEnvelopes[chordEnvelopeIndex].key
            });
        };

        // Prepare the take
        let take = MusicHelper.compAll(sessionSong, feel);

        this.SoundActions.playTake(sessionSong.chart.tempo, take, onQueue);
    }

    stopSession = () => {
        this.setState({ chartIndex: {}, currentKey: "" });
        this.SoundActions.killTake();
    }

    /*******************
        CHART VIEWER
    *******************/

    onBarClick = i => {
        this.stopSession();
        let { sessionSong } = this.state;
        let { rangeEndIndex, rangeStartIndex } = sessionSong.chart;
        let sessionSongUpdate = Util.copyObject(sessionSong);
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

        sessionSongUpdate.chart = {
            ...sessionSong.chart,
            rangeStartIndex: rangeStartIndexUpdate,
            rangeEndIndex: rangeEndIndexUpdate
        };

        this.setState({ 
            sessionSong: sessionSongUpdate 
        });

        this.StorageHelper.updateSongSettings(sessionSong.id, {
            rangeStartIndex: rangeStartIndexUpdate,
            rangeEndIndex: rangeEndIndexUpdate
        });
    }

    recontextualize = newKeySignature => {
        this.stopSession();
        let { sessionSong } = this.state;
        
        this.setState({ 
            sessionSong: MusicHelper.contextualize(sessionSong, newKeySignature) 
        });

        this.StorageHelper.updateSongSettings(sessionSong.id, {
            keySignature: newKeySignature
        });
    }

    resetTempo = newTempo => {
        this.stopSession();
        let { sessionSong } = this.state;
        let sessionSongUpdate = Util.copyObject(sessionSong);
        sessionSongUpdate.chart.tempo = newTempo;

        this.setState({ 
            sessionSong: sessionSongUpdate 
        });

        this.StorageHelper.updateSongSettings(sessionSong.id, {
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