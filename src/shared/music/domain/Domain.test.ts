import { NoteName } from "../../types";
import { Domain } from "./domain";

test("placeholder", () => {

});

/**
 * HELPERS
 */

export function verifyNoteClasses(domain: Domain, noteNames: NoteName[]) {
    let pitches = noteNames.map(name => Domain.NOTE_NAMES.indexOf(name));
    let noteClassPitches = domain.noteClasses.map(note => note.basePitch);

    pitches.sort((a, b) => a - b);
    noteClassPitches.sort((a, b) => a - b);

    return !pitches.some((p, i) => noteClassPitches[i] !== p);
}