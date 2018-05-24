import React, { Component } from "react";
import { Button } from "react-bootstrap";
import Modal from "react-modal";

import MenuBar from "../../Components/MenuBar/MenuBar";
import SongListPanel from "../../Components/SongListPanel/SongListPanel";
import ChartViewer from "../../Components/ChartViewer/ChartViewer";
import Keyboard from "../../Components/Keyboard/Keyboard";

import * as Api from "../../shared/Api";
import * as StorageHelper from "../../shared/StorageHelper";

import "./PlayViewController.css";

Modal.setAppElement("#root");

class PlayViewController extends Component {
    constructor(props) {
        super(props);
        this.state = {
            midiSettingsModalOpen: true,
            requestingMidiAccess: false,
            songTitles: [],
            selectedSong: {
                chart: {}
            },
        };
    }

    render() {
        let { songTitles, selectedSong } = this.state;
        let selectedSongTitle = selectedSong ? selectedSong.title : null;

        return (
            <div id="play-view">
                <div>
                    <MenuBar 
                        openMIDISettingsModal={() => this.setState({ midiSettingsModalOpen: true })} />
                </div>
                <div className="top-row">
                    <SongListPanel 
                        songTitles={songTitles}
                        selectedTitle={selectedSongTitle} />
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

    // TODO refactor the midi settings modal render function
    // TODO style the Modal
    renderMIDISettingsModal() {
        let { 
            StateHelper,
            StorageHelper,
            MidiActions 
        } = this.props;

        let midiAccess = StateHelper.getMidiAccess();
        let { requestingMidiAccess } = this.state;

        let inputRadioButtons = [], form, inputs;

        if (midiAccess && midiAccess.inputs) {
            inputs = midiAccess.inputs.values();  

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
                isOpen={this.state.midiSettingsModalOpen}
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
        let { MidiActions, StateHelper } = this.props;

        this.setState({ requestingMidiAccess: true });
        MidiActions.requestMidiAccessAsync()
            .then(midiAccess => {
                StateHelper.setMidiAccess(midiAccess);
                this.setState({ requestingMidiAccess: false });
            });
    }

    onSubmitMidiSettingsForm = event => { 
        event.preventDefault(); 
        
        let { MidiActions } = this.props;
        let { value } = event.target.midiInput;

        MidiActions.connectToMidiInput(value); 
        this.closeModal(); 
    }

    closeModal = () => {
        this.setState({ midiSettingsModalOpen: false });
    }
    
}

export default PlayViewController;