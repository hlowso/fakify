import React, { Component } from "react";
import Cx from "classnames";
import * as MusicHelper from "../../../shared/music/MusicHelper";
import { NoteName, IMidiMessage } from "../../../shared/types";
import "./Keyboard.css";

export interface IKeyboardProps {
    showKeyChanges: boolean;
    depressedKeys: number[];
    currentKey: NoteName | "";
    takeIsPlaying: boolean;
    playUserMidiMessage: (message: IMidiMessage) => void;
    firstNote: number;
    firstNoteColor: string;
    rangeStartNote: number;
    rangeEndNote: number;
}

export interface IKeyboardState {
    mouseIsDown: boolean;
}

class Keyboard extends Component<IKeyboardProps, IKeyboardState> {
    private _BLACK_KEY_INDICES = [1, 3, 6, 8, 10];
    private _KEY_HEIGHT = "70px";
    private _KEY_WIDTH_FACTOR = 1;
    private _WIDER_UPPER_WHITE_KEY_WIDTH = `${this._KEY_WIDTH_FACTOR * 25}px`;
    private _NARROWER_UPPER_WHITE_KEY_WIDTH = `${this._KEY_WIDTH_FACTOR * 15}px`;
    private _LOWER_WHITE_KEY_WIDTH = `${this._KEY_WIDTH_FACTOR * 35}px`;
    private _BLACK_KEY_WIDTH = `${this._KEY_WIDTH_FACTOR * 20}px`;

    constructor(props: IKeyboardProps) {
        super(props);
        this.state = {
            mouseIsDown: false
        };
    }

    public render(): JSX.Element {
        return (
            <div id="keyboard">
                {this.renderKeys()}
            </div>
        );
    }

    public renderKeys = (): JSX.Element => {
        let upperElements = [],
            lowerElements = [];

        for (let note = MusicHelper.LOWEST_A; note < MusicHelper.LOWEST_A + 88; note ++) {
            let noteNameIndex = note % 12;
            let noteName = MusicHelper.NOTE_NAMES[noteNameIndex];
            let isBlackKey = this._BLACK_KEY_INDICES.indexOf(noteNameIndex) !== -1;

            if (isBlackKey) upperElements.push(this.getBlackKey(note, noteName));
            else {
                let elementPair = this.getWhiteKey(note, noteName);
                upperElements.push(elementPair.upperElement);
                lowerElements.push(elementPair.lowerElement);
            }
        }

        return (
            <div className="keys" onMouseLeave={() => this.onPianoKeyUp()}>
                <div className="upper-keys">
                    {upperElements}
                </div>
                <div className="lower-keys">
                    {lowerElements}
                </div>
            </div>
        );
    }

    public getWhiteKey = (note: number, noteName: NoteName) => {
        let upperStyle = {
            width: this._WIDER_UPPER_WHITE_KEY_WIDTH, 
            height: this._KEY_HEIGHT
        };

        let lowerStyle = {
            width: this._LOWER_WHITE_KEY_WIDTH, 
            height: this._KEY_HEIGHT
        }

        if ([
                MusicHelper.NOTE_NAMES[2], 
                MusicHelper.NOTE_NAMES[7], 
                MusicHelper.NOTE_NAMES[9]
            ].indexOf(noteName) !== -1
        ) {
            upperStyle.width = this._NARROWER_UPPER_WHITE_KEY_WIDTH;
        }

        if (note === MusicHelper.LOWEST_A) {
            upperStyle.width = this._WIDER_UPPER_WHITE_KEY_WIDTH;
        }
        if (note === MusicHelper.HIGHEST_C) {
            upperStyle.width = this._LOWER_WHITE_KEY_WIDTH;
        }

        return {
            upperElement: this.renderKey(note, noteName, false, upperStyle),
            lowerElement: this.renderKey(note, noteName, false, lowerStyle)
        };
    }

    public getBlackKey = (note: number, noteName: NoteName): JSX.Element => {
        let blackKeyStyle = {
            width: this._BLACK_KEY_WIDTH, 
            height: this._KEY_HEIGHT
        };

        return this.renderKey(note, noteName, true, blackKeyStyle);
    }

    public renderKey = (note: number, noteName: NoteName, isBlack = false, style: any): JSX.Element => {
        let { showKeyChanges, depressedKeys, currentKey, firstNote, rangeStartNote, rangeEndNote, takeIsPlaying } = this.props;
        let keyDepressed = depressedKeys.indexOf(note) !== -1;
        let classes = Cx({
            "key": true,
            "depressed": keyDepressed, 
            "in-current-key": showKeyChanges && MusicHelper.noteIsInKey(note, currentKey),
            "take-playing": takeIsPlaying,
            "key-out-of-range": note < rangeStartNote || rangeEndNote < note,
            "white-key": !isBlack,
            "black-key": isBlack
        });

        if (!keyDepressed && note === firstNote) {
            style.backgroundColor = this.props.firstNoteColor;
        }

        return (
            <div 
                key={`${noteName}${note}`} 
                className={classes} 
                style={style} 
                onMouseDown={() => this.onPianoKeyDown(note)} 
                onMouseEnter={() => this.onPianoKeyOver(note)}
                onMouseUp={() => this.onPianoKeyUp()} />
        );
    }

    private onPianoKeyDown = (note: number) => {
        this.props.playUserMidiMessage({ data: [144, note, 127]});
        this.setState({ mouseIsDown: true });        
    }

    private onPianoKeyOver = (note: number) => {
        if (this.state.mouseIsDown) {
            this.props.playUserMidiMessage({ data: [1, note, 127]});
        }
    }

    private onPianoKeyUp = () => {
        this.props.playUserMidiMessage({ data: [128, NaN, 0]});
        this.setState({ mouseIsDown: false });        
    }
};

export default Keyboard;