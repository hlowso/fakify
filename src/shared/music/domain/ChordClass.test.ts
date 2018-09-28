import { Chord } from "./ChordClass";
import { ChordShape } from "../../types";
// import { verifyNoteClasses } from "./Domain.test";

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

test("applyMutation gives the note classes of the objective scale the right pitches", () => {

});