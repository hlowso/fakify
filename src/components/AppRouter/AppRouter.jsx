import React, { Component } from "react";
import { Switch, Route, Redirect } from "react-router";
import WebAudioFontPlayer from "webaudiofont";

import PlayViewController from "../ViewControllers/PlayViewController/PlayViewController";

import * as StorageHelper from "../../shared/StorageHelper";
import * as Util from "../../shared/Util";
import soundfonts from "../../shared/soundfontsIndex";

// const score = [
//     {
//         piano: {
//             1: {
                
//             },

//             3: {
//                 note: 62,
//                 duration: 1,
//             }
//         },

//         bass: {
//             2: {
                
//             },

//             4: {
//                 note: 31,
//                 duration: 1
//             }
//         }
//     }, {
//         piano: {
//             1: {
//                 note: 60,
//                 duration: 2,
//             },

//             3: {
//                 note: 62,
//                 duration: 1,
//             }
//         },

//         bass: {
//             2: {
//                 note: 36,
//                 duration: 1
//             },

//             4: {
//                 note: 31,
//                 duration: 1
//             }
//         }
//     },
// ];

const scoreV1 = [
    {
        1: {
            piano: {
                note: 60,
                duration: 2,
            },
            doubleBass: {
                note: 36,
                duration: 1
            }
        },
        2: {
            doubleBass: {
                note: 36,
                duration: 1
            }
        },
        3: {
            piano: {
                note: 62,
                duration: 1
            },
            doubleBass: {
                note: 31,
                duration: 1
            }
        },
        4: {
            doubleBass: {
                note: 31,
                duration: 1
            }
        }
    },  
    {
        1: {
            piano: {
                note: 60,
                duration: 2,
            }, 
            doubleBass: {
                note: 36,
                duration: 1
            }
        },
        2: {
            doubleBass: {
                note: 36,
                duration: 1
            }
        },
        3: {
            piano: {
                note: 62,
                duration: 1
            },
            doubleBass: {
                note: 31,
                duration: 1
            }
        },
        4: {
            doubleBass: {
                note: 31,
                duration: 1
            }
        }
    }
];

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

    playRound() {
        let { player, audioContext } = this.state;

        let D = 10;

        let scoreV2 = [];
        for (let i = 0; i < 10 ; i ++) {
            scoreV2 = [...scoreV2, ...scoreV1];
        }

        let beatCounter = 0;
        let { currentTime } = audioContext;
        currentTime += 10;

        for (let bar of scoreV2) {

            for(let beat in bar) {
                let parts = bar[beat];
                beat = Number(beat);

                for(let instrument in parts) {

                    let data = parts[instrument];

                    player.queueWaveTable(
                        audioContext, 
                        audioContext.destination, 
                        window[soundfonts[instrument].variable], 
                        (currentTime + beatCounter + beat) / D, 
                        data.note,
                        data.duration / D,
                        0.6
                    );
                }
                
            }

            beatCounter += 4;
        }
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
            playScore: this.playScore
        };

        let StateHelper = {
            getMidiAccess: this.getMidiAccess,
            setMidiAccess: this.setMidiAccess
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

    /********************
        SOUND ACTIONS   
    ********************/

    _audioInitAsync = () => {
        return new Promise((resolve, reject) => {
            let audioContext = new (window.AudioContext || window.webkitAudioContext)();
            let player = new WebAudioFontPlayer();

            this.setState({ audioContext, player }, resolve);
        });
    }

    _loadInstrumentAsync = instrument => {
        let { audioContext, player } = this.state;
        let font = soundfonts[instrument];

        return new Promise((resolve, reject) => {
            if (!audioContext) reject("PRECOMP - attempted to load instrument with unset AudioContext");

            player.loader.startLoad(audioContext, font.url, font.variable);
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

    playScore = score => {
        console.log("YOU'VE ASKED ME TO PLAY", score);
    }
};

export default AppRouter;