import React, { Component } from "react";
import { Switch, Route, Redirect } from "react-router";

import WebAudioFontPlayer from "webaudiofont";

import PlayViewController from "../ViewControllers/PlayViewController/PlayViewController";

import * as StorageHelper from "../../shared/StorageHelper";
import * as Util from "../../shared/Util";
import soundfonts from "../../shared/soundfontsIndex";

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
            playing: true,

            // Unfortunately, it seems that WebAudioFont forces the developer to 
            // manage their own sound envelopes ...
            envelopes: {}
        };
    }

    componentWillMount() {
        let midiInputId = StorageHelper.getMidiInputId();

        this.audioInitAsync()
            .then(() => this.loadInstrumentsAsync())
            .then(() => this.setMidiAccessAsync())
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

    componentDidMount() {
        // ------------

        console.log("compdidmount");

        Util.waitFor(() => this.musicTarget, 500)
            .then(() => {
                let arr = [3, 4, 7, 8, 10, 15];
                let target = this.musicTarget;

                for (let a of arr) {
                    target.addEventListener(`queue:${a}`, () => {
                        console.log("HANDLING", a, "OUTPUT:", a*a - 10);
                    }, { once: true });
                }

                console.log("Added event listeners", target);

                let counter = 0;
                // setInterval(() => {
                //     console.log("BEAT", counter);
                //     let event = document.createEvent("Event");
                //     event.initEvent(`queue:${counter}`, true, true);
                //     target.dispatchEvent(event);
                //     counter++;
                // }, 1000);
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
                    <div id="app-router">
                        <Switch>
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
                        {this.renderMusicTarget()}
                    </div>
                );
    }

    renderMusicTarget() {
        console.log("rendermusictarget");
        
        this.musicTarget = React.createRef();
        return this.state.playing && <span id="music-target" ref={current => this.musicTarget = current} />;
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
        return Promise.all(Object.keys(soundfonts).map(instrument => this.loadInstrumentAsync(instrument)));
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