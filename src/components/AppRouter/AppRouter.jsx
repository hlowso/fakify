import React, { Component } from "react";
import { Switch, Route, Redirect } from "react-router";
import WebAudioFontPlayer from "webaudiofont";
import uuid from "uuid";

import PlayViewController from "../ViewControllers/PlayViewController/PlayViewController";

import * as StorageHelper from "../../shared/StorageHelper";
import * as MusicHelper from "../../shared/music/MusicHelper";
import SessionManager from "../../shared/music/SessionManager";
import * as Util from "../../shared/Util";
import soundfonts from "../../shared/music/soundfontsIndex";

class AppRouter extends Component {
    WAIT_TIME_FRACTION = 9 / 10;
    WAIT_TIME_FACTOR = 1000 * this.WAIT_TIME_FRACTION;
    TIME_CHECKER_RATE = 5;
    PREP_TIME = 0.02;

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
            sessionId: null,
            sessionManager: null,
            userEnvelopes: {},
            onUserSessionKeyStroke: (keyStrokeRecord) => {},
            userSessionRecord: []
        };
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
                    let { currentTime, destination } = audioContext;
                    userEnvelopesUpdate[note] = userPlayer.queueWaveTable(
                        audioContext, 
                        destination, 
                        window[soundfonts[userInstrument].variable], 
                        currentTime, 
                        note,
                        1000,
                        volume
                    );
                    // this.onUserKeyStroke(
                    //     note,
                    //     currentTime,
                    //     volume
                    // );
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

    onUserKeyStroke = (note, time, velocity) => {
        let { 
            sessionId, 
            sessionManager,
            userSessionRecord,
            onUserSessionKeyStroke 
        } = this.state;

        // If there's a session going, we record
        // the notes the user plays in the userSessionRecord
        // state array
        if (sessionId) {
            let { chartIndex, subbeatDuration, subbeatOffsetToQueueTime } = sessionManager.sessionPassage;
            let [closestSubbeatOffset, closestSubbeatOffsetTime] = Util.arrayBinarySearch(subbeatOffsetToQueueTime, time);
            let precision = (time - closestSubbeatOffsetTime) / subbeatDuration;
            
            if (precision < -0.5) {
                closestSubbeatOffset = sessionManager.peekPreviousSubbeat({...chartIndex, subbeatOffset: closestSubbeatOffset});
                precision++
            } else if (precision > 0.5) {
                closestSubbeatOffset = sessionManager.peekNextSubbeat(...chartIndex, closestSubbeatOffset);
                precision--;
            }
            
            let keyStrokeRecord = {
                note,
                velocity,
                chartIndex: { 
                    ...chartIndex, 
                    subbeatOffset: closestSubbeatOffset
                },
                precision,
                inKey
            }

            let userSessionRecordUpdate = Util.copyObject(userSessionRecord);
            userSessionRecordUpdate.push(keyStrokeRecord);
            this.setState({ userSessionRecord: userSessionRecordUpdate });
            
            // And call the user key stroke subscriber's function
            onUserSessionKeyStroke(keyStrokeRecord);
        }
    }

    playRangeLoop = (chart) => {
        let { audioContext, player } = this.state;
        let sessionManager = new SessionManager(audioContext, player, chart);

        sessionManager.start();

        this.setState({ 
            sessionId: sessionManager.sessionId,
            sessionManager, 
            userSessionRecord: [] 
        });
    }

    queueParts = (parts, subbeatOffsetToQueueTime, timeFactor) => {
        let { player, audioContext } = this.state;

        Object.keys(parts).forEach(instrument => {
            let part = parts[instrument];

            if (part) {
                part.forEach(stroke => {
                    stroke.notes.forEach(note => {
                        player.queueWaveTable(
                            audioContext, 
                            audioContext.destination, 
                            window[soundfonts[instrument].variable], 
                            subbeatOffsetToQueueTime[stroke.subbeatOffset], 
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
        this.setState({ 
            sessionId: null
        });
    }
};

export default AppRouter;