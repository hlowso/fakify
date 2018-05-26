import React, { Component } from "react";
import { Button } from "react-bootstrap";
import Modal from "react-modal";

import MenuBar from "../../views/MenuBar/MenuBar";
import SongListPanel from "../../views/SongListPanel/SongListPanel";
import ChartViewer from "../../views/ChartViewer/ChartViewer";
import Keyboard from "../../views/Keyboard/Keyboard";

import * as Api from "../../../shared/Api";

import "./PlayViewController.css";

Modal.setAppElement("#root");

class PlayViewController extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loadingSelectedSong: false,
            midiSettingsModalOpen: true,
            requestingMidiAccess: false,
            songTitles: {},
            selectedSong: {},
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
                    this.setState({ selectedSong });
                }
            });
    }

    render() {
        let { songTitles, selectedSong } = this.state;
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
                        song={selectedSong} />
                </div>
                <div className="bottom-row">
                    <Keyboard />
                </div>

                {this.renderMIDISettingsModal()}
            </div>
        ); 
    }

    /**************************
        MIDI SETTINGS MODAL   
    **************************/

    // TODO style the Modal
    renderMIDISettingsModal() {
        let { StateHelper } = this.props;

        let midiAccess = StateHelper.getMidiAccess();
        let { midiSettingsModalOpen, requestingMidiAccess } = this.state;

        let inputRadioButtons = [], form;

        if (midiAccess && midiAccess.inputs) {
            let inputs = midiAccess.inputs.values();  

            for( let input = inputs.next(); input && !input.done; input = inputs.next()) {
                let { name, id } = input.value;
                inputRadioButtons.push(
                    <div key={name}>
                        <input type="radio" key={name} name="midiInput" value={id} defaultChecked/>
                        {name}
                    </div>
                );
            }
    
            form = (
                <form onSubmit={this.onSubmitMidiSettingsForm}>
                    {inputRadioButtons}
                    <input type="submit" value="Set Input" />
                </form>
            );
        }

        return (
            <Modal 
                isOpen={midiSettingsModalOpen}
                onRequestClose={this.closeModal}
                contentLabel={"MIDI Input Settings"} >

                <h2>MIDI Settings</h2>

                {requestingMidiAccess 
                    ? <p>Getting midi access</p>
                    : inputRadioButtons
                        ? form 
                        : <p>No midi inputs available!</p>
                }
                
                <Button onClick={this.closeModal} >Done</Button>
                <Button onClick={this.onMidiInputsRefresh}>Refresh</Button>
            </Modal>
        ); 
    }

    onMidiInputsRefresh = event => {
        let { MidiActions } = this.props;

        this.setState({ requestingMidiAccess: true });
        MidiActions.setMidiAccessAsync()
            .then(() => {
                this.setState({ requestingMidiAccess: false });
            });
    }

    onSubmitMidiSettingsForm = event => { 
        event.preventDefault(); 
        
        let { MidiActions, StorageHelper } = this.props;
        let { value } = event.target.midiInput;

        let connectionSuccessful = MidiActions.connectToMidiInput(value); 

        if (connectionSuccessful) {
            StorageHelper.setMidiInputId(value);
            this.closeModal(); 
        } else {
            StorageHelper.setMidiInputId("");
            this.setState({ midiInputConnectionError: "Connection unsuccessful" });
        }
    }

    closeModal = () => {
        this.setState({ midiSettingsModalOpen: false });
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