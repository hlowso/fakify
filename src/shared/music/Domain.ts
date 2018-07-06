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
                let domIdx = !typeIsNumber ? ((notes as INote[]).find(note => Util.mod(note.pitch, 12) === moduloPitch) as INote).domainIdx : undefined;
                this._notes.push(this.createNote(n, domIdx));
            }
        }
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

    public getRandomPitch(a = this.lowestPitch, b = this.highestPitch) {
        let [lowIdx, lowNote] = Util.binarySearch(this._notes, this.createNote(a), this.compareNotes);
        let [highIdx, highNote] = Util.binarySearch(this._notes, this.createNote(b), this.compareNotes);

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

    protected compareNotes(a: INote, b: INote) {
        return a.pitch - b.pitch;
    }

    protected createNote(pitch: number, domainIdx?: number): INote {
        return {
            name: Domain.NOTE_NAMES[Util.mod(pitch, 12)],
            pitch,
            domainIdx
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
            case ChordShape.Dom:
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

    constructor(chordName: ChordName) {
        let [ noteName, shape ] = chordName;
        let { baseIntervals, relativePositions, extend } = ChordClass.shapeToInfo(shape);
        let intervals = (extend || Util.identity)(baseIntervals);
        let lowestPitch = Domain.getLowestPitch(noteName);

        super(intervals.map((pitchDiff, i) => { 
            let pitch = lowestPitch + pitchDiff;
            return {
                name: Domain.NOTE_NAMES[Util.mod(pitch, 12)],
                pitch,
                domainIdx: 2 * i + 1
            };
        }));
        this._suitableKeys = relativePositions.map(pos => Domain.getTonicByPosition(noteName, pos));
    }

    // public voice(target: number, ref: number[] = []): number[] {
    //     if (ref.length > 0) {
    //         // TODO: write clever voicing algorithm here ...
    //         return [];
    //     }

    //     // TODO: write a better chord generating algorithm ...

    //     // let [idx, nearestNote] = Util.binarySearch(this._notes, this.createNote(target), this.compareNotes);
    //     let [idx, targetTonic] = this.tonicBase;

    //     while (Math.abs(targetTonic.pitch - target) > 5) {
    //         idx += this.setLength;
    //         targetTonic = this._notes[idx];
    //     }

    //     let pitches = [];

    //     for (let i = 1; i < this.setLength; i ++) {
    //         idx ++;
    //         pitches.push(this._notes)
    //     }

    //     return [nearestBaseNote, ...];
    // }

    get tonicBase(): [number, INote] {
        let idx = 0;
        let currNote = this._notes[idx];
        while (currNote.domainIdx !== 1) {
            currNote = this._notes[++idx];
        }
        return [idx, currNote];
    }

    get suitableKeys(): NoteName[] {
        return this._suitableKeys;
    }
}