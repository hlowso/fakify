import * as Util from "../../Util";
import { Chord } from "./ChordClass";
import { ChordShape, NoteName, ChordName } from "../../types";
// import { verifyNoteClasses } from "./Domain.test";

const testChordNames: ChordName[] = [ 
    [ "F", ChordShape.Min7$11 ], 
    [ "A#|Bb", ChordShape.Dom9b5 ],
    [ "E", ChordShape.Dom9$5 ],
    [ "C#|Db", ChordShape.Maj7$11 ],
    [ "G", ChordShape.Dim7 ] 
];

test("with no input, getTonicPitch returns the absolute lowest tonic pitch", () => {
    let Cma7 = new Chord([ "C", ChordShape.Maj7 ]);
    expect(Cma7.getTonicPitch()).toEqual(0);

    let Bbdim = new Chord(["A#|Bb", ChordShape.Dim]);
    expect(Bbdim.getTonicPitch()).toEqual(10);
});

test("with no input, getFifthPitch returns the absolute lowest fifth pitch", () => {
    let Ab9 = new Chord([ "G#|Ab", ChordShape.Dom9 ]);
    expect(Ab9.getFifthPitch()).toEqual(3);

    let Fmin = new Chord([ "F", ChordShape.Min ]);
    expect(Fmin.getFifthPitch()).toEqual(0);
});

test("constructor generates noteClasses with the right pitches", () => {

});

test("constructor generates notes array in which every value is defined", () => {

    testChordNames.forEach(name => {
        let chord = new Chord(name);
        chord.notes.forEach(note => expect(note).toBeDefined());
    });

});

test("applyMutation gives the note classes of the objective scale the right pitches", () => {

});

test("voice generates array containing all required pitches", () => {

    interface IChordNotesPair {
        chordName: ChordName;
        notes: NoteName[];
    }

    let chordAndRequiredNotes: IChordNotesPair[] = [
        {
            chordName: [ "A", ChordShape.Dim ],
            notes: [ "C", "D#|Eb" ]
        },
        {
            chordName: [ "G#|Ab", ChordShape.Dom7$11 ],
            notes: [ "C", "F#|Gb", "D" ]
        },
        {
            chordName: [ "D", ChordShape.Min7b9 ],
            notes: [ "F", "C", "D#|Eb" ]
        }
    ];

    chordAndRequiredNotes.forEach(pair => {
        let chord = new Chord(pair.chordName);
        let voicing: number[] = [];

        for (let i = 0; i < 10; i ++) {
            voicing = chord.voice(60);

            let pass = voicingPitchesTest(voicing, pair.notes);

            if (!pass) {
                console.log(voicing.map(p => Chord.NOTE_NAMES[Util.mod(p, 12)]), pair.notes, chord.noteClasses);
            }

            expect(pass).toBeTruthy();
        }
    });

});

test("voice generates array without pitch clusters", () => {

    testChordNames.forEach(name => {
        let chord = new Chord(name);
        let voicing: number[] = [];

        for (let i = 0; i < 10; i ++) {
            voicing = voicing.length > 0 ? chord.voice(60, voicing) : chord.voice(60);
            expect(voicingContainsNoClustersTest(voicing)).toBeTruthy();
        }
    });

});

/**
 * 
 * @param voicing
 * @param pitches
 * @returns true if the mod 12 values of 'voicing' contain all base pitch values associated with the values of 'pitches' 
 */
function voicingPitchesTest(voicing: number[], pitches: NoteName[]) {

    let basePitches = pitches.map(name => Chord.NOTE_NAMES.indexOf(name));

    let voicingMod12 = voicing.map(pitch => Util.mod(pitch, 12));

    return !basePitches.some(pitch => voicingMod12.indexOf(pitch) === -1);
}

/**
 * 
 * @param voicing 
 * @returns true if the voicing contains no clusters
 */
function voicingContainsNoClustersTest(voicing: number[]) {
    let i = 0, j = 1, k = 2;

    voicing.sort((a, b) => a - b);

    while (k < voicing.length) {
        let p1 = voicing[i],
            p2 = voicing[j],
            p3 = voicing[k];

        if (p2 - p1 <= 2 && p3 - p2 <= 2) {
            return false;
        }

        i ++; j ++; k++;
    }

    return true;
}