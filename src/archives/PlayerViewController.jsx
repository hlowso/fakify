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
        // this.playMultiple();
        MIDI.loadPlugin(
            // soundfontUrl: "./soundfont/",
            // instruments: ["acoustic_grand_piano"],
            () => {
                GET_FONT(MIDI);
                
                // MIDI.Player.loadFile("./Queen_-_Another_One_Bites_the_Dust.mid", MIDI.Player.start);
                // MIDI.Player.addListener(data => {
                //     console.log(data);
                //     // MIDI.noteOn(0, 60, 127); THIS WILL PLAY
                // });

                // setTimeout(() => {
                //     MIDI.Player.stop();
                // }, 30000);
                console.log(MIDI);

                MIDI.setContext(new AudioContext(), () => {
                    MIDI.setVolume(0, 127);

                    // MIDI.Player.start();
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

    async playMultiple() {
        const ac = new AudioContext();
        const piano = await Soundfont.instrument(ac, 'acoustic_grand_piano');
        const clarinet = await Soundfont.instrument(ac, 'clarinet');

        console.log("PLAYING NOW");
        // piano.play('C4', ac.currentTime, {duration: 200});
        // clarinet.play( [ 60, 64], ac.currentTime, {duration: 200});
        // piano.opts.sustain = 100;
        piano.schedule(ac.currentTime + 1, [ { time: 0, note: 60, duration: 10 }, { time: 4, note: 61, duration: 10 } ]);
        // setTimeout(() => {
        //     piano.stop();
        // }, 2000);
        setTimeout(() => {
            console.log(piano);
            // piano.start();
        }, 2000);
    }
}

export default PlayerViewController;