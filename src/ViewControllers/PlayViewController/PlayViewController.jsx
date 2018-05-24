import React, { Component } from "react";
import { Button } from "react-bootstrap";
import Modal from "react-modal";

import MenuBar from "../../Components/MenuBar/MenuBar";
import SongListPanel from "../../Components/SongListPanel/SongListPanel";
import ChartViewer from "../../Components/ChartViewer/ChartViewer";
import Keyboard from "../../Components/Keyboard/Keyboard";

import * as Api from "../../shared/Api";
import * as StorageHelper from "../../shared/StorageHelper";

// import Soundfont from "soundfont-player";
import MIDI from "midi.js";
import LoadGrand from "./soundfonts/acoustic_grand_piano-ogg";

import "./PlayViewController.css";

Modal.setAppElement("#root");

class PlayViewController extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            midiSettingsModalOpen: false,
            midiInputSettings: {
                inputId: ""
            },
            songTitles: null,
            selectedSong: null,
        };
    }

    componentWillMount() {
        console.log("PRECOMP - playviewcontroller Will mount");

        let localStorage = StorageHelper.getLocalStorage();
        let { 
            midiInputId, 
            selectedSong 
        } = localStorage;

        let stateUpdate = {
            songTitles: Api.getSongTitles(),
            midiInputId,
            selectedSong
        }; 
        
        this.setState(stateUpdate);

        this.setMidiContext()
            .then(() => {
                return this.getMidiAccess();
            })
            .then(midiAccess => {
                if (midiAccess) {
                    stateUpdate = { loading: false }
                    if (midiInputId) {
                        this.connectToMidiInput(midiInputId);
                    } else {
                        stateUpdate.midiSettingsModalOpen = true;
                    }
                    this.setState(stateUpdate);
                }
            });
    }

    render() {
        let { loading, songTitles, selectedSong } = this.state;
        let selectedSongTitle = selectedSong ? selectedSong.title : null;

        return loading ? <h1>loading...</h1> : (
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
        let onSubmitWrapper = event => { 
            event.preventDefault(); 
            this.connectToMidiInput(event.target.midiInput.value); 
            this.closeModal(); 
        }

        let { requestingMIDIAccess, midiAccess } = this.state;
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
                <form onSubmit={onSubmitWrapper}>
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
                {requestingMIDIAccess 
                    ? <p>Getting midi access</p>
                    : inputRadioButtons
                        ? form 
                        : <p>No midi inputs available!</p>
                }
                
                <Button onClick={this.closeModal} >Done</Button>
                <Button onClick={this.getMIDIAccess}>Refresh</Button>
            </Modal>
        ); 
    }

    closeModal = () => {
        this.setState({ midiSettingsModalOpen: false });
    }

    /*******************
        MIDI ACTIONS   
    *******************/

    setMidiContext = () => {
        return new Promise((resolve, reject) => {
            MIDI.loadPlugin({
                soundfontUrl: "./soundfont/",
                instruments: ["acoustic_grand_piano"],
                onsuccess: () => {
                    LoadGrand(MIDI);
                    MIDI.setContext(new AudioContext(), resolve);
                }
            });
        });
    }

    getMidiAccess = () => {
        this.setState({ requestingMIDIAccess: true });
        return new Promise((resolve, reject) => {
            navigator.requestMIDIAccess()
            .then(midiAccess => { 
                    this.setState({ midiAccess, requestingMIDIAccess: false });
                    resolve(midiAccess);
                },
                () => { 
                    console.log("PRECOMP - navigator.requestMIDIAccess failed");
                    reject();
                }
            );
        });
        
    }

    connectToMidiInput = inputId => {
        let { midiAccess } = this.state;
        let inputs = midiAccess.inputs.values();    
    
        for( let input = inputs.next(); input && !input.done; input = inputs.next()) {
            if (inputId === input.value.id) {
                input.value.onmidimessage = this.playMidiMessage;
            } else {
                input.value.onmidimessage = null;
            }
        }
    }
    
    playMidiMessage = message => {
        let { data } = message;
        let type = data[0], note = data[1], velocity = data[2];

        switch(type) {
            case 144:
                if (velocity) MIDI.noteOn(0, note, velocity, 0);
                else MIDI.noteOff(0, note, 0);
                break;
            case 128:
                MIDI.noteOff(0, note, 0);
                break;
        }
    };

    
}

export default PlayViewController;