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
            score: {},
            midiSettingsModalOpen: true            
        };
    }

    componentWillMount() {
        let { SoundActions, StorageHelper } = this.props;
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
            .then(selectedSong => {
                if (selectedSong) {
                    return new Promise(resolve => this.setState({ 
                        songBase: selectedSong,
                        sessionSong: MusicHelper.getSessionSong(selectedSong) 
                    }, resolve));
                }
            })
            .then(() => {
                this.refreshScore();
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
                        startSession={() => SoundActions.playScore(this.state.score)} />
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
    
    refreshScore = () => {
        let { sessionSong } = this.state;
        let pianoPart = MusicHelper.composePianoAccompanimentV0(sessionSong.chart);
        this.setState({ score: pianoPart });
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