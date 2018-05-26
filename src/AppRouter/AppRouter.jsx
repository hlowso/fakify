import React, { Component } from "react";
import { Switch, Route, Redirect } from "react-router";

import PlayViewController from "../ViewControllers/PlayViewController/PlayViewController";

import * as StorageHelper from "../shared/StorageHelper";

import WebAudioFontPlayer from "webaudiofont";
import _tone_0000_Aspirin_sf2_file from "../midi/0000_Aspirin_sf2_file";


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

        var AudioContextFunc = window.AudioContext || window.webkitAudioContext;
        var audioContext = new AudioContextFunc();
        
        var player = new WebAudioFontPlayer();
        // player.loader.decodeAfterLoading(audioContext, "_tone_0000_Aspirin_sf2");

        let info = player.loader.instrumentInfo(0);
        console.log(info);

        player.loader.startLoad(audioContext, "/0000_Aspirin_sf2_file.js", info.variable);
        player.loader.waitLoad(() => {
            // console.log("cached", info.variable);
            player.queueWaveTable(audioContext, audioContext.destination, window[info.variable], 0, 55, 2);

            console.log("from import", _tone_0000_Aspirin_sf2_file);
            console.log("from lib", window[info.variable]);
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
                // if (velocity) MIDI.noteOn(0, note, velocity, 0);
                // else MIDI.noteOff(0, note, 0);
                break;
            case 128:
                // MIDI.noteOff(0, note, 0);
                break;
        }
    };

};

export default AppRouter;