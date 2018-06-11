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

import "./PlayViewController.css";

class PlayViewController extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loadingSelectedSong: false,
            songTitles: {},
            sessionSong: {},
            take: {},
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
            .then(selectedSong => {
                if (selectedSong) {
                    let sessionSong = MusicHelper.contextualize(selectedSong);
                    let songSettings = StorageHelper.getSongSettings(sessionSong.id);

                    console.log("settings", songSettings);

                    if (songSettings) {
                        sessionSong = { ...sessionSong, ...songSettings };
                    } 
                    return new Promise(resolve => this.setState({ 
                        sessionSong,
                        currentKey: selectedSong.originalKeySignature 
                    }, resolve));
                }
            })
            .then(() => {
                this.refreshTake();
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
                        resetTempo={this.resetTempo} />
                    <TrainingWindow  
                        startSession={this.startSession} 
                        stopSession={this.stopSession} />
                </div>
                <div className="bottom-row">
                    <Keyboard 
                        depressedKeys={this.StateHelper.getCurrentUserKeysDepressed()} 
                        currentKey={currentKey} 
                        playUserMidiMessage={this.SoundActions.playUserMidiMessage} 
                        takeIsPlaying={this.StateHelper.getState().isPlaying} />
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

    startSession = () => {
        let { sessionSong, take } = this.state;
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

        this.SoundActions.playTake(sessionSong.tempo, take, onQueue);
    }

    stopSession = () => {
        this.setState({ chartIndex: {}, currentKey: "" });
        this.SoundActions.killTake();
    }
    
    refreshTake = () => {
        let { sessionSong, feel } = this.state;

        let take = MusicHelper.compAll(sessionSong, feel);
        this.setState({ take });
    }

    recontextualize = newKeySignature => {
        let { sessionSong } = this.state;
        
        this.setState({ 
            sessionSong: MusicHelper.contextualize(sessionSong, newKeySignature) 
        }, this.refreshTake);

        this.StorageHelper.setSongSettings(sessionSong.id, {
            tempo: sessionSong.tempo,
            keySignature: newKeySignature
        });
    }

    resetTempo = newTempo => {
        let { sessionSong } = this.state;
        let sessionSongUpdate = Util.copyObject(sessionSong);
        sessionSongUpdate.tempo = newTempo;
        this.setState({ sessionSong: sessionSongUpdate });

        this.StorageHelper.setSongSettings(sessionSong.id, {
            tempo: newTempo,
            keySignature: sessionSong.keySignature
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