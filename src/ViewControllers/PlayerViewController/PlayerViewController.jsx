import React, { Component } from "react";
import Soundfont from "soundfont-player";
import MIDI from "midi.js";
import GET_FONT from "./soundfonts/acoustic_grand_piano-ogg";

class PlayerViewController extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    componentDidMount() {
        console.log("PRECOMP - playviewcontroller did mount");
        MIDI.loadPlugin(
            () => {
                GET_FONT(MIDI);
                console.log(MIDI);

                MIDI.setContext(new AudioContext(), () => {
                    MIDI.noteOn(0, 60, 127, 0);
                });
                
            }
        );
    }

    render() {
        return (
            <div style={{display: "flex", justifyContent: "center"}} id="play-view">
                <h1>This Will Be The App</h1>
            </div>
        )
    }
}

export default PlayerViewController;