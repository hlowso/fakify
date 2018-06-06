import React, { Component } from "react";

import MenuBar from "../../views/MenuBar/MenuBar";
import SongListPanel from "../../views/SongListPanel/SongListPanel";
import ChartViewer from "../../views/ChartViewer/ChartViewer";
import TrainingWindow from "../../views/TrainingWindow/TrainingWindow"
import Keyboard from "../../views/Keyboard/Keyboard";
import MidSettingsModal from "../../views/MidiSettingsModal/MidiSettingsModal";

import * as Api from "../../../shared/Api";
import * as MusicHelper from "../../../shared/music/MusicHelper";

import "./PlayViewController.css";

class PlayViewController extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loadingSelectedSong: false,
            songTitles: {},
            songBase: {},
            sessionSong: {},
            take: {},
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
                    return new Promise(resolve => this.setState({ 
                        songBase: selectedSong,
                        sessionSong: MusicHelper.contextualize(selectedSong) 
                    }, resolve));
                }
            })
            .then(() => {
                this.refreshTake();
            });
    }

    render() {
        let { SoundActions, StorageHelper, StateHelper } = this.props;
        let { songTitles, selectedSong, midiSettingsModalOpen, sessionSong } = this.state;
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
                        song={sessionSong} />
                    <TrainingWindow  
                        startSession={this.startSession} />
                </div>
                <div className="bottom-row">
                    <Keyboard />
                </div>

                <MidSettingsModal 
                    SoundActions={SoundActions} 
                    StorageHelper={StorageHelper}
                    StateHelper={StateHelper} 
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
        let callback = data => console.log("PLAYSCORE DATA", data)
        this.SoundActions.playTake(this.state.sessionSong.tempo, this.state.take, callback);
    }
    
    refreshTake = () => {
        let { sessionSong, feel } = this.state;

        let take = MusicHelper.compAll(sessionSong, feel);
        this.setState({ take });
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