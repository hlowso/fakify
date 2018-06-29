import React, { Component } from "react";
import { Switch, Route, Redirect } from "react-router";
import WebAudioFontPlayer from "webaudiofont";
import uuid from "uuid";

import PlayViewController from "../ViewControllers/PlayViewController/PlayViewController";

import * as StorageHelper from "../../shared/StorageHelper";
import * as MusicHelper from "../../shared/music/MusicHelper";
import { SessionManager, ImprovSessionManager, LARSessionManager } from "../../shared/music/SessionManager";
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
            fontPlayer: null,
            userPlayer: null,
            userInstrument: "piano",
            sessionManager: null,
            userEnvelopes: {},
            onUserSessionKeyStroke: (keyStrokeRecord) => {},
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
        let { loading, sessionManager } = this.state;

        let SoundActions = {
            setMidiContextAsync: this.setMidiContextAsync,
            setMidiAccessAsync: this.setMidiAccessAsync,
            connectToMidiInput: this.connectToMidiInput,
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
            StorageHelper,
            sessionManager,
            improvScore: (
                sessionManager && sessionManager.inSession 
                    ? sessionManager.currImprovScore 
                    : null
            )
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
            let fontPlayer = new WebAudioFontPlayer();

            this.setState({ 
                audioContext, 
                userPlayer, 
                fontPlayer
            }, resolve);
        });
    }

    _loadInstrumentAsync = instrument => {
        let { audioContext, userPlayer, fontPlayer } = this.state;
        let font = soundfonts[instrument];

        return new Promise((resolve, reject) => {
            if (!audioContext) reject("PRECOMP - attempted to load instrument with unset AudioContext");

            userPlayer.loader.startLoad(audioContext, font.url, font.variable);
            fontPlayer.loader.startLoad(audioContext, font.url, font.variable);
            
            userPlayer.loader.waitLoad(resolve);
            fontPlayer.loader.waitLoad(resolve);
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
        let { userPlayer, userInstrument, audioContext, userEnvelopes, sessionManager } = this.state;
        let { data } = message;
        let type = data[0], note = data[1], velocity = data[2] / 127;
        let userEnvelopesUpdate = Util.copyObject(userEnvelopes);
        let existingEnvelop = userEnvelopes[note];

        let noteOff = (existingEnvelop, userEnvelopesUpdate) => {
            if (existingEnvelop) {
                if (existingEnvelop.cancel) existingEnvelop.cancel();
                delete userEnvelopesUpdate[note];
            }
        }

        switch(type) {
            case 144:
                if (velocity) {
                    let { currentTime, destination } = audioContext;
                    userEnvelopesUpdate[note] = userPlayer.queueWaveTable(
                        audioContext, 
                        destination, 
                        window[soundfonts[userInstrument].variable], 
                        currentTime, 
                        note,
                        1000,
                        velocity
                    );
                    this.onUserKeyStroke(
                        note, 
                        currentTime, 
                        velocity
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

    onUserKeyStroke = (note, time, velocity) => {
        let { 
            sessionManager,
            onUserSessionKeyStroke 
        } = this.state;

        if (sessionManager && sessionManager.inSession) {
            let record = sessionManager.recordUserKeyStroke(note, time, velocity);
            onUserSessionKeyStroke(record);
        }
    }

    playRangeLoop = (chart, playMode) => {
        this.killTake();
        let { audioContext, fontPlayer } = this.state;
        
        let Manager;
        switch (playMode) {
            case "improv":
                Manager = ImprovSessionManager;
                break;
            case "listenAndRepeat":
                Manager = LARSessionManager;
                break;
            default:
                Manager = SessionManager;
                break;
        }

        let sessionManager = new Manager(
            audioContext, 
            fontPlayer, 
            chart,
            this.forceUpdate.bind(this)
        );

        sessionManager.start();
        this.setState({ sessionManager });
    }

    killTake = () => {
        let { sessionManager } = this.state;
        if (sessionManager) {
            sessionManager.stop();
        }
    }
};

export default AppRouter;