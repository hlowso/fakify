import * as Util from "../../Util";
import { Note } from "./Note";
import { LOWEST_A, HIGHEST_C } from "./../MusicHelper";
import { NoteName, RelativeNoteName, INoteChange } from "../../types";

export class Domain {
    public static NOTE_NAMES: NoteName[] = ["C", "C#|Db", "D", "D#|Eb", "E", "F", "F#|Gb", "G", "G#|Ab", "A", "A#|Bb", "B|Cb"]; 
    public static RELATIVE_NOTE_NAMES: RelativeNoteName[] = ["1", "H", "2", "N", "3", "4", "T", "5", "U", "6", "J", "7"];

    public static getPitchInstance(target: number, basePitch: number, above = true) {
        let diff = Util.mod(target, 12) - Util.mod(basePitch, 12);
        
        if (diff > 0) {
            if (above) return target - diff + 12;
            return target - diff;
        }
        if (above) return target - diff;
        return target - diff - 12;
    }

    public static getLowestPitch = (noteName: NoteName) => {
        return Domain.NOTE_NAMES.indexOf(noteName);
    }

    public static applyExtension = (noteClasses: Note[], extension?: INoteChange[]) => {

        let newNoteClasses = noteClasses.map(note => note.clone());

        if (!extension) {
            return newNoteClasses;
        }

        extension.forEach((change, pos) => {

            // First check if name is already one of the notes in the domain
            let newNoteIdx = noteClasses.findIndex(n => n.name === change.target);
            let exisitngNoteIdx = newNoteClasses.findIndex(note => note.position === pos);

            if (exisitngNoteIdx !== -1) {
                newNoteClasses.splice(exisitngNoteIdx, 1);
            }

            if (newNoteIdx === -1) {
                newNoteClasses.push(new Note(change.target as NoteName, pos, true));            
            }

        });

        newNoteClasses.sort((a, b) => a.basePitch - b.basePitch);

        return newNoteClasses;
    }

    public static getRelativeMinor(key: NoteName | RelativeNoteName) {
        let set = Domain.NOTE_NAMES.indexOf(key as NoteName) !== -1 ? Domain.NOTE_NAMES : Domain.RELATIVE_NOTE_NAMES;
        return set[ Util.mod((set as any).indexOf(key) - 3, 12 )];
    }

    public static getRelativeMajor(key: NoteName | RelativeNoteName) {
        let set = Domain.NOTE_NAMES.indexOf(key as NoteName) !== -1 ? Domain.NOTE_NAMES : Domain.RELATIVE_NOTE_NAMES;
        return set[ Util.mod((set as any).indexOf(key) + 3, 12 )];
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

    get notes() {
        return this._notes;
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

    get positions(): number[] {
        let containsNaN = false;
        let positions = this._noteClasses.map(note => {
            let pos = note.position;
            if (isNaN(pos)) {
                containsNaN = true;
            }
            return pos;
        });

        if (containsNaN) {
            return [];
        }
        return positions.sort((a, b) => a - b);
    }

    public noteClassAtPos(pos: number) {
        return this._noteClasses.find(n => n.position === pos);
    }

    public pitchToPosition(pitch: number) {
        let noteClass = this._noteClasses.find(n => n.basePitch === Util.mod(pitch, 12));

        if (!noteClass) {
            return NaN;
        }

        return noteClass.position;
    }

    public getPitchPositionDiff(pitchA: number, pitchB: number) {
        return this.pitchToPosition(pitchA) - this.pitchToPosition(pitchB);
    }

    public getPitchIdx(pitch: number) {
        return this._notes.findIndex(note => note.pitch === pitch);
    }

    public getNotesInPitchRange = (a: number, b: number, requiredOnly = false) => {
        let notesInRange: Note[] = [];

        for (
            let idx = this.getClosestNoteToTargetPitch(a)[0]; 
            idx < this.length; 
            idx ++
        ) {
            let note = this._notes[idx];

            if (note.pitch > b) {
                break;
            }

            if (note.pitch >= a) {
                if (requiredOnly) {
                    if (note.isRequired) {
                        notesInRange.push(note.clone());
                    }
                } else {
                    notesInRange.push(note.clone());
                }
            }
        }
        return notesInRange;
    }

    public getNextNoteByPosition(pitch: number, ascending: boolean) {
        let [noteIdx, note] = this.getClosestNoteToTargetPitch(pitch);
        let inc = ascending ? 1 : -1;

        if (note.pitch === pitch && !isNaN(note.position)) {
            let currIdx = this.positions.indexOf(note.position);
            currIdx += inc;
            currIdx = Util.mod(currIdx, this.positions.length);
            let nextPos = this.positions[currIdx];
            while (note.position !== nextPos) {
                noteIdx += inc;
                if (noteIdx < 0 || noteIdx >= this._notes.length) {
                    return null;
                }
                note = this._notes[noteIdx];
            }
            return note;
        }
        return null;
    }

    public mutate(extension: INoteChange[]) {
        this._noteClasses = Domain.applyExtension(this._noteClasses, extension);
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

    public getTonicPitch(target = NaN, above = true) {
        let lowestTonic = this.getLowestNoteByPosition(1) as Note;
        if (isNaN(target)) {
            return lowestTonic.basePitch;
        }
        return Domain.getPitchInstance(target, lowestTonic.pitch, above);
    }

    // For binary search and sort...
    protected _compareNotes(a: Note, b: Note) {
        return a.pitchDiff(b);
    }

    protected _buildFromNoteClasses() {
        this._notes = [];
        for (let n = LOWEST_A; n <= HIGHEST_C; n ++) {
            let noteClass = this._noteClasses.find(note => note.basePitch === Util.mod(n, 12)) as Note; 
            if (noteClass) {
                this._notes.push(new Note(n, noteClass.position, noteClass.isRequired));
            }
        }
    }
}