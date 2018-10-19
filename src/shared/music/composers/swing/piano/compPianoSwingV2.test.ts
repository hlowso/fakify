import * as Util from "../../../../Util";
import Chart from "../../../Chart";
import Score from "../../../Score";
import _251_bars from "../../../../test-data/bars-251";
import _251_multichord_bars from "../../../../test-data/bars-251-multichord";
import _4_chord_bar from "../../../../test-data/bars-4-chords";
import C_Blues_bars from "../../../../test-data/bars-c-blues";
import barsJustForFun from "../../../../test-data/bars-just-for-fun";
import bars7_4_full from "../../../../test-data/bars-7-4-full-bar";
import { compPianoSwingV2 } from "./compPianoSwingV2";
import { IChartBar, Feel, IChordStretch, IMusicBar } from "../../../../types";

const _251_chart = new Chart(() => {}, _251_bars as IChartBar[], "A#|Bb", [ 120, 4 ], Feel.Swing);
const C_Blues_chart = new Chart(() => {}, C_Blues_bars as IChartBar[], "C", [ 120, 4 ], Feel.Swing);
const chartJustForFun = new Chart(() => {}, barsJustForFun as IChartBar[], "A#|Bb", [ 120, 4 ], Feel.Swing);
const chart4Chords = new Chart(() => {}, _4_chord_bar as IChartBar[], "G", [ 120, 4 ], Feel.Swing);
const chart7_4Full = new Chart(() => {}, bars7_4_full as IChartBar[], "A#|Bb", [ 120, 4 ], Feel.Swing);
const chart251Multi = new Chart(() => {}, _251_multichord_bars as IChartBar[], "B|Cb", [ 120, 4 ], Feel.Swing);

test("generates at least 1 voicing per chord stretch", () => {
	let testRuns = 50;

	let successfulRuns = compPianoSwingV2_Generates_At_Least_Minimum_Required_Voicings(_251_chart, testRuns);
	successfulRuns += compPianoSwingV2_Generates_At_Least_Minimum_Required_Voicings(chart4Chords, testRuns);
	successfulRuns += compPianoSwingV2_Generates_At_Least_Minimum_Required_Voicings(chart7_4Full, testRuns);

	expect(successfulRuns).toBe(testRuns * 3);
});

test("generates at least 1 voicing per chord stretch when range is shortened", () => {
	const short251 = new Chart(() => {}, _251_bars as IChartBar[], "E", [ 200, 4 ], Feel.Swing, 3, 6);

	let testRuns = 100;
	let successfulRuns = compPianoSwingV2_Generates_At_Least_Minimum_Required_Voicings(short251, testRuns);

	expect(successfulRuns).toBe(testRuns);
});

test("rate of chord ascension and chord descension are roughly equal", () => {
	expect(ascensionTest(_251_chart)).toBeLessThan(0.4);
	expect(ascensionTest(C_Blues_chart)).toBeLessThan(0.4);
	expect(ascensionTest(chartJustForFun)).toBeLessThan(0.4);
});

test("all durations have integer values", () => {
	let testRuns = 100;
	let successfulRuns = 0;
	let music: IMusicBar[] | undefined = undefined;

	for (let i = 0; i < testRuns; i ++) {
		music = compPianoSwingV2(chart251Multi, music).music;
		let pass = compPianoSwingV2_All_Durations_Have_Values(music);
		successfulRuns += pass ? 1 : 0;
	}

	expect(successfulRuns).toBe(testRuns);
});

/**
 * HELPERS
 */

function compPianoSwingV2_All_Durations_Have_Values(music: IMusicBar[]) {
	for (let bar of music) {
		for (let subbeatIdx in bar) {
			for (let stroke of bar[subbeatIdx]) {
				if (!Number.isInteger(stroke.durationInSubbeats)) {
					return false;
				}
			}
		}
	}

	return true;
}

const ascensionTest = (chart: Chart, testRuns = 100) => {
	let fraction = [0, 0, 0];
	let { music } = compPianoSwingV2(chart);

	for (let i = 0; i < testRuns; i ++) {
		music = compPianoSwingV2(chart, music).music;
		fraction = Util.vectorSum(fraction, Score.getAscensionRate(music)) as number[];
	}

	let ascensionPercentage = fraction[0] / fraction[2];
	let descensionPercentage = fraction[1] / fraction[2];

	// console.log("Fraction", fraction);
	// console.log("Ascension:", ascensionPercentage);
	// console.log("Descension:", descensionPercentage);

	return Math.abs(ascensionPercentage - descensionPercentage);
}

const compPianoSwingV2_Generates_At_Least_Minimum_Required_Voicings = (chart: Chart, testRuns: number) => {
		
	let successfulRuns = 0;
	let music: IMusicBar[] | undefined;
	let nextStretchCovered = false;

	test:
	for (let i = 0; i < testRuns; i ++) {
		let { chordStretchesInRange, barsInRange } = chart;
		music = compPianoSwingV2(chart, music).music;
		
		let absStartIdx = chart.musicIdxToAbsSubbeatIdx({ barIdx: chart.rangeStartIdx, subbeatIdx: 0 }) as number;
		let absChordStretchSubbeatIndices = [absStartIdx];
		let absMusicSubbeatIndices = [absStartIdx - 1];
		let k = 0;
		let currStretchCovered = false;
		let barSubbeatCount = absStartIdx;
		chordStretchesInRange = chordStretchesInRange as IChordStretch[];	

		for (let stretchIdx = 0; stretchIdx < chordStretchesInRange.length; stretchIdx ++) {
			let currDur = chordStretchesInRange[stretchIdx].durationInSubbeats as number;
			absChordStretchSubbeatIndices.push(absChordStretchSubbeatIndices[stretchIdx] + currDur);
		}

		absChordStretchSubbeatIndices.shift();

		barsInRange.forEach(bar => {
			for (let subbeatIdx in (music as IMusicBar[])[bar.barIdx]) {
				absMusicSubbeatIndices.push(barSubbeatCount + parseInt(subbeatIdx));
				k ++;
			}
			barSubbeatCount += bar.durationInSubbeats as number;
		});

		absMusicSubbeatIndices.shift();
		k = 0;

		for (let absChordStretchSubbeatIdx of absChordStretchSubbeatIndices) {

			currStretchCovered = nextStretchCovered;
			nextStretchCovered = false;

			for (let subbeatIdx = absMusicSubbeatIndices[k]; subbeatIdx < absChordStretchSubbeatIdx && k < absMusicSubbeatIndices.length; subbeatIdx = absMusicSubbeatIndices[++k]) {
				
				if (subbeatIdx === absChordStretchSubbeatIdx - 1) {
					nextStretchCovered = true;
				} else {
					currStretchCovered = true;
				}
			}

			if (!currStretchCovered) {

				console.log(music);
				continue test;
			}
		}

		successfulRuns++;
	}

	return successfulRuns;
}
