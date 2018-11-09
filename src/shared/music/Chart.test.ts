import Chart from "./Chart";
import _251_bars from "../test-data/bars-251";
import _251_bars_multi from "../test-data/bars-251-multichord";
import _4_chord_bars from "../test-data/bars-4-chords";
import bars7_4 from "../test-data/bars-7-4-bar";
import bars7_4WithCs from "../test-data/bars7_4WithCs";
import barsByeByeBlackBird from "../test-data/barsByeByeBlackbird";
import barsByeByeWithKeys from "../test-data/barsByeByeBlackbirdWithKeys";
import barsInvalidDueToTooManyBeatsInOneBar from "../test-data/barsInvalid";
import barsMusicAtWork from "../test-data/barsMusicAtWork";
import barsTakeFive from "../test-data/barsTakeFive";
import { Feel, IChordStretch, ChordShape } from "../types";
import { Chord } from "./domain/ChordClass";

const chart251InBbMajor = new Chart(() => {}, _251_bars, "A#|Bb", [ 120, 4 ]);
const chart4Chords = new Chart(() => {}, _4_chord_bars, "F#|Gb", [ 120, 4 ]);
const chart251Multi = new Chart(() => {}, _251_bars_multi, "A#|Bb", [ 120, 4 ]);
const chart251MultiShortened = new Chart(() => {}, _251_bars_multi, "A#|Bb", [ 120, 4 ], Feel.Swing, 3, 6);
const chart7_4WithCs = new Chart(() => {}, bars7_4WithCs, "D#|Eb", [ 120, 4 ], Feel.Swing, 3, 3);
const chartMusicAtWork = new Chart(() => {}, barsMusicAtWork, "E", [ 120, 4 ]);
const chartTakeFive = new Chart(() => {}, barsTakeFive, "D#|Eb", [ 120, 4 ]);

test("valid tempo returns true when tempo is valid", () => {
	expect(Chart.validTempo([120, 4])).toBe(true);
});

test("valid time signature returns true when time signature is valid", () => {
	expect(Chart.validTimeSignature([3, 4])).toBe(true);
});

test("validBaseBars returns true when passed an array with a single valid 7 / 4 bar", () => {
	expect(Chart.validBaseBars(bars7_4)).toBeTruthy();
});

test("validBaseBars returns false when passed an array in which 1 bar has too many beats in chordSegments for the bar's time signature", () => {
	expect(Chart.validBaseBars(barsInvalidDueToTooManyBeatsInOneBar)).toBeFalsy();
});

test("the correct number of chord stretches are generated", () => {
	let { chordStretches } = chart251InBbMajor;
	expect((chordStretches as IChordStretch[]).length).toEqual(10);
});

test("the correct number of chord stretches are generated when chart has many chords in one bar", () => {
	let { chordStretches } = chartMusicAtWork;
	expect((chordStretches as IChordStretch[]).length).toEqual(4);
});

test("chordStretches have all non zero integer durationInSubbeats values", () => {
	let { chordStretches } = chart4Chords;
	(chordStretches as IChordStretch[]).forEach(stretch => {
		expect(Number.isInteger(stretch.durationInSubbeats as number)).toBeTruthy();
		expect(stretch.durationInSubbeats).not.toBe(0);
	});

	chordStretches = chart251Multi.chordStretches;
	(chordStretches as IChordStretch[]).forEach(stretch => {
		expect(Number.isInteger(stretch.durationInSubbeats as number)).toBeTruthy();
		expect(stretch.durationInSubbeats).not.toBe(0);
	});
});

test("chordStretchesInRange have all non zero integer durationInSubbeats values", () => {
	let { chordStretchesInRange } = chart251MultiShortened;
	(chordStretchesInRange as IChordStretch[]).forEach(stretch => {
		expect(Number.isInteger(stretch.durationInSubbeats as number)).toBeTruthy();
		expect(stretch.durationInSubbeats).not.toBe(0);
	});

	chordStretchesInRange = chart251Multi.chordStretchesInRange;
	(chordStretchesInRange as IChordStretch[]).forEach(stretch => {
		expect(Number.isInteger(stretch.durationInSubbeats as number)).toBeTruthy();
		expect(stretch.durationInSubbeats).not.toBe(0);
	});
});

test("different chord stretches are generated for chord segments within the same bar", () => {
	let { chordStretches } = chart4Chords;
	expect((chordStretches as IChordStretch[]).length).toBe(4);
});

test("addKeysToBars properly adds keys to the bars of a relatively dynamic chart", () => {

	let correctBars = barsByeByeWithKeys;
	let testBars = barsByeByeBlackBird;

	Chart.addKeysToBars(testBars, false);

	testBars.forEach((testBar, barIdx) => {
		testBar.chordSegments.forEach((testSegment, segIdx) => {
			expect(testSegment.key).toBe(correctBars[barIdx].chordSegments[segIdx].key);
		});
	});
	
});

test("changing rangeEndIdx changes chord stretches correctly", () => {
	chart7_4WithCs.rangeEndIdx = 8;
	let { chordStretchesInRange } = (chart7_4WithCs as Chart);
	expect((chordStretchesInRange as IChordStretch[])[0].durationInSubbeats).toBe(126);
});

test("segmentAtIdx returns the right segment", () => {
	let seg = chartTakeFive.segmentAtIdx({ barIdx: 0, subbeatIdx: 9 });
	expect(Chord.chordNamesAreEqual(seg.chordName, [ "A#|Bb", ChordShape.Min7 ])).toBeTruthy();
});