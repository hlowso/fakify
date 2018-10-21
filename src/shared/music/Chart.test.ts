import Chart from "./Chart";
import _251_bars from "../test-data/bars-251";
import _251_bars_multi from "../test-data/bars-251-multichord";
import _4_chord_bars from "../test-data/bars-4-chords";
import bars7_4 from "../test-data/bars-7-4-bar";
import bars7_4WithCs from "../test-data/bars7_4WithCs";
import barsByeByeBlackBird from "../test-data/barsByeByeBlackbird";
import { chordStretches251InBbMajor } from "../test-data/chordStretches251InBbMajor";
import { Feel, IChartBar, IChordStretch, IChordSegment } from "../types";

const chart251InBbMajor = new Chart(() => {}, _251_bars as IChartBar[], "A#|Bb", [ 120, 4 ], Feel.Swing);
const chart4Chords = new Chart(() => {}, _4_chord_bars as IChartBar[], "F#|Gb", [ 120, 4 ], Feel.Swing);
const chart251Multi = new Chart(() => {}, _251_bars_multi as IChartBar[], "A#|Bb", [ 120, 4 ], Feel.Swing);
const chart251MultiShortened = new Chart(() => {}, _251_bars_multi as IChartBar[], "A#|Bb", [ 120, 4 ], Feel.Swing, 3, 6);
const chart7_4WithCs = new Chart(() => {}, bars7_4WithCs as IChartBar[], "D#|Eb", [ 120, 4 ], Feel.Swing, 3, 3);

test("valid tempo returns true when tempo is valid", () => {
	expect(Chart.validTempo([120, 4])).toBe(true);
});

test("valid time signature returns true when time signature is valid", () => {
	expect(Chart.validTimeSignature([3, 4])).toBe(true);
});

test("validBaseBars returns true when passed an array with a single valid 7 / 4 bar", () => {
	expect(Chart.validBaseBars(bars7_4 as IChartBar[])).toBeTruthy();
});

test("chordStretches are generated properly", () => {
	let { chordStretches } = chart251InBbMajor;
	expect(chordStretches).toEqual(chordStretches251InBbMajor as IChordStretch[]);
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
	expect((chordStretches as IChartBar[]).length).toBe(4);
});

test("addKeysToBars properly adds keys to the bars of a relatively dynamic chart", () => {

	let correctBars = barsByeByeBlackBird as IChartBar[];

	let testBars = correctBars.map((bar) => {
		return {
			barIdx: bar.barIdx,
			timeSignature: bar.timeSignature,
			chordSegments: bar.chordSegments.map(seg => {
				return {
					beatIdx: seg.beatIdx,
					chordName: seg.chordName
				} as IChordSegment
			})
		} as IChartBar;
	});

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