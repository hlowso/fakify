import React, { Component } from "react";
import { Switch, Route, Redirect } from "react-router";

import PlayViewController from "../ViewControllers/PlayViewController/PlayViewController";

import * as StorageHelper from "../shared/StorageHelper";

import WebAudioFontPlayer from "webaudiofont";

const soundfonts = {

    // TODO: steps for adding another instrument to the project:
    //  1. add the sf2.js file to publc/soundfonts
    //  2. add the instrument to the soundfonts object in the
    //  following format

    piano: {
        name: "piano",
        variable: "_tone_0000_Aspirin_sf2_file",
        url: "/soundfonts/0000_Aspirin_sf2_file.js"
    },

    bassDrum: {
        name: "bassDrum",
        variable: "_drum_35_0_SBLive_sf2",
        url: "/soundfonts/drums/12835_0_SBLive_sf2.js"
    }
}

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
            audioContext: null,
            player: null,

            // Unfortunately, it seems that WebAudioFont forces the developer to 
            // manage their own sound envelopes ...
            envelopes: {}
        };
    }

    componentWillMount() {
        let midiInputId = StorageHelper.getMidiInputId();

        this.audioInitAsync()
            .then(() => {
                return this.loadInstrumentsAsync();
            })
            .then(() => {
                this.state.player.queueWaveTable(this.state.audioContext, this.state.audioContext.destination, window[soundfonts["bassDrum"].variable], 0, 35, 2, 1);
                return this.setMidiAccessAsync();
            })
            .then(() => {
                if (midiInputId) {
                    let connectionSuccessful = this.connectToMidiInput(midiInputId);
                    if (!connectionSuccessful) {
                        StorageHelper.setMidiInputId("");
                    }
                }
                this.setState({ loading: false });
            });
    }

    render() {
        let { loading } = this.state;

        let MidiActions = {
            setMidiContextAsync: this.setMidiContextAsync,
            setMidiAccessAsync: this.setMidiAccessAsync,
            connectToMidiInput: this.connectToMidiInput,
            generateMidiMessagePlayer: this.generateMidiMessagePlayer
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

    /********************
        AUDIO ACTIONS   
    ********************/

    audioInitAsync = () => {
        return new Promise((resolve, reject) => {
            let AudioContextFunc = window.AudioContext || window.webkitAudioContext;
            let audioContext = new AudioContextFunc();
            let player = new WebAudioFontPlayer();

            this.setState({ audioContext, player }, resolve);
        });
    }

    loadInstrumentAsync = instrument => {
        let { audioContext, player } = this.state;
        let font = soundfonts[instrument];

        return new Promise((resolve, reject) => {
            if (!audioContext) reject("PRECOMP - attempted to load instrument with unset AudioContext");

            player.loader.startLoad(audioContext, font.url, font.variable);
            player.loader.waitLoad(resolve);
        });
    }

    loadInstrumentsAsync = () => {
        return Promise.all([
            this.loadInstrumentAsync("piano"),
            this.loadInstrumentAsync("bassDrum")
        ]);
    }

    /*******************
        MIDI ACTIONS   
    *******************/

    setMidiAccessAsync = () => {
        return new Promise((resolve, reject) => {
            navigator.requestMIDIAccess()
            .then(midiAccess => { 
                    this.setState({ midiAccess }, resolve);
            });
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
                input.value.onmidimessage = this.generateMidiMessagePlayer("piano");
                connectionSuccessful = true;
            } else {
                input.value.onmidimessage = null;
            }
        }

        return connectionSuccessful;
    }

    generateMidiMessagePlayer = instrument => {
        return message => {
            let { player, audioContext, envelopes } = this.state;
            let { data } = message;
            let type = data[0], note = data[1], volume = data[2] / 127;
            let envelopesUpdate = envelopes;
            let existingEnvelop = envelopes[note];

            switch(type) {
                case 144:
                    if (volume) {
                        envelopesUpdate[note] = player.queueWaveTable(
                            audioContext, 
                            audioContext.destination, 
                            window[soundfonts[instrument].variable], 
                            0, 
                            note,
                            1000,
                            volume
                        );
                    }
                    else {
                        if (existingEnvelop) {
                            existingEnvelop.cancel();
                            envelopesUpdate[note] = null;
                        }
                    }
                    break;

                case 128:
                    if (existingEnvelop) {
                        existingEnvelop.cancel();
                        envelopesUpdate[note] = null;
                    }
                    break;

                default:
                    console.log("PRECOMP - unknown midi message type:", type);
            }

            this.setState({ envelopes: envelopesUpdate });
        };
    }
};

export default AppRouter;