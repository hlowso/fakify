import React, { Component } from "react";
import { Button } from "react-bootstrap";
import Modal from "react-modal";

import SongListPanel from "../../Components/SongListPanel/SongListPanel";
import ChartViewer from "../../Components/ChartViewer/ChartViewer";
import Keyboard from "../../Components/Keyboard/Keyboard";

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
            // songTitles is hard-coded for now
            // TODO: create an endpoint for songtitles
            songTitles: [
                "#4",
                "'Round Midnight",
                "Bewitched",
                "Bye Bye Blackbird",
                "C Blues",
                "Giant Steps",                
                "Michelle",
                "My Favourite Things",
                "Now's The Time",
                "Someday My Prince Will Come"
            ],

            // selectedSong is hard-coded for now
            // TODO: create an endpoint for selectedSong
            selectedSong: {
                title: "C Blues",
                timeSignature: [4, 4],
                originalKey: "C",
                originalTempo: 120,
                key: "C",
                tempo: 120,
                chart: {
                    progression: {
                        1: { 1: "1^7" },
                        2: { 1: "4^7" },
                        3: { 1: "1^7" },
                        4: { 1: "1^7" },
                        5: { 1: "4^7" },
                        6: { 1: "4^7" },
                        7: { 1: "1^7" },
                        8: { 1: "1^7" },
                        9: { 1: "5^7" },
                        10: { 1: "4^7" },
                        11: { 1: "1^7" },
                        12: { 1: "2^-7", 3: "5^7" },
                    },
                    keys: { 
                        1: "1^7", 
                        2: "4^7", 
                        3: "1^7", 
                        5: "4^7", 
                        7: "1^7", 
                        9: "5^7", 
                        10: "4^7", 
                        11: "1^7", 
                        12: "1^ma7"
                    },
                    sections: {

                    }
                }
            }
        };
    }

    componentDidMount() {
        console.log("PRECOMP - playviewcontroller Did mount");
        let { midiInputSettings } = this.state;
        let { inputId } = midiInputSettings;
        let stateUpdate = { loading: false };

        MIDI.loadPlugin({
            soundfontUrl: "./soundfont/",
            instruments: ["acoustic_grand_piano"],
            onsuccess: () => {
                LoadGrand(MIDI);

                MIDI.setContext(new AudioContext(), () => {

                    // Setting a note just to make sure midi output is working
                    MIDI.noteOn(0, 60, 127, 0);
                    
                    let midiAccessCallback;

                    if (inputId) {
                        // TODO: refactor the one-at-a-time nature of getMIDIAccess followed by setupMIDIInput
                        midiAccessCallback = () => this.setupMIDIInput(inputId);
                    } else {
                        this.setState({ midiSettingsModalOpen: true, loading: false });
                    }

                    this.getMIDIAccess(midiAccessCallback);

                });
                
            }
        });
    }

    render() {
        let { loading, songTitles, selectedSong } = this.state;
        return loading ? <h1>loading...</h1> : (
            <div id="play-view">
                <div className={"top-row"}>
                    <SongListPanel 
                        songTitles={songTitles}
                        selectedTitle={selectedSong.title} />
                    <ChartViewer
                        song={selectedSong} />
                </div>
                <div className={"bottom-row"}>
                    <Keyboard />
                </div>

                {this.renderMIDISettingsModal()}
            </div>
        ); 
    }

    renderMIDISettingsModal() {
        let onSubmitWrapper = event => { 
            event.preventDefault(); 
            this.setupMIDIInput(event.target.midiInput.value); 
            this.closeModal(); 
        }

        let { requestingMIDIAccess, midiAccess } = this.state;
        let inputRadioButtons = [], form, inputs;

        if (midiAccess) {
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

    getMIDIAccess = callback => {
        this.setState({ requestingMIDIAccess: true });
        navigator.requestMIDIAccess()
            .then(midiAccess => { 
                    this.setState({ midiAccess, requestingMIDIAccess: false });
                    if (typeof callback === "function") callback(); 
                },
                () => console.log("PRECOMP - navigator.requestMIDIAccess failed")
            );
    }

    setupMIDIInput = inputId => {
        let { midiAccess } = this.state;
        let inputs = midiAccess.inputs.values();    

        for( let input = inputs.next(); input && !input.done; input = inputs.next()) {
            if (inputId === input.value.id) {
                input.value.onmidimessage = this.playMidiMessage;
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
    }
}

export default PlayViewController;