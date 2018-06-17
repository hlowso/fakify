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
            userEnvelopes: {},
            onUserSessionKeyStroke: (note, time) => {},
            userSessionRecord: []
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
            playRangeLoop: this.playRangeLoop,
            killTake: this.killTake,
            playUserMidiMessage: this.playUserMidiMessage
        };

        let StateHelper = {
            getState: () => this.state,
            getMidiAccess: this.getMidiAccess,
            setMidiAccess: this.setMidiAccess,
            getCurrentUserKeysDepressed: this.getCurrentUserKeysDepressed,
            subscribeToUserSessionKeyStroke: handler => this.setState({ onUserSessionKeyStroke: handler })
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
        return Object.keys(this.state.userEnvelopes).map(key => Number(key));
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
        let { userPlayer, userInstrument, audioContext, userEnvelopes } = this.state;
        let { data } = message;
        let type = data[0], note = data[1], volume = data[2] / 127;
        let userEnvelopesUpdate = Util.copyObject(userEnvelopes);
        let existingEnvelop = userEnvelopes[note];

        let noteOff = (existingEnvelop, userEnvelopesUpdate) => {
            if (existingEnvelop) {
                existingEnvelop.cancel();
                delete userEnvelopesUpdate[note];
            }
        }

        switch(type) {
            case 144:
                if (volume) {
                    userEnvelopesUpdate[note] = userPlayer.queueWaveTable(
                        audioContext, 
                        audioContext.destination, 
                        window[soundfonts[userInstrument].variable], 
                        0, 
                        note,
                        1000,
                        volume
                    );
                    this.onUserKeyStroke(
                        note,
                        audioContext.currentTime
                    );
                }
                else {
                    noteOff(existingEnvelop, userEnvelopesUpdate);
                }
                break;

            case 128:
                noteOff(existingEnvelop, userEnvelopesUpdate);
                break;

            default:
                console.log("PRECOMP - unknown midi message type:", type);
        }

        this.setState({ userEnvelopes: userEnvelopesUpdate });
    }

    onUserKeyStroke = (note, time) => {
        let { sessionId, onUserSessionKeyStroke } = this.state;

        // If there's a session going, we record
        // the notes the user plays in the userSessionRecord
        // state object
        if (sessionId) {
            
            // And call the user key stroke subscriber's function
            onUserSessionKeyStroke(note, time);
        }
    }

    _createQueueableSegmentsGenerator = function* (sessionId, tempo, musicGenerator) {
        let musicBars;
        let musicIndex = -1;
        let chordPassageIndex = Infinity;
    
        while (true) {   
            // Increment the chord envelope index by 1.             
            // If the chord envelope index has reached the end of the segment,
            // set the chord envelope index to 0 and increment the bar index by 1. 
            // Whenever the bar index lands on 0, we refresh the take.

            chordPassageIndex += 1;
            
            if (musicIndex < 0 || chordPassageIndex >= musicBars[musicIndex].chordPassages.length) {
                chordPassageIndex = 0;
                musicIndex ++;
                if (musicIndex === 0) {
                    musicBars = musicGenerator();
                }
                musicIndex %= musicBars.length;
            }

            // Calculate the time factor
            let { durationInSubbeats, timeSignature, chordPassages } = musicBars[musicIndex]; 
            let subbeatDuration = 60 / ( durationInSubbeats * (tempo[0] / ( timeSignature[0] * ( tempo[1] / timeSignature[1] ))));
    
            // Return the segment
            yield { 
                ...chordPassages[chordPassageIndex], 
                subbeatDuration, 
                musicIndex, 
                chordPassageIndex, 
                sessionId 
            };
        }
    }

    playRangeLoop = (chart, onQueue) => {
        let { audioContext, player } = this.state;
        let sessionId = uuid();

        let segments = this._createQueueableSegmentsGenerator(
            sessionId, 
            chart.tempo, 
            () => MusicHelper.comp(chart)
        );
        let prevQueueTime = audioContext.currentTime;

        let loopedQueue = shortenedWaitTime => {
            setTimeout(() => {
                let queueTime = prevQueueTime + (shortenedWaitTime * this.SHORTENED_WAIT_TIME_FACTOR) / 1000;
                let getUpdate = () => audioContext.currentTime > queueTime;

                Util.waitFor(getUpdate, this.TIME_CHECKER_RATE).then(() => {
                    let segment = segments.next();
                    let { 
                        parts, 
                        durationInSubbeats, 
                        subbeatDuration,
                        musicIndex,
                        chordPassageIndex,
                        sessionId 
                    } = segment.value;

                    let stateSessionId = this.state.sessionId;

                    if (stateSessionId && stateSessionId === sessionId) {
                        onQueue({
                            musicIndex,
                            chordPassageIndex
                        });
        
                        this.queueParts(parts, subbeatDuration);

                        prevQueueTime = audioContext.currentTime;
                        loopedQueue(subbeatDuration * durationInSubbeats * this.WAIT_TIME_FACTOR);
                    }
                });
            }, shortenedWaitTime);
        };

        this.setState({ sessionId }, () => loopedQueue(0));
    }

    queueParts = (parts, timeFactor) => {
        let { player, audioContext } = this.state;
        let { currentTime } = audioContext;

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
    }

    killTake = () => {
        this.state.player.cancelQueue(this.state.audioContext);
        this.setState({ sessionId: null });
    }
};

export default AppRouter;