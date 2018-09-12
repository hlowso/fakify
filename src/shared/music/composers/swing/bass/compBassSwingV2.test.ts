import * as Util from "../../../../Util";
import Chart from "../../../Chart";
import barsBase from "../../../../test-data/bars-251";
import { compBassSwingV2 } from "./compBassSwingV2";
import { IChartBar, IPart, Feel } from "../../../../types";

const chart = new Chart(() => {}, barsBase as IChartBar[], "A#|Bb", [ 120, 4 ], Feel.Swing);

// NOTE: This test is expecting to be run against a specific chart, namely 251
const compBassSwingV2_Generates_At_Least_One_Tonic_Or_Fifth_Per_Chord_Stretch = () => {

	let { music } = compBassSwingV2(chart) as IPart;
	let tonicsAndFifths = [
		[0, 7],
		[5, 0],
		[2, 9],
		[7, 2],
		[0, 7],
		[5, 0],
		[10, 5]
	];

	for (let barIdx = 0; barIdx < 6; barIdx ++) {

		let bar = music[barIdx];

		let tonicOrFifthFound = false;

		for (let subbeatIdx in bar) {
			let modNote = Util.mod(bar[subbeatIdx][0].notes[0], 12);
			if (tonicsAndFifths[barIdx].indexOf(modNote) !== -1) {
				tonicOrFifthFound = true;
				break;
			}
		}

		if (!tonicOrFifthFound) {
			return false;
		}
	}

	let secondLastBar = music["6"];
	let lastBar = music["7"];

	for (let subbeatIdx in secondLastBar) {
		let modNote = Util.mod(secondLastBar[subbeatIdx][0].notes[0], 12);
		if (tonicsAndFifths[6].indexOf(modNote) !== -1) {
			return true;
		}
	}

	for (let subbeatIdx in lastBar) {
		let modNote = Util.mod(lastBar[subbeatIdx][0].notes[0], 12);
		if (tonicsAndFifths[6].indexOf(modNote) !== -1) {
			return true;
		}
	}

	return false;
}

test("compBassSwingV2 generates at least one tonic or fifth of the current chord per chord stretch", () => {

	let testRuns = 50;
	let successfulRuns = 0;

	for (let i = 0; i < testRuns; i ++) {
		successfulRuns += compBassSwingV2_Generates_At_Least_One_Tonic_Or_Fifth_Per_Chord_Stretch() ? 1 : 0;
	}

	expect(successfulRuns).toBe(testRuns);
});