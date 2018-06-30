import React, { Component } from "react";
import Cx from "classnames";
import * as MusicHelper from "../../../shared/music/MusicHelper";
import { NoteName, IMidiMessage } from "../../../shared/types";
import "./Keyboard.css";

export interface IKeyboardProps {
    depressedKeys: number[];
    currentKey: NoteName;
    takeIsPlaying: boolean;
    playUserMidiMessage: (message: IMidiMessage) => void;
}

export interface IKeyboardState {

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
        let { depressedKeys, currentKey } = this.props;
        let upperElements = [],
            lowerElements = [];

        for (let note = MusicHelper.LOWEST_A; note < MusicHelper.LOWEST_A + 88; note ++) {
            let noteNameIndex = note % 12;
            let noteName = MusicHelper.NOTE_NAMES[noteNameIndex];
            let isBlackKey = this._BLACK_KEY_INDICES.indexOf(noteNameIndex) !== -1;
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

    public getWhiteKey = (note: number, noteName: NoteName, depressed: boolean, inCurrentKey: boolean) => {
        let classNames = Cx(
            "key", "white-key", noteName, 
            {
                "depressed": depressed, 
                "in-current-key": inCurrentKey,
                "take-playing": this.props.takeIsPlaying
            }
        );

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
            upperElement: this.renderKey(note, noteName, classNames, upperStyle),
            lowerElement: this.renderKey(note, noteName, classNames, lowerStyle)
        };
    }

    public getBlackKey = (note: number, noteName: NoteName, depressed: boolean, inCurrentKey: boolean): JSX.Element => {
        let blackKeyStyle = {
            width: this._BLACK_KEY_WIDTH, 
            height: this._KEY_HEIGHT
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

    public renderKey = (note: number, noteName: NoteName, classNames: string, style: any): JSX.Element => {
        return (
            <div 
                key={`${noteName}${note}`} 
                className={classNames} 
                style={style} 
                onMouseDown={() => this.onPianoKeyDown(note)} 
                onMouseUp={() => this.onPianoKeyUp(note)} />
        );
    }

    private onPianoKeyDown = (note: number) => {
        let message: IMidiMessage = { 
            data: [144, note, 127]
        };
        this.props.playUserMidiMessage(message);
    }

    private onPianoKeyUp = (note: number) => {
        let message: IMidiMessage = {
            data: [128, note, 0]
        }
        this.props.playUserMidiMessage(message);
    }
};

export default Keyboard;