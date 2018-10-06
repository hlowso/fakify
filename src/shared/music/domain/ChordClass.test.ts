import * as Util from "../../Util";
import * as MusicHelper from "../../music/MusicHelper";
import { Chord } from "./ChordClass";
import { ChordShape, NoteName, ChordName } from "../../types";
import { Note } from "./Note";
import { Scale } from "./ScaleClass";
import { Domain } from "./Domain";

const testChordNames: ChordName[] = [ 
    [ "F", ChordShape.Min7$11 ], 
    [ "A#|Bb", ChordShape.Dom9b5 ],
    [ "E", ChordShape.Dom9$5 ],
    [ "C#|Db", ChordShape.Maj7$11 ],
    [ "G", ChordShape.Dim7 ] 
];

interface IChordDatum {
    chordName: ChordName;
    reqNotes: NoteName[];
    notes: NoteName[];
    testScaleBase: NoteName;
    testScaleNotes: NoteName[];
    testScaleNotesPostExtension: NoteName[];
}

const chordData: IChordDatum[] = [
    {
        chordName: [ "A", ChordShape.Dim ],
        reqNotes: [ "C", "D#|Eb" ],
        notes: [ "A", "C", "D#|Eb" ],
        testScaleBase: "A#|Bb",
        testScaleNotes: [ "A#|Bb", "C", "D", "D#|Eb", "F", "G", "A" ],
        testScaleNotesPostExtension: [ "A#|Bb", "C", "D", "D#|Eb", "F", "G", "A" ]
    },
    {
        chordName: [ "G#|Ab", ChordShape.Dom7$11 ],
        reqNotes: [ "C", "F#|Gb", "D" ],
        notes: [ "G#|Ab", "C", "D#|Eb", "F#|Gb", "D" ],
        testScaleBase: "C#|Db",
        testScaleNotes: [ "C#|Db", "D#|Eb", "F", "F#|Gb", "G#|Ab", "A#|Bb", "C" ],
        testScaleNotesPostExtension: [ "D", "D#|Eb", "F", "F#|Gb", "G#|Ab", "A#|Bb", "C" ]        

    },
    {
        chordName: [ "D", ChordShape.Min7b9 ],
        reqNotes: [ "F", "C", "D#|Eb" ],
        notes: [ "D", "F", "A", "C", "D#|Eb" ],
        testScaleBase: "A#|Bb",
        testScaleNotes: [ "A#|Bb", "C", "D", "D#|Eb", "F", "G", "A" ],
        testScaleNotesPostExtension: [ "A#|Bb", "C", "D", "D#|Eb", "F", "G", "A" ]
    },
    {
        chordName: [ "F#|Gb", ChordShape.Maj7$9 ],
        reqNotes: [ "A#|Bb", "F", "A" ],
        notes: [ "F#|Gb", "A#|Bb", "C#|Db", "F", "A" ],
        testScaleBase: "C#|Db",
        testScaleNotes: [ "C#|Db", "D#|Eb", "F", "F#|Gb", "G#|Ab", "A#|Bb", "C" ],
        testScaleNotesPostExtension: [ "C#|Db", "D#|Eb", "F", "F#|Gb", "A", "A#|Bb", "C" ]        
    },
    {
        chordName: [ "B|Cb", ChordShape.Aug7$9 ],
        reqNotes: [ "D#|Eb", "G", "A", "D" ],
        notes: [ "B|Cb", "D#|Eb", "G", "A", "D" ],
        testScaleBase: "E",
        testScaleNotes: [ "E", "F#|Gb", "G#|Ab", "A", "B|Cb", "C#|Db", "D#|Eb" ],
        testScaleNotesPostExtension: [ "E", "G", "G#|Ab", "A", "B|Cb", "D", "D#|Eb" ]
    }
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

    chordData.forEach(datum => {
        let chord = new Chord(datum.chordName);
        expect(noteClassesTest(chord, datum.notes)).toBeTruthy();
    });

});

test("constructor generates notes array in which every value is defined", () => {

    testChordNames.forEach(name => {
        let chord = new Chord(name);
        chord.notes.forEach(note => expect(note).toBeDefined());
    });

});

test("applyExtensionToScale gives the note classes of the objective scale the right pitches", () => {

    chordData.forEach(datum => {
        let chord = new Chord(datum.chordName);
        let scale = new Scale(datum.testScaleBase);

        expect(noteClassesTest(scale, datum.testScaleNotes)).toBeTruthy();

        // Now apply the chord's extension to the scale
        chord.applyExtensionToScale(scale);

        expect(noteClassesTest(scale, datum.testScaleNotesPostExtension)).toBeTruthy();
    });

});

test("voice generates array containing all required pitches", () => {

    chordData.forEach(datum => {
        let chord = new Chord(datum.chordName);
        let voicing: number[] = [];

        for (let i = 0; i < 10; i ++) {
            voicing = voicing.length > 0 ? chord.voice(60, voicing) : chord.voice(60);
            expect(voicingPitchesTest(voicing, datum.reqNotes)).toBeTruthy();
        }
    });

});

test("voice generates array without duplicate pitches", () => {
    testChordNames.forEach(name => {
        let chord = new Chord(name);
        let voicing: number[] = [];

        for (let i = 0; i < 10; i ++) {
            voicing = voicing.length > 0 ? chord.voice(60, voicing) : chord.voice(60);
            voicing.sort((a, b) => a - b);
            expect(voicing.some((p, i) => p === voicing[Util.mod(i + 1, voicing.length)])).toBeFalsy();
        }
    });
});

test("voice generates array without pitch clusters", () => {

    testChordNames.forEach(name => {
        let chord = new Chord(name);
        let voicing: number[] = [];

        for (let i = 0; i < 10; i ++) {
            voicing = voicing.length > 0 ? chord.voice(60, voicing) : chord.voice(60);
            expect(MusicHelper.voicingContainsNoClusters(voicing)).toBeTruthy();
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
 * @param domain
 * @param pitches
 * @returns true if each name in pitches is represented by one of the note classes of the domain and vice versa
 */
function noteClassesTest(domain: Domain, pitches: NoteName[]) {

    let basePitches = pitches.map(name => Domain.NOTE_NAMES.indexOf(name));

    let noteFailure = (note: Note) => basePitches.indexOf(note.basePitch) === -1 || pitches.indexOf(note.name) === -1;

    let correctNoteClasses = !domain.noteClasses.some(noteFailure);

    return correctNoteClasses && pitches.length === domain.noteClasses.length;

}