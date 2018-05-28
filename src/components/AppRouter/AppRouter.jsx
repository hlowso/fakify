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

                let { player, audioContext } = this.state;
                let target = this.musicTarget;
                let barCounter = 0;
                let queueBeat;
                let scoreV2 = [];

                let D = 10;

                for (let i = 0; i < 1000; i ++) {
                    scoreV2 = [...scoreV2, ...scoreV1];
                }

                for (let scoreBar of scoreV2) {
                    for (let beat in scoreBar) {
                        queueBeat = barCounter + Number(beat);
                        let playerCallbacks = [];
                        for (let instrument in scoreBar[beat]) {
                            let data = scoreBar[beat][instrument];
                            playerCallbacks.push(() => player.queueWaveTable(
                                audioContext, 
                                audioContext.destination, 
                                window[soundfonts[instrument].variable], 
                                0, 
                                data.note,
                                data.duration / D,
                                0.6
                            ));
                        }
                        target.addEventListener(`queue:${queueBeat}`, () => {
                            playerCallbacks.forEach(cb => cb());
                        }, {once: true});
                    }   

                    barCounter += 4;
                }

                console.log("done");

                // let counter = 0;
                // setInterval(() => {
                //     console.log("BEAT", counter);
                //     let event = document.createEvent("Event");
                //     event.initEvent(`queue:${counter}`, true, true);
                //     target.dispatchEvent(event);
                //     counter++;
                // }, 1000 / D);


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