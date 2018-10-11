import React, { Component } from "react";
import { Switch, Route, Redirect } from "react-router";
import WebAudioFontPlayer from "webaudiofont";
import uuid from "uuid";
import PlayViewController from "../ViewControllers/PlayViewController/PlayViewController";
import CreateViewController from "../ViewControllers/CreateViewController/CreateViewController";
import { StorageHelper } from "../../shared/StorageHelper";
import * as MusicHelper from "../../shared/music/MusicHelper";
import { 
    SessionManager, 
    ImprovSessionManager, 
    ListeningSessionManager 
} from "../../shared/music/SessionManager";
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
            fontPlayer: null,
            userPlayer: null,
            userInstrument: "piano",
            sessionManager: null,
            userEnvelopes: {},
            redirectDestination: "",
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

    componentDidUpdate() {
        let { redirectDestination } = this.state;
        if (redirectDestination) {
            this.setState({ redirectDestination: "" });
        }
    }

    render() {
        let { loading, sessionManager, redirectDestination } = this.state;

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

        let PlayVCProps = {
            SoundActions,
            StateHelper,            
            sessionManager,
            redirect: this._redirect
        };

        let CreateVCProps = {
            StateHelper,
            redirect: this._redirect
        };

        return loading
                ? <h1>loading...</h1> 
                : (
                    redirectDestination
                        ? (
                            <Redirect to={redirectDestination} />
                        )
                        : (
                            <Switch>
                                <Route 
                                    exact
                                    path="/play" 
                                    render={ () => <PlayViewController {...PlayVCProps}/> }
                                />
                                <Route 
                                    exact
                                    path="/create" 
                                    render={ () => <CreateViewController {...CreateVCProps}/> }
                                />
                                <Route 
                                    path="/" 
                                    render={ () => <Redirect to="/play" /> }
                                />
                            </Switch>
                        )
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
            if (!navigator.requestMIDIAccess) {
                resolve();
            }

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
        let existingEnvelope = userEnvelopes[note];

        let noteOff = (existingEnvelop, userEnvelopesUpdate, clearAll = false) => {
            // note is NaN when this function is being triggered by a 
            // mouse event
            if (clearAll || isNaN(note)) {
                for (let key in userEnvelopes) {
                    let envelope = userEnvelopes[key];
                    if (envelope.cancel) envelope.cancel();
                    delete userEnvelopesUpdate[key];
                }
            } else if (existingEnvelope) {
                if (existingEnvelope.cancel) existingEnvelope.cancel();
                delete userEnvelopesUpdate[note];
            }
        }

        switch(type) {
            case 1: 
                // This is the case where a user drags the cursor
                // across the keys with the mouse button held down
                noteOff(existingEnvelope, userEnvelopesUpdate, true);

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
                    noteOff(existingEnvelope, userEnvelopesUpdate);
                }
                break;

            case 128:
                noteOff(existingEnvelope, userEnvelopesUpdate);
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
            case "listening":
                Manager = ListeningSessionManager;
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

    /********************
        MISCELLANEOUS   
    ********************/

    _redirect = tab => {
        this.setState({ redirectDestination: `/${tab}` });
    }
};

export default AppRouter;