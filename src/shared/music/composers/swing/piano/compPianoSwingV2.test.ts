// import * as Util from "../../../../Util";
import Chart from "../../../Chart";
import barsBase from "../../../../test-data/bars-251";
import { compPianoSwingV2 } from "./compPianoSwingV2";
import { IChartBar, IPart, Feel } from "../../../../types";

const chart = new Chart(() => {}, barsBase as IChartBar[], "A#|Bb", [ 120, 4 ], Feel.Swing);

const compPianoSwingV2_Generates_At_Least_Minimum_Required_Voicings = () => {
	let { music } = compPianoSwingV2(chart) as IPart;
	let prevBarCoveredNext: boolean;

	for (let barIdx = 0; barIdx < music.length; barIdx ++) {

		let bar = music[barIdx];
		let currBarMissed = true;
		prevBarCoveredNext = false;

		if (prevBarCoveredNext) {
			currBarMissed = false;
		} else {
			for (let i = 0; i < 12; i ++) {
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

	return true;
}

test("compPianoSwingV2 generates at least 1 voicing per chord stretch", () => {
	
	let testRuns = 50;
	let successfulRuns = 0;

	for (let i = 0; i < testRuns; i ++) {
		successfulRuns += compPianoSwingV2_Generates_At_Least_Minimum_Required_Voicings() ? 1 : 0;
	}

	expect(successfulRuns).toBe(testRuns);
});
