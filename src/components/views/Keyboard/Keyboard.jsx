import React, { Component } from "react";
import Cx from "classnames";

import { NOTE_NAMES } from "../../../shared/music/MusicHelper";

import "./Keyboard.css";

class Keyboard extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };

        this.NUMBER_OF_KEYS = 88;
        this.LOWEST_A = 9;
        this.BLACK_KEY_INDECES = [1, 3, 6, 8, 10];
        this.KEY_HEIGHT = "70px";
        this.KEY_WIDTH_FACTOR = 1;
        this.WIDER_UPPER_WHITE_KEY_WIDTH = `${this.KEY_WIDTH_FACTOR * 25}px`;
        this.NARROWER_UPPER_WHITE_KEY_WIDTH = `${this.KEY_WIDTH_FACTOR * 15}px`;
        this.LOWER_WHITE_KEY_WIDTH = `${this.KEY_WIDTH_FACTOR * 35}px`;
        this.BLACK_KEY_WIDTH = `${this.KEY_WIDTH_FACTOR * 20}px`;
    }

    render() {
        this.renderKeys();
        return (
            <div id="keyboard">
                {this.renderKeys()}
            </div>
        );
    }

    renderKeys = () => {
        let upperElements = [<div key="buffer" style={{width: `${this.KEY_WIDTH_FACTOR * 10}px`, height: this.KEY_HEIGHT, backgroundColor: "white"}}></div>],
            lowerElements = [];

        for (let note = this.LOWEST_A; note < this.LOWEST_A + 88; note ++) {
            let noteNameIndex = note % 12;
            let noteName = NOTE_NAMES[noteNameIndex];
            let isBlackKey = this.BLACK_KEY_INDECES.indexOf(noteNameIndex) !== -1;

            if (isBlackKey) upperElements.push(this.renderBlackKey(note, noteName, false, false));
            else {
                let elementPair = this.renderWhiteKey(note, noteName, false, false);
                upperElements.push(elementPair.upperElement);
                lowerElements.push(elementPair.lowerElement);
            }
        }

        return (
            <div className="keys">
                <div className="upper-keys">
                    {upperElements}
                </div>
                <div className="lower-keys">
                    {lowerElements}
                </div>
            </div>
        );
    }

    renderWhiteKey = (note, noteName, depressed, inCurrentKey) => {
        let classNames = Cx("key", noteName, { "depressed": depressed, "in-current-key": inCurrentKey });
        switch(noteName) {
            case NOTE_NAMES[0]:   // C
            case NOTE_NAMES[4]:   // E
            case NOTE_NAMES[5]:   // F
            case NOTE_NAMES[11]:  // B
                return {
                    upperElement: (
                        <div key={`${noteName}${note}`} className={classNames} style={{width: this.WIDER_UPPER_WHITE_KEY_WIDTH, height: this.KEY_HEIGHT, backgroundColor: "white"}}>
                        </div>
                    ),
                    lowerElement: (
                        <div key={`${noteName}${note}`} className={classNames} style={{width: this.LOWER_WHITE_KEY_WIDTH, height: this.KEY_HEIGHT, backgroundColor: "white"}}>
                        </div>
                    )
                };
            case NOTE_NAMES[2]:   // D
            case NOTE_NAMES[7]:   // G
            case NOTE_NAMES[9]:   // A
                return {
                    upperElement: (
                        <div key={`${noteName}${note}`} className={classNames} style={{width: this.NARROWER_UPPER_WHITE_KEY_WIDTH, height: this.KEY_HEIGHT, backgroundColor: "white"}}>
                        </div>
                    ),
                    lowerElement: (
                        <div key={`${noteName}${note}`} className={classNames} style={{width: this.LOWER_WHITE_KEY_WIDTH, height: this.KEY_HEIGHT, backgroundColor: "white"}}>
                        </div>
                    )
                };
        }
    }

    renderBlackKey = (note, noteName) => {
        return (
            <div key={`${noteName}${note}`} className={`key black-key ${noteName}`} style={{width: this.BLACK_KEY_WIDTH, height: this.KEY_HEIGHT, backgroundColor: "black"}}>
            </div>
        );
    }
};

export default Keyboard;