import React, { Component } from "react";
import Cx from "classnames";

import * as MusicHelper from "../../../shared/music/MusicHelper";

import "./Keyboard.css";

class Keyboard extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };

        this.NUMBER_OF_KEYS = 88;
        this.LOWEST_A = 9;
        this.HIGHEST_C = this.LOWEST_A + this.NUMBER_OF_KEYS - 1;
        this.BLACK_KEY_INDECES = [1, 3, 6, 8, 10];
        this.KEY_HEIGHT = "70px";
        this.KEY_WIDTH_FACTOR = 1;
        this.WIDER_UPPER_WHITE_KEY_WIDTH = `${this.KEY_WIDTH_FACTOR * 25}px`;
        this.NARROWER_UPPER_WHITE_KEY_WIDTH = `${this.KEY_WIDTH_FACTOR * 15}px`;
        this.LOWER_WHITE_KEY_WIDTH = `${this.KEY_WIDTH_FACTOR * 35}px`;
        this.BLACK_KEY_WIDTH = `${this.KEY_WIDTH_FACTOR * 20}px`;
    }

    render() {
        return (
            <div id="keyboard">
                {this.renderKeys()}
            </div>
        );
    }

    renderKeys = () => {
        let { depressedKeys, currentKey } = this.props;
        let upperElements = [],
            lowerElements = [];

        for (let note = this.LOWEST_A; note < this.LOWEST_A + 88; note ++) {
            let noteNameIndex = note % 12;
            let noteName = MusicHelper.NOTE_NAMES[noteNameIndex];
            let isBlackKey = this.BLACK_KEY_INDECES.indexOf(noteNameIndex) !== -1;
            let isDepressed = depressedKeys.indexOf(note) !== -1;
            let isInKey = MusicHelper.noteIsInKey(note, currentKey);

            if (isBlackKey) upperElements.push(this.getBlackKey(note, noteName, isDepressed, isInKey));
            else {
                let elementPair = this.getWhiteKey(note, noteName, isDepressed, isInKey);
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

    getWhiteKey = (note, noteName, depressed, inCurrentKey) => {
        let classNames = Cx(
            "key", "white-key", noteName, 
            {
                "depressed": depressed, 
                "in-current-key": inCurrentKey,
                "take-playing": this.props.takeIsPlaying
            }
        );

        let upperStyle = {
            width: this.WIDER_UPPER_WHITE_KEY_WIDTH, 
            height: this.KEY_HEIGHT
        };

        let lowerStyle = {
            width: this.LOWER_WHITE_KEY_WIDTH, 
            height: this.KEY_HEIGHT
        }

        if ([
                MusicHelper.NOTE_NAMES[2], 
                MusicHelper.NOTE_NAMES[7], 
                MusicHelper.NOTE_NAMES[9]
            ].indexOf(noteName) !== -1
        ) {
            upperStyle.width = this.NARROWER_UPPER_WHITE_KEY_WIDTH;
        }

        if (note === this.LOWEST_A) {
            upperStyle.width = this.WIDER_UPPER_WHITE_KEY_WIDTH;
        }
        if (note === this.HIGHEST_C) {
            upperStyle.width = this.LOWER_WHITE_KEY_WIDTH;
        }

        return {
            upperElement: this.renderKey(note, noteName, classNames, upperStyle),
            lowerElement: this.renderKey(note, noteName, classNames, lowerStyle)
        };
    }

    getBlackKey = (note, noteName, depressed, inCurrentKey) => {
        let blackKeyStyle = {
            width: this.BLACK_KEY_WIDTH, 
            height: this.KEY_HEIGHT
        };

        let classNames = Cx(
            "key", 
            "black-key", 
            `${noteName}`, 
            { 
                "depressed": depressed, 
                "in-current-key": inCurrentKey,
                "take-playing": this.props.takeIsPlaying,
            }
        );

        return this.renderKey(note, noteName, classNames, blackKeyStyle);
    }

    renderKey = (note, noteName, classNames, style) => {
        return (
            <div 
                key={`${noteName}${note}`} 
                className={classNames} 
                style={style} 
                onMouseDown={() => this.onPianoKeyDown(note)} 
                onMouseUp={() => this.onPianoKeyUp(note)} />
        );
    }

    onPianoKeyDown = note => {
        let message = { 
            data: [144, note, 127]
        };
        this.props.playUserMidiMessage(message);
    }

    onPianoKeyUp = note => {
        let message = {
            data: [128, note, 0]
        }
        this.props.playUserMidiMessage(message);
    }
};

export default Keyboard;