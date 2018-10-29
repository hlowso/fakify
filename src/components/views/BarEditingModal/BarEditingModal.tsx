import React, { Component } from "react";
import Cx from "classnames";
import { Modal, Button, Glyphicon, ButtonGroup, DropdownButton, MenuItem } from "react-bootstrap";
import * as Util from "../../../shared/Util";
import * as MusicHelper from "../../../shared/music/MusicHelper";
import { Domain } from "../../../shared/music/domain/Domain";
import { IChartBar, IChordSegment, ChordShape, ChordName, NoteName, PresentableChordShape } from "../../../shared/types";
import "./BarEditingModal.css";

export interface IBarEditingModalProps {
    isMobile: boolean;
    isOpen: boolean;
    close: () => void;
    onEdit: (updatedBar: IChartBar) => void;
    onSave: () => void;
    onAddNeighbour?: (barIdx: number) => void;
    onDeleteBar?: () => void;
    editingBar: IChartBar;
    currentContext: NoteName;
};

export interface IBarEditingModalState {

};

export class BarEditingModal extends Component<IBarEditingModalProps, IBarEditingModalState> {
    constructor(props: IBarEditingModalProps) {
        super(props);
        this.state = {

        };
    }

    public render() {
        let { isOpen, close, editingBar, isMobile } = this.props;
        let classes = Cx("bar-editing-modal", isMobile ? "mobile" : `chords-${editingBar.timeSignature[0]}`);

        return (
            <Modal dialogClassName={classes} show={isOpen} onHide={close}>
                <Modal.Header closeButton={true} >
                    <h2>Bar {editingBar.barIdx + 1}</h2>
                </Modal.Header>
                <Modal.Body>
                    {this.renderTimeSignatureSelect()}
                    {this.renderChordsSection()}
                </Modal.Body>
                <Modal.Footer>
                    {this.renderFooterButtons()}
                </Modal.Footer>
            </Modal>
        );
    }

    public renderFooterButtons() {
        let { isMobile, onAddNeighbour, onDeleteBar, editingBar } = this.props;

        if (!editingBar) {
            return;
        }

        return (
            <div>
                {isMobile && onAddNeighbour && (
                    <Button onClick={() => (onAddNeighbour as (barIdx: number) => void)(editingBar.barIdx)} >
                        <span>
                            Add<br/>Bar<br/>Before
                        </span>
                    </Button>
                )}
                {isMobile && onDeleteBar && (
                    <Button bsStyle="danger" onClick={() => (onDeleteBar as () => void)()}>
                        Delete
                    </Button>
                )}
                <Button bsStyle="primary" onClick={() => this.props.onSave()} >
                    Save
                </Button>
                {isMobile && onAddNeighbour && (
                    <Button onClick={() => (onAddNeighbour as (barIdx: number) => void)(editingBar.barIdx + 1)} >
                        <span>
                            Add<br/>Bar<br/>After
                        </span>
                    </Button>
                )}
            </div>
        )
    }

    /**
     * TIME SIGNATURE EDITING
     */

    public renderTimeSignatureSelect() {
        let { editingBar } = this.props;
        let options = this.renderTimeOptions();

        return (
            <div style={{ marginTop: 10 }} >
                <span style={{ fontSize: "130%" }}>
                    Time Signature:&nbsp;
                </span>
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

    public renderTimeOptions() {
        return [2, 3, 4, 5, 6, 7].map(beats => (
            <option key={beats} value={beats} >
                {beats}
            </option>
        ));
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
        let { editingBar } = this.props;
        let { timeSignature, chordSegments } = editingBar;
        let editingChords: JSX.Element[] = [];

        for (let beatIdx = 0; beatIdx < timeSignature[0]; beatIdx ++) {
            let segment = chordSegments.find(s => s.beatIdx === beatIdx) as IChordSegment;
            let chordName = (segment ? segment.chordName : undefined) as ChordName;

            editingChords.push(
                <div style={{ padding: "3px" }}>
                    <div>
                        Beat {beatIdx + 1}
                    </div>
                    {chordName
                        ? this.renderEditableChord(chordName, beatIdx)
                        : (
                            <Button style={{ padding: 3, height: "30px" }} onClick={() => this._onAddChord(beatIdx)} >
                                <Glyphicon glyph="plus" />
                            </Button>
                        )
                    }
                </div>
            );
        }

        return (
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column" }} >
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }} >
                    {editingChords}
                </div>
            </div>
        );
    }

    public renderEditableChord(chordName: ChordName, beatIdx: number) {
        let { currentContext } = this.props;
        return (
            <div>
                <ButtonGroup>
                    <DropdownButton 
                        id={`select-root-${beatIdx}`} 
                        title={MusicHelper.getPresentableNoteName(chordName[0] as NoteName, currentContext)}
                        style={{ padding: 3, height: "30px" }}
                    >
                        {this.renderNoteOptions(beatIdx, chordName)}
                    </DropdownButton>
                    <DropdownButton 
                        id={`select-shape-${beatIdx}`} 
                        title={PresentableChordShape[chordName[1]] || "maj"} 
                        style={{ padding: 3, height: "30px" }}
                    >
                        {this.renderShapeOptions(beatIdx, chordName)}
                    </DropdownButton>
                    {
                        beatIdx !== 0
                            ? (
                                <Button 
                                    bsStyle="danger" 
                                    onClick={() => this._onRemoveChord(beatIdx)} 
                                    style={{ padding: 3, height: "30px" }}
                                >
                                    <Glyphicon glyph="minus" />
                                </Button>
                            ) : undefined 
                    }
                </ButtonGroup>

            </div>
        );
    }

    public renderNoteOptions(beatIdx: number, selected: ChordName) {

        let { currentContext } = this.props;

        return Domain.NOTE_NAMES.map(note => (
            <MenuItem 
                key={note} 
                active={selected[0] === note} 
                onClick={() => this._onChangeChord(beatIdx, [ note, selected[1] ])}
            >
                {MusicHelper.getPresentableNoteName(note, currentContext)}
            </MenuItem>
        ));
    }

    public renderShapeOptions(beatIdx: number, selected: ChordName) {
        let shapeOptions: JSX.Element[] = [];
        for (let shapeKey in PresentableChordShape) {
            let shape = PresentableChordShape[shapeKey] || "maj";
            shapeOptions.push(
                <MenuItem 
                    key={shapeKey} 
                    active={selected[1] === shapeKey} 
                    onClick={() => this._onChangeChord(beatIdx, [ selected[0], shapeKey as ChordShape ])} 
                >
                    {shape}
                </MenuItem>
            );
        }

        return shapeOptions;
    }

    private _onAddChord = (beatIdx: number) => {
        let { editingBar, currentContext } = this.props;
        let updatedBar = Util.copyObject(editingBar);

        let segmentIdx = 0;
        editingBar.chordSegments.forEach(segment => { 
            if ((segment.beatIdx as number) < beatIdx) { 
                segmentIdx ++;
            } 
        });
      
        let newSegment: IChordSegment = {
            beatIdx,
            chordName: [ currentContext, ChordShape.Maj ]
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