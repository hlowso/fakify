import { Domain } from "./Domain";
import { NoteName } from "../../types";
import * as Util from "../../Util";

export class Note {
    private _name: NoteName;
    private _basePitch: number;
    private _pitch: number;
    private _position: number;
    private _required: boolean;

    constructor(note: NoteName | number, position?: number, required = false) {
        let noteIsName = typeof note === "string";
        if (noteIsName) {
            note = note as NoteName;
            let basePitch = Domain.NOTE_NAMES.indexOf(note);
            if (basePitch === -1) {
                throw new Error(`PRECOMP - ERROR: cannot create Note class instance with note name ${note}`);
            }
            this._name = note;
            this._basePitch = basePitch;
        } else {
            note = note as number;
            let basePitch = Util.mod(note, 12);
            if (!Number.isInteger(basePitch)) {
                throw new Error(`PRECOMP - ERROR: cannot create Note class instance with pitch ${note}`);
            }
            this._pitch = note;
            this._basePitch = basePitch;
            this._name = Domain.NOTE_NAMES[this._basePitch];
        }
        if (position === undefined || !Number.isInteger(position) || position < 1 || position > 13) {
            position = NaN;
        }
        this._position = position;
        this._required = required;
    }

    get name(): NoteName {
        return this._name;
    }

    get basePitch(): number {
        return this._basePitch;
    }

    get pitch(): number {
        return this._pitch;
    }

    get position(): number {
        return this._position;
    }

    get scalePosition(): number {
        if (isNaN(this._position)) {
            return NaN;
        }
        return Util.mod(this._position, 8) + 1;
    }

    get chordPosition(): number {
        if (isNaN(this._position)) {
            return NaN;
        }
        if (this._position % 2 === 0) {
            return this._position + 7;
        }
        return this._position;
    }

    get isRequired() {
        return this._required;
    }

    public asNoteClass(): Note {
        return new Note(this._name, this._position, this._required);
    }

    public pitchDiff(note: Note) {
        return this._pitch - note.pitch;
    }

    public isCloseNeighboursWith(note: Note) {
        return Math.abs(this.pitchDiff(note)) <= 2;
    }
}