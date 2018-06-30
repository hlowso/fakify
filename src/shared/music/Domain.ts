import * as Util from "../Util";
import { LOWEST_A, HIGHEST_C } from "./MusicHelper";

class Domain {
    private _scaleLength: number;
    private _notes: number[];

    constructor(notes: number[]) {
        let normalizedNotes = notes.map(note => Util.mod(note, 12));
        let uniqueNotes: number[] = [];

        this._scaleLength = 0;
        this._notes = [];
        
        normalizedNotes.forEach(note => {
            if (uniqueNotes.indexOf(note) === -1) {
                uniqueNotes.push(note);
                this._scaleLength ++;
            }
        });

        for (let n = LOWEST_A; n <= HIGHEST_C; n ++) {
            if (normalizedNotes.indexOf(Util.mod(n, 12)) !== -1) {
                this._notes.push(n);
            }
        }
    }

    get scaleLenght(): number {
        return this._scaleLength;
    }

    get lowest(): number {
        return this._notes[0];
    }

    get highest(): number {
        return this._notes[this._notes.length - 1];
    }

    public getRandomNote(a = this.lowest, b = this.highest) {

        let lowIdx = Util.binarySearch(this._notes, a)[0];
        let highIdx = Util.binarySearch(this._notes, b)[0];

        let idx = Math.floor(lowIdx + (highIdx - lowIdx) * Math.random());
        return this._notes[idx];
    }
}

export default Domain;