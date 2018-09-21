import * as Util from "../../../../Util";
import Chart from "../../../Chart";
import barsBase from "../../../../test-data/bars-251";
import { compPianoSwingV2 } from "./compPianoSwingV2";
import { IChartBar, IPart, Feel, IMusicBar } from "../../../../types";

const chart = new Chart(() => {}, barsBase as IChartBar[], "A#|Bb", [ 120, 4 ], Feel.Swing);

test("generates at least 1 voicing per chord stretch", () => {
	let testRuns = 50;
	let successfulRuns = 0;

	for (let i = 0; i < testRuns; i ++) {
		successfulRuns += compPianoSwingV2_Generates_At_Least_Minimum_Required_Voicings() ? 1 : 0;
	}

	expect(successfulRuns).toBe(testRuns);
});

test("rate of chord ascension is roughly 50%", () => {
	let testRuns = 50;
	let fraction = [0, 0, 0];

	for (let i = 0; i < testRuns; i ++) {
		fraction = Util.vectorSum(fraction, getAscensionFraction()) as number[];
	}

	let ascensionPercentage = fraction[0] / fraction[2];
	let descensionPercentage = fraction[1] / fraction[2];

	console.log("Fraction", fraction);
	console.log("Ascension:", ascensionPercentage);
	console.log("Descension:", descensionPercentage);	

	expect(Math.abs(ascensionPercentage - descensionPercentage)).toBeLessThan(0.1);
});

/**
 * HELPERS
 */

// NOTE: This test is expecting to be run against a specific chart, namely 251
const compPianoSwingV2_Generates_At_Least_Minimum_Required_Voicings = () => {
	let { music } = compPianoSwingV2(chart) as IPart;
	let prevBarCoveredNext: boolean;

	for (let barIdx = 0; barIdx < 6; barIdx ++) {

		let bar = music[barIdx];
		let currBarMissed = true;
		prevBarCoveredNext = false;

		if (prevBarCoveredNext) {
			currBarMissed = false;
		} else {
			for (let i = 0; i < 11; i ++) {
				if (bar[i]) {
					currBarMissed = false;
					continue;
				}
			}
		}

		if (currBarMissed) {
			return false;
		}

		if (bar["11"]) {
			prevBarCoveredNext = true;
		}
	}

	let lastBar = music["7"];

	return (
		!Util.objectIsEmpty(music["6"]) || 
		lastBar["0"] ||
		lastBar["1"] ||
		lastBar["2"] ||
		lastBar["3"] ||
		lastBar["4"] ||
		lastBar["5"] ||
		lastBar["6"] ||
		lastBar["7"] ||
		lastBar["8"] ||
		lastBar["9"] ||
		lastBar["10"]
	);
}

const getNoteAvgFromBarAndSubbeatIdx = (bar: IMusicBar, subbeatIdx: string) => {
	return Util.mean(bar[subbeatIdx][0].notes);
}

// Returns a tuple of 3 integers in which the first is the number of times a subsequent 
// voicing notes average was greater than the one preceeding, the second is the number
// of times a subsequent voicing notes average was less than the one preceding, and
// the third is one less than the total number of voicings in the music array 
const getAscensionFraction = () => {
	let { music } = compPianoSwingV2(chart);
	let voicingAvg = -1;
	let startingIdx = -1;
	let fraction = [0, 0, 0];

	let updateFraction = (fraction: number[], voicingAvg: number, bar: IMusicBar, subbeatIdx: string) => {
		let nextAvg = getNoteAvgFromBarAndSubbeatIdx(bar, subbeatIdx);
		fraction[2] ++;
		if (nextAvg > voicingAvg) {
			fraction[0] ++;
		} else if (nextAvg < voicingAvg) {
			fraction[1] ++;
		}
		voicingAvg = nextAvg;
	}

	// Get first voicing
	for (let bar of music) {
		startingIdx++;
		if (!Util.objectIsEmpty(bar)) {
			for (let subbeatIdx in bar) {
				if (voicingAvg > 0) {
					updateFraction(fraction, voicingAvg, bar, subbeatIdx);
				} else {
					voicingAvg = getNoteAvgFromBarAndSubbeatIdx(bar, subbeatIdx);
				}
			}
			break;			
		}
	}

	// Calculate the fraction over the rest of the music array
	for (let barIdx = startingIdx; barIdx < music.length; barIdx++) {
		let bar = music[barIdx];
		for (let subbeatIdx in bar) {
			updateFraction(fraction, voicingAvg, bar, subbeatIdx);
		}
	}

	return fraction;
};
