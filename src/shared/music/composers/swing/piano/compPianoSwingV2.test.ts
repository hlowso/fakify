import * as Util from "../../../../Util";
import Chart from "../../../Chart";
import Score from "../../../Score";
import _251_bars from "../../../../test-data/bars-251";
import _251_multichord_bars from "../../../../test-data/bars-251-multichord";
import _4_chord_bar from "../../../../test-data/bars-4-chords";
import C_Blues_bars from "../../../../test-data/bars-c-blues";
import barsJustForFun from "../../../../test-data/bars-just-for-fun";
import bars7_4_full from "../../../../test-data/bars-7-4-full-bar";
import barsByeBye from "../../../../test-data/barsByeByeBlackbird";
import barsWitchcraft from "../../../../test-data/barsWitchcraft";
import barsMusicAtWork from "../../../../test-data/barsMusicAtWork";
import { compPianoSwingV2 } from "./compPianoSwingV2";
import { Feel, IChordStretch, IMusicBar, IStroke } from "../../../../types";

const _251_chart = new Chart(() => {}, _251_bars, "A#|Bb", [ 120, 4 ]);
const C_Blues_chart = new Chart(() => {}, C_Blues_bars, "C", [ 120, 4 ]);
const chartJustForFun = new Chart(() => {}, barsJustForFun, "A#|Bb", [ 120, 4 ]);
const chart4Chords = new Chart(() => {}, _4_chord_bar, "G", [ 120, 4 ]);
const chart7_4Full = new Chart(() => {}, bars7_4_full, "A#|Bb", [ 120, 4 ]);
const chart251Multi = new Chart(() => {}, _251_multichord_bars, "B|Cb", [ 120, 4 ]);
const shortByeBye = new Chart(() => {}, barsByeBye, "F", [ 120, 4 ], Feel.Swing, 3, 17);
const chartByeBye = new Chart(() => {}, barsByeBye, "F", [ 120, 4 ]);
const chartWitchcraft = new Chart(() => {}, barsWitchcraft, "F", [ 120, 4 ]);
const chartMusicAtWork = new Chart(() => {}, barsMusicAtWork, "E", [ 120, 4 ]);

test("generates at least 1 voicing per chord stretch", () => {
	let testRuns = 50;

	let successfulRuns = compPianoSwingV2_Generates_At_Least_Minimum_Required_Voicings(_251_chart, testRuns);
	successfulRuns += compPianoSwingV2_Generates_At_Least_Minimum_Required_Voicings(chart4Chords, testRuns);
	successfulRuns += compPianoSwingV2_Generates_At_Least_Minimum_Required_Voicings(chart7_4Full, testRuns);
	successfulRuns += compPianoSwingV2_Generates_At_Least_Minimum_Required_Voicings(chartMusicAtWork, testRuns);

	expect(successfulRuns).toBe(testRuns * 4);
});

test("generates at least 1 voicing per chord stretch when range is shortened", () => {
	const short251 = new Chart(() => {}, _251_bars, "E", [ 200, 4 ], Feel.Swing, 3, 6);

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
	let music2: IMusicBar[] | undefined = undefined;

	for (let i = 0; i < testRuns; i ++) {
		music = compPianoSwingV2(chart251Multi, music).music;
		let pass = compPianoSwingV2_All_Durations_Have_Values(music);
		music2 = compPianoSwingV2(shortByeBye, music2).music;
		let pass2 = compPianoSwingV2_All_Durations_Have_Values(music2);
		successfulRuns += pass ? 1 : 0;
		successfulRuns += pass2 ? 1 : 0;
	}

	expect(successfulRuns).toBe(testRuns * 2);
});

test("piano chords don't overlap in time within music array", () => {
	expect(compPianoSwingV2_Chords_Do_Not_Overlap(shortByeBye, 100)).toBe(100);
});

test("piano chords don't overlap across music arrays", () => {
	expect(compPianoSwingV2_Chords_Do_Not_Overlap_Across_Music_Arrays(shortByeBye, 100)).toBe(100);
});

test("piano music is valid", () => {

	let charts = [
		shortByeBye,
		chartByeBye,
		chartJustForFun,
		chart4Chords,
		chart251Multi,
		chart7_4Full,
		_251_chart,
		C_Blues_chart,
		chartWitchcraft
	];

	for (let chart of charts) {
		let music: IMusicBar[] | undefined;
		for (let i = 0; i < 100; i ++) {
			expect(Score.validPart(compPianoSwingV2(chart, music))).toBe(true);
		}
	}
});

/**
 * HELPERS
 */

function compPianoSwingV2_Chords_Do_Not_Overlap(chart: Chart, testRuns: number) {
	let { bars } = chart;
	let successfulRuns = 0;
	let music: IMusicBar[] | undefined = undefined;
	let lastAbsIdx: number | undefined;
	let currAbsIdx: number | undefined;
	let currDuration: number | undefined;
	let absSubbeatIdx = 0;

	test:
	for (let i = 0; i < testRuns; i ++ ) {
		music = compPianoSwingV2(chart, music).music;

		for (let barIdx = 0; barIdx < music.length; barIdx ++) {
			let musicBar = music[barIdx];
			for (let subbeat in musicBar) {
				currAbsIdx = absSubbeatIdx + parseInt(subbeat, undefined);

				if (Number.isInteger(lastAbsIdx as number) && Number.isInteger(currDuration as number)) {
					if ((lastAbsIdx as number) + (currDuration as number) > (currAbsIdx as number)) {
						continue test;
					}
				}

				lastAbsIdx = currAbsIdx as number;
			}

			absSubbeatIdx += bars[barIdx].durationInSubbeats as number;
		}

		successfulRuns ++;
	}

	return successfulRuns;
}

function compPianoSwingV2_Chords_Do_Not_Overlap_Across_Music_Arrays(chart: Chart, testRuns: number) {
	
	let { music } = compPianoSwingV2(chart);

	let successfulRuns = 0;

	function getDistanceToTopAndCurrDuration(chart: Chart, music: IMusicBar[]) {
		let distanceToTop = 0;
		let currDuration: number;
		for (let barIdx = music.length - 1; barIdx >= 0; barIdx --) {
			let bar = music[barIdx];
			distanceToTop += chart.bars[barIdx].durationInSubbeats as number;

			if (!Util.objectIsEmpty(bar)) {
				let lastStroke: IStroke | undefined;
				let subbeatIdx: number | undefined;

				for (let subbeat in bar) {
					lastStroke = bar[subbeat][0];
					subbeatIdx = parseInt(subbeat, undefined);
				}
				
				currDuration = (lastStroke as IStroke).durationInSubbeats as number;
				distanceToTop -= subbeatIdx as number;

				return {
					currDuration,
					distanceToTop
				};
			}

		}

		return { currDuration: -1, distanceToTop: -1 };
	}

	for (let i = 0; i < testRuns; i ++) {

		let { currDuration, distanceToTop } = getDistanceToTopAndCurrDuration(chart, music);

		music = compPianoSwingV2(chart, music).music;

		let distanceToFirstStroke = 0;
		let barIdx = 0;

		findFirstSubbeat:
		for (let bar of music) {
			if (!Util.objectIsEmpty(bar)) {
				for (let subbeat in bar) {
					distanceToFirstStroke += parseInt(subbeat, undefined);
					break findFirstSubbeat;
				}
			}
			distanceToFirstStroke += chart.bars[barIdx].durationInSubbeats as number;
			barIdx ++;
		}

		if (currDuration <= distanceToTop + distanceToFirstStroke) {
			successfulRuns ++;
		}
	}

	return successfulRuns;
}

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

				// console.log(music);
				continue test;
			}
		}

		successfulRuns++;
	}

	return successfulRuns;
}
