import React, { Component } from "react";
import SongListPanel from "../../Components/SongListPanel/SongListPanel";
import ChartViewer from "../../Components/ChartViewer/ChartViewer";
import Keyboard from "../../Components/Keyboard/Keyboard";

import Soundfont from "soundfont-player";
import MIDI from "midi.js";
import LoadGrand from "./soundfonts/acoustic_grand_piano-ogg";

import "./PlayViewController.css";

class PlayViewController extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // songTitles is hard-coded for now
            // TODO: create an endpoint for songtitles
            songTitles: [
                "#4",
                "'Round Midnight",
                "Bewitched",
                "Bye Bye Blackbird",
                "C Blues",
                "Giant Steps",                
                "Michelle",
                "My Favourite Things",
                "Now's The Time",
                "Someday My Prince Will Come"
            ],

            selectedSong: {
                title: "C Blues",
                timeSignature: '4/4',
                originalKey: "C",
                originalTempo: 120,
                key: "C",
                tempo: 120,
                chart: {
                    progression: {
                        1: { 1: "1^7" },
                        2: { 1: "4^7" },
                        3: { 1: "1^7" },
                        4: { 1: "1^7" },
                        5: { 1: "4^7" },
                        6: { 1: "4^7" },
                        7: { 1: "1^7" },
                        8: { 1: "1^7" },
                        9: { 1: "5^7" },
                        10: { 1: "4^7" },
                        11: { 1: "1^7" },
                        12: { 1: "2^-7", 3: "5^7" },
                    },
                    keys: { 
                        1: "1^7", 
                        2: "4^7", 
                        3: "1^7", 
                        5: "4^7", 
                        7: "1^7", 
                        9: "5^7", 
                        10: "4^7", 
                        11: "1^7", 
                        12: "1^ma7"
                    },
                    sections: {}
                }
            }
        };
    }

    componentDidMount() {
        console.log("PRECOMP - playviewcontroller did mount");
        
        MIDI.loadPlugin({
            soundfontUrl: "./soundfont/",
            instruments: ["acoustic_grand_piano"],
            onsuccess: () => {
                LoadGrand(MIDI);

                MIDI.setContext(new AudioContext(), () => {
                    MIDI.noteOn(0, 60, 127, 0);
                });
                
            }
        });
    }

    render() {
        let { songTitles, selectedSong } = this.state;
        return (
            <div id="play-view">
                <div className={"top-row"}>
                    <SongListPanel 
                        songTitles={songTitles}
                        selectedTitle={selectedSong.title} />
                    <ChartViewer
                        song={selectedSong} />
                </div>
                <div className={"bottom-row"}>
                    <Keyboard />
                </div>
            </div>
        )
    }
}

export default PlayViewController;