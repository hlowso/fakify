import * as Util from "../Util";
import { LOWEST_A, HIGHEST_C } from "./MusicHelper";
import { NoteName, ChordName, ChordShape, IShapeInfo, RelativeNoteName, INote } from "../types";

export class Domain {
    public static NOTE_NAMES: NoteName[] = ["C", "C#|Db", "D", "D#|Eb", "E", "F", "F#|Gb", "G", "G#|Ab", "A", "A#|Bb", "B|Cb"]; 
    public static RELATIVE_SCALE: RelativeNoteName[] = ["1", "H", "2", "N", "3", "4", "T", "5", "U", "6", "J", "7"];
    public static MAJOR_SCALE_INDECES: number[] = [0, 2, 4, 5, 7, 9, 11];

    public static getLowestPitch = (noteName: NoteName) => {
        return Domain.NOTE_NAMES.indexOf(noteName);
    }

    public static getTonicByPosition = (noteName: NoteName, position: RelativeNoteName) => {
        let noteIdx = Domain.NOTE_NAMES.indexOf(noteName);
        return Domain.NOTE_NAMES[Util.mod(noteIdx - Domain.RELATIVE_SCALE.indexOf(position), 12)];
    }

    protected _notes: INote[];
    private _setLength: number;

    // TODO: refactor the following / decide if it's not too ugly to 
    // necessitate refactoring
    constructor(notes: number[] | INote[]) {
        let typeIsNumber = typeof notes[0] === "number";
        let pitches = typeIsNumber ? (notes as number[]) : (notes as INote[]).map(note => note.pitch); 
        let moduloPitches = pitches.map(note => Util.mod(note, 12));
        let uniquePitches: number[] = [];

        this._setLength = 0;
        this._notes = [];
        
        moduloPitches.forEach(note => {
            if (uniquePitches.indexOf(note) === -1) {
                uniquePitches.push(note);
                this._setLength ++;
            }
        });

        for (let n = LOWEST_A; n <= HIGHEST_C; n ++) {
            let moduloPitch = Util.mod(n, 12);
            if (moduloPitches.indexOf(moduloPitch) !== -1) {
                let domIdx = !typeIsNumber ? ((notes as INote[]).find(note => Util.mod(note.pitch, 12) === moduloPitch) as INote).position : undefined;
                this._notes.push(this.createNote(n, domIdx));
            }
        }
    }

    get length(): number {
        return this._notes.length;
    }

    get setLength(): number {
        return this._setLength;
    }

    get lowestPitch(): number {
        return this._notes[0].pitch;
    }

    get highestPitch(): number {
        return this._notes[this._notes.length - 1].pitch;
    }

    public getLowestNoteByPosition(position: number) {
        for(let idx = 0; idx < this.length; idx ++) {
            let note = this._notes[idx];
            if (note.position === position) {
                return note;
            }
        }
        return null;
    }

    // TODO: the following parameter "note" is a position, 
    // not a pitch if it's a number. Refactor this function 
    // to make that clear 
    public hasNote(note: NoteName | number): boolean {
        for (let idx = 0; idx < this.setLength; idx ++) {
            let currNote = this._notes[idx];
            if (typeof note === "number") {
                if (currNote.position === note) {
                    return true;
                }
            }
            if (currNote.name === note) {
                return true;
            }
        }
        return false;
    }

    public getRandomPitch(a = this.lowestPitch, b = this.highestPitch) {
        let [lowIdx, lowNote] = this.getClosestNoteToTargetPitch(a);
        let [highIdx, highNote] = this.getClosestNoteToTargetPitch(b);

        while (lowNote.pitch < a) {
            lowIdx ++;
            lowNote = this._notes[lowIdx];
        }

        while (highNote.pitch > b) {
            highIdx --;
            highNote = this._notes[highIdx];
        }

        let idx = Math.floor(lowIdx + (highIdx - lowIdx) * Math.random());
        return this._notes[idx].pitch;
    }

    public getClosestNoteToTargetPitch(target: number): [number, INote] {
        return Util.binarySearch(this._notes, this.createNote(target), this.compareNotes);
    }

    // TODO: same issue here as the one described above hasNote
    public getClosestNoteInstance(target: number, noteOrPos: NoteName | number): [number, INote | null] {
        if (!this.hasNote(noteOrPos)) {
            return [NaN, null];
        }

        let position = typeof noteOrPos === "number" ? noteOrPos : undefined;

        let [idx, closest] = this.getClosestNoteToTargetPitch(target);
        let lowestPitch = position ? (this.getLowestNoteByPosition(position) as INote).pitch : Domain.getLowestPitch(noteOrPos as NoteName);
        let diff = lowestPitch - Util.mod(closest.pitch, 12);
        let summand = (
            Math.abs(diff) > 5
                ? diff < 0 ? 1 : -1 
                : diff < 0 ? -1 : 1
        );

        let conditionFunc = (
            position
                ? (note: INote) => note.position === position
                : (note: INote) => note.name === noteOrPos
        );

        while (!conditionFunc(closest)) {
            idx += summand;
            closest = this._notes[idx];
        }

        return [idx, closest];
    }

    protected compareNotes(a: INote, b: INote) {
        return a.pitch - b.pitch;
    }

    protected createNote(pitch: number, position?: number): INote {
        return {
            name: Domain.NOTE_NAMES[Util.mod(pitch, 12)],
            pitch,
            position
        }
    }
}

export class ChordClass extends Domain {
    public static shapeToInfo = (shape: ChordShape): IShapeInfo => {
        switch (shape) {
            case ChordShape.Maj:
                return {
                    shape,
                    baseIntervals: [0, 4, 7],
                    relativePositions: ["1", "4", "5"]
                };
            case ChordShape.Min:
                return {
                    shape,
                    baseIntervals: [0, 3, 7],
                    relativePositions: ["2", "3", "6"]
                };
            case ChordShape.Maj7:
                return {
                    shape,
                    baseIntervals: [0, 4, 7, 11],
                    relativePositions: ["1", "4"]
                };
            case ChordShape.Min7:
                return {
                    shape,
                    baseIntervals: [0, 3, 7, 10],
                    relativePositions: ["2", "3", "6"]
                };
            case ChordShape.Dom7:
                return {
                    shape,
                    baseIntervals: [0, 4, 7, 10],
                    relativePositions: ["5"]
                };
            case ChordShape.Dim:
                return {
                    shape,
                    baseIntervals: [0, 3, 6],
                    relativePositions: ["7"]
                };

            // TODO: add cases for all chords
            
            default: 
                throw new Error(`PRECOMP - error: unkown ChordShape ${shape}`);
        }
    }

    private _suitableKeys: NoteName[]; 
    private _order: number;

    constructor(chordName: ChordName) {
        let [ noteName, shape ] = chordName;
        let { baseIntervals, relativePositions, extend } = ChordClass.shapeToInfo(shape);
        let intervals = (extend || Util.identity)(baseIntervals);
        let lowestPitch = Domain.getLowestPitch((noteName as NoteName));

        super(intervals.map((pitchDiff, i): INote => { 
            let pitch = lowestPitch + pitchDiff;
            let position = 2 * i + 1;
            this._order = position;
            return {
                name: Domain.NOTE_NAMES[Util.mod(pitch, 12)],
                pitch,
                position
            };
        }));
        this._suitableKeys = relativePositions.map(pos => Domain.getTonicByPosition((noteName as NoteName), pos));
    }

    public voice(target: number, ref: number[] = []): number[] {
        return (
            ref.length > 0
                ? this._voiceWithReference(target, ref)
                : this._generateVoicing(target)
        );
    }

    public getRandomTriad(target: number): number[] {
        let tonic = (this.getClosestNoteInstance(target, 1)[1] as INote);
        let inversion = Math.floor(Math.random() * 3);
        
        let thirdAbove = (this.getClosestNoteInstance(tonic.pitch, 3)[1] as INote);
        let thirdBelow = (this.getClosestNoteInstance(tonic.pitch - 12, 3)[1] as INote);
        let fifthAbove = (this.getClosestNoteInstance(tonic.pitch + 12, 5)[1] as INote);
        let fifthBelow = (this.getClosestNoteInstance(tonic.pitch, 5)[1] as INote);

        switch (inversion) {
            default:
            case 0:
                return [tonic.pitch, thirdAbove.pitch, fifthAbove.pitch];
            case 1:
                return [fifthBelow.pitch, tonic.pitch, thirdAbove.pitch];
            case 3:
                return [thirdBelow.pitch, fifthBelow.pitch, tonic.pitch];
        }
    }

    private _generateVoicing(target: number) {
        if (this._order < 7) {
            return this.getRandomTriad(target);
        }

        // TODO: write a better chord generating algorithm ...

        let tonicBase = this.tonicBase;
        let idx = tonicBase[0], targetTonic = tonicBase[1];

        while (Math.abs(targetTonic.pitch - target) > 6) {
            idx += this.setLength;
            targetTonic = this._notes[idx];
        }

        let pitches: number[] = [ targetTonic.pitch ];

        for (let i = 1; i < this.setLength; i ++) {
            idx ++;
            pitches.push(this._notes[idx].pitch);
        }

        return pitches.sort((a, b) => a - b);

    }

    private _voiceWithReference(target: number, ref: number[]): number[] {
        // TODO:  write clever voicing algorithm here ...
        return [];
    }

    get order(): number {
        return this._order;
    }

    get tonicBase(): [number, INote] {
        let idx = 0;
        let currNote = this._notes[idx];
        while (currNote.position !== 1) {
            currNote = this._notes[++idx];
        }
        return [idx, currNote];
    }

    get tonicName(): NoteName {
        return this.tonicBase[1].name;
    }

    get suitableKeys(): NoteName[] {
        return this._suitableKeys;
    }
}