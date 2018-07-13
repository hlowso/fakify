import * as Util from "../Util";
import { Note } from "./Note";
import { LOWEST_A, HIGHEST_C } from "./MusicHelper";
import { NoteName, ChordName, ChordShape, IShapeInfo, RelativeNoteName } from "../types";

export class Domain {
    public static NOTE_NAMES: NoteName[] = ["C", "C#|Db", "D", "D#|Eb", "E", "F", "F#|Gb", "G", "G#|Ab", "A", "A#|Bb", "B|Cb"]; 
    public static RELATIVE_SCALE: RelativeNoteName[] = ["1", "H", "2", "N", "3", "4", "T", "5", "U", "6", "J", "7"];
    public static MAJOR_SCALE_INDECES: number[] = [0, 2, 4, 5, 7, 9, 11];

    public static getLowestPitch = (noteName: NoteName) => {
        return Domain.NOTE_NAMES.indexOf(noteName);
    }

    public static getTonicNameByPosition = (noteName: NoteName, position: RelativeNoteName) => {
        let noteIdx = Domain.NOTE_NAMES.indexOf(noteName);
        return Domain.NOTE_NAMES[Util.mod(noteIdx - Domain.RELATIVE_SCALE.indexOf(position), 12)];
    }

    protected _notes: Note[];
    protected _noteClasses: Note[];
  
    constructor(notes: Note[] | number[] | NoteName[]) {
        if (notes[0] instanceof Note) {
            this._noteClasses = (notes as Note[]).map(note => note.asNoteClass());
        } else {
            let typeIsNumber = typeof notes[0] === "number";
            let pitches = (
                typeIsNumber 
                    ? (notes as number[]).map(note => Util.mod(note, 12)) 
                    : (notes as NoteName[]).map(Domain.getLowestPitch)
            );
            let uniquePitches: number[] = [];

            pitches.forEach(pitch => {
                if (uniquePitches.indexOf(pitch) === -1) {
                    uniquePitches.push(pitch);
                }
            });

            this._noteClasses = uniquePitches.map(pitch => new Note(pitch));
        }

        this._buildFromNoteClasses();
    }

    get length(): number {
        return this._notes.length;
    }

    get noteClasses(): Note[] {
        return this._noteClasses;
    }

    get numberOfNoteClasses(): number {
        return this._noteClasses.length;
    }

    get lowestPitch(): number {
        return this._notes[0].pitch;
    }

    get highestPitch(): number {
        return this._notes[this._notes.length - 1].pitch;
    }

    public mutate(mutation: (baseNotes: Note[]) => Note[]) {
        this._noteClasses = mutation(this._noteClasses);
        this._buildFromNoteClasses();
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
    public hasNote(nameOrPos: NoteName | number): boolean {
        for (let idx = 0; idx < this.numberOfNoteClasses; idx ++) {
            let currNote = this._notes[idx];
            if (typeof nameOrPos === "number") {
                if (currNote.position === nameOrPos) {
                    return true;
                }
            }
            if (currNote.name === nameOrPos) {
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

    public getClosestNoteToTargetPitch(target: number): [number, Note] {
        return Util.binarySearch(this._notes, new Note(target), this._compareNotes);
    }

    // TODO: same issue here as the one described above hasNote
    public getClosestNoteInstance(target: number, nameOrPos: NoteName | number): [number, Note | null] {
        if (!this.hasNote(nameOrPos)) {
            return [NaN, null];
        }

        let position = typeof nameOrPos === "number" ? nameOrPos : undefined;

        let [idx, closest] = this.getClosestNoteToTargetPitch(target);
        let lowestPitch = position ? (this.getLowestNoteByPosition(position) as Note).pitch : Domain.getLowestPitch(nameOrPos as NoteName);
        let diff = lowestPitch - Util.mod(closest.pitch, 12);
        let summand = (
            Math.abs(diff) > 5
                ? diff < 0 ? 1 : -1 
                : diff < 0 ? -1 : 1
        );

        let conditionFunc = (
            position
                ? (note: Note) => note.position === position
                : (note: Note) => note.name === nameOrPos
        );

        while (!conditionFunc(closest)) {
            idx += summand;
            closest = this._notes[idx];
        }

        return [idx, closest];
    }

    // For binary search...
    protected _compareNotes(a: Note, b: Note) {
        return a.pitch - b.pitch;
    }

    protected _buildFromNoteClasses() {
        this._notes = [];
        let basePitches = this._noteClasses.map(noteClass => noteClass.basePitch);
        for (let n = LOWEST_A; n <= HIGHEST_C; n ++) {
            let moduloPitch = Util.mod(n, 12);
            if (basePitches.indexOf(moduloPitch) !== -1) {
                let position = (this._noteClasses.find(noteClass => noteClass.basePitch === moduloPitch) as Note).position;
                this._notes.push(new Note(n, position));
            }
        }
    }
}

export class ChordClass extends Domain {
    public static shapeToInfo = (shape: ChordShape): IShapeInfo => {
        let extend: (notes: Note[]) => Note[];
        switch (shape) {
            case ChordShape.Maj:
                return {
                    shape,
                    baseIntervals: [0, 4, 7],
                    suitableRelativeKeys: ["1", "4", "5"]
                };
            case ChordShape.Min:
                return {
                    shape,
                    baseIntervals: [0, 3, 7],
                    suitableRelativeKeys: ["2", "3", "6"]
                };
            case ChordShape.Maj7:
                return {
                    shape,
                    baseIntervals: [0, 4, 7, 11],
                    suitableRelativeKeys: ["1", "4"]
                };
            case ChordShape.Min7:
                return {
                    shape,
                    baseIntervals: [0, 3, 7, 10],
                    suitableRelativeKeys: ["2", "3", "6"]
                };
            case ChordShape.Dom7:
                return {
                    shape,
                    baseIntervals: [0, 4, 7, 10],
                    suitableRelativeKeys: ["5"]
                };
            case ChordShape.Dom9:
                let infoBase = ChordClass.shapeToInfo(ChordShape.Dom7);
                extend = notes => {
                    let notesCopy = Util.copyObject(notes);
                    let tonic = notes.find(note => note.scalePosition === 1);
                    let ninth = notes.find(note => note.scalePosition === 2);
                    if (ninth === undefined) {
                        notesCopy.push(new Note((tonic as Note).basePitch + 2, 9).asNoteClass());
                    }
                    return notesCopy;
                };
                return { ...infoBase, extend };
            case ChordShape.Dim:
                return {
                    shape,
                    baseIntervals: [0, 3, 6],
                    suitableRelativeKeys: ["7"]
                };

            // TODO: add cases for all chords
            
            default: 
                throw new Error(`PRECOMP - error: unkown ChordShape ${shape}`);
        }
    }

    private _suitableKeys: NoteName[]; 
    private _order: number;
    private _specialNotesMutaion: (notes: Note[]) => Note[];

    constructor(chordName: ChordName) {
        let [ noteName, shape ] = chordName;
        let { baseIntervals, suitableRelativeKeys, extend } = ChordClass.shapeToInfo(shape);
        let lowestPitch = Domain.getLowestPitch((noteName as NoteName));
        let specialNotesMutaion = extend || Util.identity;
        let highestPosition = 1;
        let baseNotes = baseIntervals.map((pitchDiff, i): Note => { 
            let pitch = lowestPitch + pitchDiff;
            highestPosition = 2 * i + 1;
            return new Note(pitch, highestPosition);
        });

        super(specialNotesMutaion(baseNotes));
        this._suitableKeys = suitableRelativeKeys.map(pos => Domain.getTonicNameByPosition((noteName as NoteName), pos));
        this._order = highestPosition;
        this._specialNotesMutaion = specialNotesMutaion;
    }

    public voice(target: number, ref: number[] = []): number[] {
        return (
            ref.length > 0
                ? this._voiceWithReference(ref)
                : this._generateVoicing(target)
        );
    }

    public getRandomTriad(target: number): number[] {
        let tonic = (this.getClosestNoteInstance(target, 1)[1] as Note);
        let inversion = Math.floor(Math.random() * 3);
        
        let thirdAbove = (this.getClosestNoteInstance(tonic.pitch, 3)[1] as Note);
        let thirdBelow = (this.getClosestNoteInstance(tonic.pitch - 12, 3)[1] as Note);
        let fifthAbove = (this.getClosestNoteInstance(tonic.pitch + 12, 5)[1] as Note);
        let fifthBelow = (this.getClosestNoteInstance(tonic.pitch, 5)[1] as Note);

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

    private _generateVoicing(target: number, candidates?: Note[]) {
        if (this._order < 7) {
            return this.getRandomTriad(target);
        }

        // TODO: write a better chord generating algorithm ...

        let tonicBase = this.lowestTonic;
        let idx = tonicBase[0], targetTonic = tonicBase[1];

        while (Math.abs(targetTonic.pitch - target) > 6) {
            idx += this.numberOfNoteClasses;
            targetTonic = this._notes[idx];
        }

        let pitches: number[] = [ targetTonic.pitch ];

        for (let i = 1; i < this.numberOfNoteClasses; i ++) {
            idx ++;
            pitches.push(this._notes[idx].pitch);
        }

        return pitches.sort((a, b) => a - b);

    }

    private _voiceWithReference(ref: number[]) {
        let voicingCandidates = this._getVoicingCandidates(ref);
        let target = Math.floor((ref[0] + ref[ref.length - 1]) / 2);
        return this._generateVoicing(target, voicingCandidates);
    }

    private _getVoicingCandidates(ref: number[] | number) {
        if (Array.isArray(ref)) {
            let reduction = (notes: Note[], pitch: number): Note[] => { 
                let currNotes = this._getVoicingCandidates(pitch);
                return notes.concat(currNotes.filter(note => notes.indexOf(note) === -1));
            };
            return ref.reduce(reduction, []);
        }

        ref = ref as number;
        let canditates: Note[] = []; 

        for (let p = ref - 2; p <= ref + 2; p ++) {
            let closestNote = this.getClosestNoteToTargetPitch(p)[1];
            if (closestNote.pitch === p) {
                canditates.push(closestNote);
            }
        }

        return canditates;
    }

    get order() {
        return this._order;
    }

    get lowestTonic(): [number, Note] {
        let idx = 0;
        let currNote = this._notes[idx];
        while (currNote.position !== 1) {
            currNote = this._notes[++idx];
        }
        return [idx, currNote];
    }

    get tonicName() {
        return this.lowestTonic[1].name;
    }

    get suitableKeys() {
        return this._suitableKeys;
    }

    get specialNotesMutation() {
        return this._specialNotesMutaion;
    }
}