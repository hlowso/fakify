import Chart from "./Chart";
import _251_bars from "../test-data/bars-251";
import _4_chord_bars from "../test-data/bars-4-chords";
import { chordStretches251InBbMajor } from "../test-data/chordStretches251InBbMajor";
import { Feel, IChartBar, IChordStretch } from "../types";

const chart251InBbMajor = new Chart(() => {}, _251_bars as IChartBar[], "A#|Bb", [ 120, 4 ], Feel.Swing);

test("valid tempo returns true when tempo is valid", () => {
	expect(Chart.validTempo([120, 4])).toBe(true);
});

test("valid time signature returns true when time signature is valid", () => {
	expect(Chart.validTimeSignature([3, 4])).toBe(true);
});

test("chordStretches are generated properly", () => {
	let { chordStretches } = chart251InBbMajor;
	expect(chordStretches).toEqual(chordStretches251InBbMajor);
});

test("chordStretches have all integer durationInSubbeats values", () => {
	const chart4Chords = new Chart(() => {}, _4_chord_bars as IChartBar[], "F#|Gb", [ 120, 4 ], Feel.Swing);

	let { chordStretches } = chart4Chords;
	(chordStretches as IChordStretch[]).forEach(stretch => {
		expect(Number.isInteger(stretch.durationInSubbeats as number)).toBeTruthy();
	});
});