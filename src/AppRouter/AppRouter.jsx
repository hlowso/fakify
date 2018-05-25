import React, { Component } from "react";
import { Switch, Route, Redirect } from "react-router";

import PlayViewController from "../ViewControllers/PlayViewController/PlayViewController";

import * as StorageHelper from "../shared/StorageHelper";

import MIDI from "../midi/midi";
import loadSoundfonts from "../midi/loadSoundfonts";


class AppRouter extends Component {
    constructor(props) {
        super(props);

        // So the state of the AppRouter will be the global state
        // until I decide to do something else. This means that all helper
        // functions for getting and setting global vars must be written
        // as AppRouter class methods.
        this.state = {
            loading: true,
            midiAccess: null,
        };
    }

    componentWillMount() {
        let midiInputId = StorageHelper.getMidiInputId();
        let stateUpdate = { loading: false }

        this.setMidiContextAsync()
            .then(() => {
                return this.requestMidiAccessAsync();
            })
            .then(midiAccess => {
                if (midiAccess) {
                    stateUpdate.midiAccess = midiAccess;
                }
                this.setState(stateUpdate);
            });
    }

    render() {
        let { loading } = this.state;

        let MidiActions = {
            setMidiContextAsync: this.setMidiContextAsync,
            requestMidiAccessAsync: this.requestMidiAccessAsync,
            connectToMidiInput: this.connectToMidiInput,
            playMidiMessage: this.playMidiMessage
        };

        let StateHelper = {
            getMidiAccess: this.getMidiAccess,
            setMidiAccess: this.setMidiAccess
        };

        let VCProps = {
            MidiActions,
            StateHelper,            
            StorageHelper
        };

        return loading
                ? <h1>loading...</h1> 
                : (
                    <Switch id="app-router">
                        <Route 
                            exact
                            path="/play" 
                            render={ () => <PlayViewController {...VCProps}/> }
                        />
                        <Route 
                            path="/" 
                            render={ () => <Redirect to="/play" /> }
                        />
                    </Switch>
                );
    }

    /*******************
        STATE HELPER   
    *******************/

    setMidiAccess = midiAccess => {
        this.setState({ midiAccess });
    }

    getMidiAccess = () => {
        return this.state.midiAccess;
    }

    /*******************
        MIDI ACTIONS   
    *******************/

    setMidiContextAsync = () => {
        return new Promise((resolve, reject) => {
            MIDI.loadPlugin({
                soundfontUrl: "./soundfont/",
                instruments: ["acoustic_grand_piano"],
                onsuccess: () => {
                    loadSoundfonts(MIDI);
                    MIDI.setContext(new AudioContext(), resolve);
                }
            });
        });
    }

    requestMidiAccessAsync = () => {
        return new Promise((resolve, reject) => {
            navigator.requestMIDIAccess()
            .then(midiAccess => { 
                    resolve(midiAccess);
                },
                () => { 
                    console.log("PRECOMP - navigator.requestMIDIAccess() failed");
                    reject();
                }
            );
        });
    }

    connectToMidiInput = inputId => {
        if (!inputId) return false;

        let { midiAccess } = this.state;
        if (!midiAccess) return false;

        let inputs = midiAccess.inputs.values();  
        let connectionSuccessful = false;  

        for( 
            let input = inputs.next(); 
            input && !input.done; 
            input = inputs.next()
        ) {
            if (inputId === input.value.id) {
                input.value.onmidimessage = this.playMidiMessage;
                connectionSuccessful = true;
            } else {
                input.value.onmidimessage = null;
            }
        }

        return connectionSuccessful;
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

};

export default AppRouter;