import React, { Component } from "react";
import Modal from "react-modal";
import * as Util from "../../../shared/Util";
import { Domain } from "../../../shared/music/domain/Domain";
import { IChartBar, IChordSegment, ChordShape, ChordName, NoteName } from "../../../shared/types";
import "./BarEditingModal.css";

export interface IBarEditingModalProps {
    isOpen: boolean;
    close: () => void;
    onEdit: (updatedBar: IChartBar) => void;
    onSave: () => void;
    editingBar: IChartBar;
};

export interface IBarEditingModalState {

};

const modalStyles = {
    overlay: {
        backgroundColor: "rgba(150, 150, 150, 0.75)",
    },
    content: {
        display: "flex",
        flexDirection: "column",
        margin: "auto",
        width: "600px",
        borderRadius: "10px",
        backgroundColor: "#ddd",
    }
};

export class BarEditingModal extends Component<IBarEditingModalProps, IBarEditingModalState> {
    constructor(props: IBarEditingModalProps) {
        super(props);
        this.state = {

        };
    }

    public render() {
        let { isOpen, close, editingBar } = this.props;
        
        return (
            <Modal
                isOpen={isOpen}
                onRequestClose={close}
                contentLabel={"Bar Editing"} 
                style={modalStyles} 
            >
                <div id="midi-settings-modal" >
                    <div className="header">
                        <span>Bar {editingBar.barIdx + 1}</span>
                    </div>
                    {this.renderTimeSignatureSelect()}
                    {this.renderChordsSection()}
                   <button style={{ marginTop: 10 }} onClick={() => this.props.onSave()} >Save</button>
                </div>
            </Modal>
        );
    }

    /**
     * TIME SIGNATURE EDITING
     */

    public renderTimeSignatureSelect() {
        let { editingBar } = this.props;
        let options = [2, 3, 4, 5, 6, 7].map(beats => (
            <option key={beats} value={beats} >
                {beats}
            </option>
        ));

        return (
            <div style={{ marginTop: 10 }} >
                <div>
                    Time Signature:
                </div>
                <select 
                    value={editingBar.timeSignature[0]}
                    onChange={event => this._onTimeSignatureChange(parseInt(event.target.value, undefined))}
                >
                    {options}
                </select>
                {" / 4"} 
            </div>
        );
    }

    private _onTimeSignatureChange = (timeSignatureBeats: number) => {
        let updatedBar = Util.copyObject(this.props.editingBar);
        updatedBar.timeSignature[0] = timeSignatureBeats;

        // Remove chords no longer covered by time signature
        updatedBar.chordSegments = updatedBar.chordSegments.filter(segment => (segment.beatIdx as number) < timeSignatureBeats);

        this.props.onEdit(updatedBar);
    }

    /**
     * CHORDS EDITING
     */

    public renderChordsSection() {
        let { timeSignature, chordSegments } = this.props.editingBar;
        let editingChords: JSX.Element[] = [];

        let noteOptions = Domain.NOTE_NAMES.map(note => (
            <option key={note} value={note} >
                {note}
            </option>
        ));

        let shapeOptions: JSX.Element[] = [];
        for (let shapeKey in ChordShape) {
            let shape = ChordShape[shapeKey];
            shapeOptions.push(
                <option key={shapeKey} value={shape} >
                    {shapeKey}
                </option>
            );
        }
       
        for (let beatIdx = 0; beatIdx < timeSignature[0]; beatIdx ++) {
            let segment = chordSegments.find(s => s.beatIdx === beatIdx) as IChordSegment;
            let chordName = (segment ? segment.chordName : undefined) as ChordName;

            editingChords.push(
                <div>
                    <div>
                        Beat {beatIdx + 1}:
                    </div>
                    {chordName
                        ? (
                            <div>
                                <select 
                                    value={chordName[0]}
                                    onChange={event => this._onChangeChord(beatIdx, [event.target.value as NoteName, chordName[1]])}
                                >
                                    {noteOptions}
                                </select>
                                <select 
                                    value={chordName[1]}
                                    onChange={event => this._onChangeChord(beatIdx, [chordName[0], event.target.value as ChordShape])}
                                >
                                    {shapeOptions}
                                </select>
                                {
                                    beatIdx !== 0
                                        ? (
                                            <button onClick={() => this._onRemoveChord(beatIdx)} >
                                                -
                                            </button>
                                        ) : undefined 
                                }
                            </div>
                        )
                        : (
                            <span onClick={() => this._onAddChord(beatIdx)} >
                                +
                            </span>
                        )
                    }
                </div>
            );
        }

        return (
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column" }} >
                <div>
                    Chords
                </div>
                <div style={{ display: "flex" }} >
                    {editingChords}
                </div>
            </div>
        );
    }

    private _onAddChord = (beatIdx: number) => {
        let { editingBar } = this.props;
        let updatedBar = Util.copyObject(editingBar);

        let segmentIdx = 0;
        editingBar.chordSegments.forEach(segment => { 
            if ((segment.beatIdx as number) < beatIdx) { 
                segmentIdx ++;
            } 
        });
      
        let newSegment: IChordSegment = {
            beatIdx,
            chordName: ["C", ChordShape.Maj]
        } 

        updatedBar.chordSegments.splice(segmentIdx, 0, newSegment);
        this.props.onEdit(updatedBar);
    }

    private _onRemoveChord = (beatIdx: number) => {
        let { editingBar } = this.props;
        let updatedBar = Util.copyObject(editingBar);
        let segmentIdx = 0;
        editingBar.chordSegments.forEach(segment => { 
            if ((segment.beatIdx as number) < beatIdx) { 
                segmentIdx ++;
            } 
        });

        updatedBar.chordSegments.splice(segmentIdx, 1);
        this.props.onEdit(updatedBar);
    }

    private _onChangeChord = (beatIdx: number, chordName: ChordName) => {
        let { editingBar } = this.props;
        let updatedBar = Util.copyObject(editingBar);
        let segmentIdx = 0;

        for (let segment of editingBar.chordSegments) {
            if (segment.beatIdx === beatIdx) {
                break;
            }
            segmentIdx ++;
        }

        let updatedSegment: IChordSegment = {
            beatIdx,
            chordName
        }

        updatedBar.chordSegments[segmentIdx] = updatedSegment;
        this.props.onEdit(updatedBar);        
    }
};