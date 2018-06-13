import React, { Component } from "react";
import { Switch, Route, Redirect } from "react-router";
import WebAudioFontPlayer from "webaudiofont";
import uuid from "uuid";

import PlayViewController from "../ViewControllers/PlayViewController/PlayViewController";

import * as StorageHelper from "../../shared/StorageHelper";
import * as MusicHelper from "../../shared/music/MusicHelper";
import * as Util from "../../shared/Util";
import soundfonts from "../../shared/music/soundfontsIndex";

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
            userPlayer: null,
            userInstrument: "piano",
            isPlaying: false,
            envelopes: {}
        };

        this.WAIT_TIME_FRACTION = 4 / 5;
        this.WAIT_TIME_FACTOR = 1000 * this.WAIT_TIME_FRACTION;
        this.SHORTENED_WAIT_TIME_FACTOR = 1 / this.WAIT_TIME_FRACTION;
        this.TIME_CHECKER_RATE = 5;
    }

    componentWillMount() {
        let midiInputId = StorageHelper.getMidiInputId();

        this._audioInitAsync()
            .then(() => this._loadInstrumentsAsync())
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

    render() {
        let { loading } = this.state;

        let SoundActions = {
            setMidiContextAsync: this.setMidiContextAsync,
            setMidiAccessAsync: this.setMidiAccessAsync,
            connectToMidiInput: this.connectToMidiInput,
            generateMidiMessagePlayer: this.generateMidiMessagePlayer,
            playTake: this.playTake,
            killTake: this.killTake,
            playUserMidiMessage: this.playUserMidiMessage
        };

        let StateHelper = {
            getState: () => this.state,
            getMidiAccess: this.getMidiAccess,
            setMidiAccess: this.setMidiAccess,
            getCurrentUserKeysDepressed: this.getCurrentUserKeysDepressed
        };

        let VCProps = {
            SoundActions,
            StateHelper,            
            StorageHelper
        };

        return loading
                ? <h1>loading...</h1> 
                : (
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

    getCurrentUserKeysDepressed = () => {
        return Object.keys(this.state.envelopes).map(key => Number(key));
    }

    /********************
        SOUND ACTIONS   
    ********************/

    _audioInitAsync = () => {
        return new Promise((resolve, reject) => {
            let audioContext = new (window.AudioContext || window.webkitAudioContext)();
            let userPlayer = new WebAudioFontPlayer();
            let player = new WebAudioFontPlayer();

            this.setState({ 
                audioContext, 
                userPlayer, 
                player
            }, resolve);
        });
    }

    _loadInstrumentAsync = instrument => {
        let { audioContext, userPlayer, player } = this.state;
        let font = soundfonts[instrument];

        return new Promise((resolve, reject) => {
            if (!audioContext) reject("PRECOMP - attempted to load instrument with unset AudioContext");

            userPlayer.loader.startLoad(audioContext, font.url, font.variable);
            player.loader.startLoad(audioContext, font.url, font.variable);
            
            userPlayer.loader.waitLoad(resolve);
            player.loader.waitLoad(resolve);
        });
    }

    _loadInstrumentsAsync = () => {
        return Promise.all(Object.keys(soundfonts).map(instrument => this._loadInstrumentAsync(instrument)));
    }

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
                input.value.onmidimessage = this.playUserMidiMessage;
                connectionSuccessful = true;
            } else {
                input.value.onmidimessage = null;
            }
        }

        return connectionSuccessful;
    }

    playUserMidiMessage = message => {
        let { userPlayer, userInstrument, audioContext, envelopes } = this.state;
        let { data } = message;
        let type = data[0], note = data[1], volume = data[2] / 127;
        let envelopesUpdate = Util.copyObject(envelopes);
        let existingEnvelop = envelopes[note];

        let noteOff = (existingEnvelop, envelopesUpdate) => {
            if (existingEnvelop) {
                existingEnvelop.cancel();
                delete envelopesUpdate[note];
            }
        }

        switch(type) {
            case 144:
                if (volume) {
                    envelopesUpdate[note] = userPlayer.queueWaveTable(
                        audioContext, 
                        audioContext.destination, 
                        window[soundfonts[userInstrument].variable], 
                        0, 
                        note,
                        1000,
                        volume
                    );
                }
                else {
                    noteOff(existingEnvelop, envelopesUpdate);
                }
                break;

            case 128:
                noteOff(existingEnvelop, envelopesUpdate);
                break;

            default:
                console.log("PRECOMP - unknown midi message type:", type);
        }

        this.setState({ envelopes: envelopesUpdate });
    }

    _createQueueableSegmentsGenerator = function* (sessionId, tempo, take) {
        let barIndex = 0;
        let chordEnvelopeIndex = 0;
    
        while (true) {
            let { barSubdivision, timeSignature, musicSegments } = take[barIndex]; 
            let timeFactor = 60 / ( barSubdivision * (tempo[0] / ( timeSignature[0] * ( tempo[1] / timeSignature[1] ))));
    
            yield { ...musicSegments[chordEnvelopeIndex], timeFactor, barIndex, chordEnvelopeIndex, sessionId };
    
            chordEnvelopeIndex += 1;
            if (chordEnvelopeIndex >= take[barIndex].musicSegments.length) {
                chordEnvelopeIndex = 0;
                do {
                    barIndex = (barIndex + 1) % take.length;
                } while (!take[barIndex].withinRange)
            }
        }
    }

    playTake = (tempo, take, onQueue) => {
        let { audioContext, player } = this.state;
        let sessionId = uuid();
        let segments = this._createQueueableSegmentsGenerator(sessionId, tempo, take);
        let prevQueueTime = audioContext.currentTime;

        let queue = shortenedWaitTime => {
            setTimeout(() => {
                let queueTime = prevQueueTime + (shortenedWaitTime * this.SHORTENED_WAIT_TIME_FACTOR) / 1000;
                let getUpdate = () => audioContext.currentTime > queueTime;

                Util.waitFor(getUpdate, this.TIME_CHECKER_RATE).then(() => {
                    let segment = segments.next();
                    let { 
                        parts, 
                        durationInSubbeats, 
                        timeFactor,
                        barIndex,
                        chordEnvelopeIndex,
                        sessionId 
                    } = segment.value;

                    let stateSessionId = this.state.sessionId;

                    if (stateSessionId && stateSessionId === sessionId) {
                        let { currentTime } = audioContext;

                        onQueue({
                            barIndex,
                            chordEnvelopeIndex
                        });
        
                        Object.keys(parts).forEach(instrument => {
                            let part = parts[instrument];
        
                            if (part) {
                                part.forEach(stroke => {
                                    stroke.notes.forEach(note => {
                                        player.queueWaveTable(
                                            audioContext, 
                                            audioContext.destination, 
                                            window[soundfonts[instrument].variable], 
                                            currentTime + timeFactor * stroke.subbeatOffset, 
                                            note,
                                            timeFactor * stroke.durationInSubbeats,
                                            stroke.velocity
                                        );
                                    });
                                });
                            }
                        });

                        prevQueueTime = currentTime;
                        queue(timeFactor * durationInSubbeats * this.WAIT_TIME_FACTOR);
                    }
                });
            }, shortenedWaitTime);
        };

        this.setState({ sessionId }, () => queue(0));
    }

    killTake = () => {
        this.state.player.cancelQueue(this.state.audioContext);
        this.setState({ sessionId: null });
    }
};

export default AppRouter;