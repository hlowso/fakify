import React, { Component } from "react";
import { Switch, Route, Redirect } from "react-router";
import TopNav, { INavUser } from "../views/TopNav/TopNav";
import LoginViewController from "../ViewControllers/LoginViewController/LoginViewController";
import SignUpViewController from "../ViewControllers/SignUpViewController/SignUpViewController";
import PlayViewController from "../ViewControllers/PlayViewController/PlayViewController";
import CreateViewController from "../ViewControllers/CreateViewController/CreateViewController";
import { StorageHelper } from "../../shared/StorageHelper";
import { 
    SessionManager, 
    ImprovSessionManager, 
    ListeningSessionManager 
} from "../../shared/music/SessionManager";
import * as Util from "../../shared/Util";
import * as Api from "../../shared/Api";
import soundfonts from "../../shared/music/soundfontsIndex";
import Chart from "../../shared/music/Chart";
import { PlayMode, IMidiMessage, IKeyStrokeRecord } from "src/shared/types";

const WebAudioFontPlayer = require("webaudiofont");

export interface IAppRouterProps {
    isMobile: boolean;
}

export interface IAppRouterState {
    user?: INavUser | null;
    loading?: boolean;
    audioContext?: AudioContext | null;
    fontPlayer?: any;
    userPlayer?: any;
    userInstrument?: string;
    sessionManager?: SessionManager | ImprovSessionManager | ListeningSessionManager | null; 
    userEnvelopes?: any;
    redirectDestination?: string;
    onUserSessionKeyStroke?: (keyStrokeRecord: IKeyStrokeRecord) => {};
    pianoVolume?: number;
    bassVolume?: number;
    drumsVolume?: number;
}

class AppRouter extends Component<IAppRouterProps, IAppRouterState> {
    constructor(props: IAppRouterProps) {
        super(props);

        // So the state of the AppRouter will be the global state
        // until I decide to do something else. This means that all helper
        // functions for getting and setting global vars must be written
        // as AppRouter class methods.

        this.state = {
            loading: true,
            audioContext: null,
            fontPlayer: null,
            userPlayer: null,
            userInstrument: "piano",
            sessionManager: null,
            userEnvelopes: {},
            redirectDestination: "",
            pianoVolume: 10,
            bassVolume: 10,
            drumsVolume: 10
        };
    }

    public componentWillMount() {
        this._authenticateAsync()
            .then(() => this._audioInitAsync())
            .then(() => this._loadInstrumentsAsync())
            .then(() => {
                this.setState({ loading: false });
            });

        let pianoVolume = StorageHelper.getVolume("piano");
        let bassVolume = StorageHelper.getVolume("bass");
        let drumsVolume = StorageHelper.getVolume("drums");

        let stateUpdate: IAppRouterState = {};

        if (Number.isInteger(pianoVolume) && pianoVolume <= 10 && pianoVolume >= 0) {
            stateUpdate.pianoVolume = pianoVolume;
        }

        if (Number.isInteger(bassVolume) && bassVolume <= 10 && bassVolume >= 0) {
            stateUpdate.bassVolume = bassVolume;
        }

        if (Number.isInteger(drumsVolume) && drumsVolume <= 10 && drumsVolume >= 0) {
            stateUpdate.drumsVolume = drumsVolume;
        }

        this.setState(stateUpdate);
    }

    public componentDidUpdate(prevProps: IAppRouterProps, prevState: IAppRouterState) {
        let { redirectDestination, pianoVolume, bassVolume, drumsVolume } = this.state;
        
        if (redirectDestination) {
            this.setState({ redirectDestination: "" });
        }

        if(
            prevState.pianoVolume !== pianoVolume ||
            prevState.bassVolume !== bassVolume ||
            prevState.drumsVolume !== drumsVolume 
        ) {
            this.killTake();
        } 
    }

    public render() {
        let { isMobile } = this.props;
        let { redirectDestination, user } = this.state;

        return redirectDestination
            ? (
                <Redirect to={`/${redirectDestination}`} />
            )
            : (
                <div id="app-router">
                    <TopNav 
                        path={window.location.pathname}
                        isMobile={isMobile} 
                        user={user || null} 
                        setUser={this.setUser} />
                    {this.renderRouter()}
                </div>
            );
    }

    public renderRouter() {

        let { isMobile } = this.props;
        let { loading, sessionManager } = this.state;

        let SoundActions = {
            playRangeLoop: this.playRangeLoop,
            killTake: this.killTake,
            playUserMidiMessage: this.playUserMidiMessage,
            setVolume: this.setVolume
        };

        let StateHelper = {
            getState: () => this.state,
            getCurrentUserKeysDepressed: this.getCurrentUserKeysDepressed
        };

        let PlayVCProps = {
            isMobile,
            StateHelper,
            SoundActions,
            sessionManager: sessionManager as SessionManager | ImprovSessionManager | ListeningSessionManager
        };

        let CreateVCProps = {
            isMobile,
            StateHelper,
            redirect: this._redirect
        };

        return loading
                ? <h1>loading...</h1> 
                : (
                    <main style={{ height: window.innerHeight - 85 }} >
                        <Switch>
                            <Route 
                                exact={true} 
                                path='/signup' 
                                render={() => <SignUpViewController isMobile={isMobile} />} />
                            <Route 
                                exact={true} 
                                path='/login'
                                render={() => <LoginViewController isMobile={isMobile} />} />
                            <Route 
                                exact={true}
                                path="/play" 
                                render={ () => <PlayViewController {...PlayVCProps} />} />
                            <Route 
                                exact={true}
                                path="/create" 
                                render={ () => <CreateViewController {...CreateVCProps}/> } />
                            <Route 
                                path="/" 
                                render={ () => <Redirect to="/play" /> } />
                        </Switch>
                    </main>
                );
    }

    /*******************
        STATE HELPER   
    *******************/

    // setMidiAccess = midiAccess => {
    //     this.setState({ midiAccess });
    // }

    // getMidiAccess = () => {
    //     return this.state.midiAccess;
    // }

    public getCurrentUserKeysDepressed = () => {
        return Object.keys(this.state.userEnvelopes).map(key => Number(key));
    }

    public setUser = (user?: INavUser) => {
        this.setState({ user });
    }

    /********************
        SOUND ACTIONS   
    ********************/

    private _audioInitAsync = () => {
        return new Promise((resolve, reject) => {
            let audioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
            let userPlayer = new WebAudioFontPlayer();
            let fontPlayer = new WebAudioFontPlayer();

            this.setState({ 
                audioContext, 
                userPlayer, 
                fontPlayer
            }, resolve);
        });
    }

    private _loadInstrumentAsync = (instrument: string) => {
        let { audioContext, userPlayer, fontPlayer } = this.state;
        let font = soundfonts[instrument];

        return new Promise((resolve, reject) => {
            if (!audioContext) reject("PRECOMP - attempted to load instrument with unset AudioContext");

            userPlayer.loader.startLoad(audioContext, font.url, font.variable);
            fontPlayer.loader.startLoad(audioContext, font.url, font.variable);
            
            // TODO: fix this...
            userPlayer.loader.waitLoad(resolve);
            fontPlayer.loader.waitLoad(resolve);
        });
    }

    private _loadInstrumentsAsync = () => {
        return Promise.all(Object.keys(soundfonts).map(instrument => this._loadInstrumentAsync(instrument)));
    }

    // setMidiAccessAsync = () => {
    //     return new Promise((resolve, reject) => {
    //         if (!navigator.requestMIDIAccess) {
    //             resolve();
    //         }

    //         navigator.requestMIDIAccess()
    //         .then(midiAccess => { 
    //             this.setState({ midiAccess }, resolve);
    //         });
    //     });
    // }

    // connectToMidiInput = inputId => {
    //     if (!inputId) return false;

    //     let { midiAccess } = this.state;
    //     if (!midiAccess) return false;

    //     let inputs = midiAccess.inputs.values();  
    //     let connectionSuccessful = false;  

    //     for( 
    //         let input = inputs.next(); 
    //         input && !input.done; 
    //         input = inputs.next()
    //     ) {
    //         if (inputId === input.value.id) {
    //             input.value.onmidimessage = this.playUserMidiMessage;
    //             connectionSuccessful = true;
    //         } else {
    //             input.value.onmidimessage = null;
    //         }
    //     }

    //     return connectionSuccessful;
    // }

    public playUserMidiMessage = (message: IMidiMessage) => {
        let { userPlayer, userInstrument, audioContext, userEnvelopes } = this.state;
        let { data } = message;
        let type = data[0], note = data[1], velocity = data[2] / 127;
        let userEnvelopesClone = Util.copyObject(userEnvelopes);
        let existingEnvelope = userEnvelopes[note];

        let noteOff = (existingEnvelop: any, userEnvelopesUpdate: any, clearAll = false) => {
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
                noteOff(existingEnvelope, userEnvelopesClone, true);

            case 144:
                if (velocity) {
                    let { currentTime, destination } = audioContext as any;
                    userEnvelopesClone[note] = userPlayer.queueWaveTable(
                        audioContext, 
                        destination, 
                        window[soundfonts[userInstrument as string].variable], 
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
                    noteOff(existingEnvelope, userEnvelopesClone);
                }
                break;

            case 128:
                noteOff(existingEnvelope, userEnvelopesClone);
                break;

            default:
                console.log("PRECOMP - unknown midi message type:", type);
        }

        this.setState({ userEnvelopes: userEnvelopesClone });
    }

    public onUserKeyStroke = (note: number, time: number, velocity: number) => {
        let { 
            sessionManager,
            onUserSessionKeyStroke 
        } = this.state;

        if (sessionManager && sessionManager.inSession && onUserSessionKeyStroke) {
            let record = sessionManager.recordUserKeyStroke(note, time, velocity);
            onUserSessionKeyStroke(record);
        }
    }

    public playRangeLoop = (chart: Chart, playMode?: PlayMode) => {
        this.killTake();
        let { audioContext, fontPlayer, pianoVolume, bassVolume, drumsVolume } = this.state;
        
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
            this.forceUpdate.bind(this),
            (pianoVolume as number) / 10,
            (bassVolume as number) / 10,
            (drumsVolume as number) / 10
        );

        sessionManager.start();
        this.setState({ sessionManager });
    }

    public killTake = () => {
        let { sessionManager } = this.state;
        if (sessionManager) {
            sessionManager.stop();
        }
        this.setState({ sessionManager: null });
    }

    public setVolume = (instrument: string, vol: number) => {
        switch(instrument) {
            default:
            case "piano": 
                return this.setState({ pianoVolume: vol });
            case "bass":
                return this.setState({ bassVolume: vol });
            case "drums":
                return this.setState({ drumsVolume: vol });
        }
    }

    /********************
        MISCELLANEOUS   
    ********************/

   private _authenticateAsync = async () => {
        let user = await Api.authenticateAsync();
        if (user) {
            let navUser = { email: user.email };
            this.setState({ user: navUser });
        }
    }

    private _redirect = (tab: string) => {
        this.setState({ redirectDestination: `/${tab}` });
    }
};

export default AppRouter;