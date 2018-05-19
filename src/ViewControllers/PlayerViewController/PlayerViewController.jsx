import React, { Component } from "react";
import Soundfont from "soundfont-player";
import MIDI from "../../MIDI";

class PlayerViewController extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    componentDidMount() {
        console.log("PRECOMP - playviewcontroller did mount");
        // if (typeof MIDI === "undefined") console.log("here");
        // console.log(MIDI);
        // console.log(Soundfont);
        console.log(MIDI.loadPluggin);
        this.playMultiple();
    }

    render() {
        return (
            <div id="play-view">
                <h1>This Will Be The App</h1>
            </div>
        )
    }

    async playMultiple() {
        const ac = new AudioContext();
        const piano = await Soundfont.instrument(ac, 'acoustic_grand_piano');
        const clarinet = await Soundfont.instrument(ac, 'clarinet');

        piano.play('C4', ac.currentTime, {duration: 20});
        clarinet.play('E4', ac.currentTime, {duration: 20});
    }
}

export default PlayerViewController;