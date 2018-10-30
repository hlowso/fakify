import React, { Component } from "react";
import Cx from "classnames";
import * as MusicHelper from "../../../shared/music/MusicHelper";
import * as Util from "../../../shared/Util";
import { NoteName, IMidiMessage } from "../../../shared/types";
import "./Keyboard.css";

export interface IKeyboardProps {
    isMobile: boolean;
    lowestKey: number;
    highestKey: number;
    showKeyChanges: boolean;
    depressedKeys: number[];
    currentKeyBasePitches: number[];
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
    private _WIDER_UPPER_WHITE_KEY_WIDTH = 25; 
    private _NARROWER_UPPER_WHITE_KEY_WIDTH = 15; 
    private _LOWER_WHITE_KEY_WIDTH = 35; 
    private _BLACK_KEY_WIDTH = 20; 

    constructor(props: IKeyboardProps) {
        super(props);
        this.state = {
            mouseIsDown: false
        };
    }

    public render(): JSX.Element {
        let { isMobile } = this.props;

        let dynamicStyle = {
            height: isMobile ? 100 : 160
        };

        return (
            <div id="keyboard" style={dynamicStyle} >
                {this.renderKeys()}
            </div>
        );
    }

    public renderKeys = (): JSX.Element => {
        let { lowestKey, highestKey, isMobile } = this.props;
        let upperElements = [],
            lowerElements = [];

        for (let note = lowestKey; note <= highestKey; note ++) {
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

        let dynamicStyle = {
            height: isMobile ? 50 : 80
        };

        return (
            <div className="keys" onMouseLeave={() => this.onPianoKeyUp()}>
                <div className="upper-keys" style={dynamicStyle}>
                    {upperElements}
                </div>
                <div className="lower-keys" style={dynamicStyle}>
                    {lowerElements}
                </div>
            </div>
        );
    }

    public getWhiteKey = (note: number, noteName: NoteName) => {
        let { lowestKey, highestKey } = this.props;
        let upperStyle = {
            flexGrow: this._WIDER_UPPER_WHITE_KEY_WIDTH, 
            height: this._KEY_HEIGHT
        };

        let lowerStyle = {
            flexGrow: this._LOWER_WHITE_KEY_WIDTH, 
            height: this._KEY_HEIGHT
        }

        if ([
                MusicHelper.NOTE_NAMES[2], 
                MusicHelper.NOTE_NAMES[7], 
                MusicHelper.NOTE_NAMES[9]
            ].indexOf(noteName) !== -1
        ) {
            upperStyle.flexGrow = this._NARROWER_UPPER_WHITE_KEY_WIDTH;
        }

        if (note === lowestKey) {
            upperStyle.flexGrow = this._WIDER_UPPER_WHITE_KEY_WIDTH;
        }
        if (note === highestKey) {
            upperStyle.flexGrow = this._LOWER_WHITE_KEY_WIDTH;
        }

        return {
            upperElement: this.renderKey(note, noteName, false, upperStyle),
            lowerElement: this.renderKey(note, noteName, false, lowerStyle)
        };
    }

    public getBlackKey = (note: number, noteName: NoteName): JSX.Element => {
        let blackKeyStyle = {
            flexGrow: this._BLACK_KEY_WIDTH, 
            height: this._KEY_HEIGHT
        };

        return this.renderKey(note, noteName, true, blackKeyStyle);
    }

    public renderKey = (note: number, noteName: NoteName, isBlack = false, style: any): JSX.Element => {
        let { showKeyChanges, depressedKeys, firstNote, rangeStartNote, rangeEndNote, takeIsPlaying } = this.props;
        let keyDepressed = depressedKeys.indexOf(note) !== -1;
        let classes = Cx({
            "key": true,
            "depressed": keyDepressed, 
            "in-current-key": showKeyChanges && this.pitchIsInKey(note),
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

    /**
     * EVENT HANDLERS
     */

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

    /**
     * HELPERS
     */

    private pitchIsInKey = (pitch: number) => {
        return this.props.currentKeyBasePitches.indexOf(Util.mod(pitch, 12)) !== -1;
    }
};

export default Keyboard;