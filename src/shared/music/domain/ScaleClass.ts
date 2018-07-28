import * as Util from "../../Util";
import { Domain } from "./Domain";
import { NoteName } from "../../types";
import { Note } from "./Note";

export class ScaleClass extends Domain {
    public static MAJOR_SCALE_INDECES: number[] = [0, 2, 4, 5, 7, 9, 11];
    
    // For now, all scales will be constructed as major scales
    constructor(noteName: NoteName) {
        let lowestTonic = Domain.NOTE_NAMES.indexOf(noteName);
        let noteClasses = ScaleClass.MAJOR_SCALE_INDECES.map((pitch, idx) => 
            new Note(Util.mod(lowestTonic + pitch, 12), idx + 1, false)
        );
        super(noteClasses);
    }
}