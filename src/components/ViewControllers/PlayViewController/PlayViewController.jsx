import React, { Component } from "react";

import MenuBar from "../../views/MenuBar/MenuBar";
import SongListPanel from "../../views/SongListPanel/SongListPanel";
import ChartViewer from "../../views/ChartViewer/ChartViewer";
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
            selectedSong: {},
            sessionSong: {},
            midiSettingsModalOpen: true            
        };
    }

    componentWillMount() {
        let { MidiActions, StorageHelper } = this.props;
        let midiInputId = StorageHelper.getMidiInputId();
        let selectedSongId = StorageHelper.getSelectedSongId();

        if (midiInputId) {
            let connectionSuccessful = MidiActions.connectToMidiInput(midiInputId);
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
                    this.setState({ 
                        selectedSong,
                        sessionSong: MusicHelper.getSessionSong(selectedSong) 
                    });
                }
            });
    }

    render() {
        let { MidiActions, StorageHelper, StateHelper } = this.props;
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
                </div>
                <div className="bottom-row">
                    <Keyboard />
                </div>

                <MidSettingsModal 
                    MidiActions={MidiActions} 
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

    /**********************
        SONG LIST PANEL   
    **********************/

    onSongListItemClick = selectedSongId => {
        let { StorageHelper } = this.props;

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