import Chart from "../../../Chart";
import Score from "../../../Score";
import { Chord } from "../../../domain/ChordClass";
import * as Util from "../../../../Util";
import barsBase from "../../../../test-data/bars-251";
import barsByeBye from "../../../../test-data/barsByeByeBlackbird";
import barsWitchcraft from "../../../../test-data/barsWitchcraft";
import bars7_4WithCs from "../../../../test-data/bars7_4WithCs";
import { compBassSwingV2 } from "./compBassSwingV2";
import { IChartBar, Feel, IChordStretch, ChordName, IMusicBar } from "../../../../types";

const chart251 = new Chart(() => {}, barsBase as IChartBar[], "A#|Bb", [ 120, 4 ], Feel.Swing);
const chartByeBye = new Chart(() => {}, barsByeBye as IChartBar[], "A#|Bb", [ 120, 4 ], Feel.Swing);
const shortByeBye = new Chart(() => {}, barsByeBye as IChartBar[], "F#|Gb", [ 120, 4 ], Feel.Swing, 7, 7);
const short7_4WithCs = new Chart(() => {}, bars7_4WithCs as IChartBar[], "C", [ 120, 4 ], Feel.Swing, 3, 3 );
const chartWitchcraft = new Chart(() => {}, barsWitchcraft, "F", [ 120, 4 ], Feel.Swing);

test("compBassSwingV2 generates at least one tonic or fifth of the current chord per chord stretch", () => {

	let testRuns = 50;
	let successfulRuns = 0;

	for (let i = 0; i < testRuns; i ++) {
		successfulRuns += compBassSwingV2_Generates_At_Least_One_Tonic_Or_Fifth_Per_Chord_Stretch(chart251) ? 1 : 0;
		successfulRuns += compBassSwingV2_Generates_At_Least_One_Tonic_Or_Fifth_Per_Chord_Stretch(chartByeBye) ? 1 : 0;
	}

	expect(successfulRuns).toBe(2 * testRuns);
});

test("bass music is valid", () => {

	let charts = [
		chartByeBye,
		chart251,
		shortByeBye,
		short7_4WithCs,
		chartWitchcraft
	];

	for (let chart of charts) {
		let music: IMusicBar[] | undefined;
		for (let i = 0; i < 100; i ++) {
			expect(Score.validPart(compBassSwingV2(chart, music))).toBe(true);
		}
	}
});

test("changing range doesn't invalidate music", () => {
	for (let i = 0; i < 100; i ++) {

		short7_4WithCs.rangeEndIdx = 8;
		expect(Score.validPart(compBassSwingV2(short7_4WithCs))).toBe(true);

		short7_4WithCs.rangeEndIdx = 3;
		expect(Score.validPart(compBassSwingV2(short7_4WithCs))).toBe(true);
	}
});

/**
 * HELPERS
 */

const compBassSwingV2_Generates_At_Least_One_Tonic_Or_Fifth_Per_Chord_Stretch = (chart: Chart) => {

	let { chordStretches, bars } = chart;
	let { music } = compBassSwingV2(chart);
	chordStretches = chordStretches as IChordStretch[];	
	
	let absChordStretchSubbeatIndices = [0];
	let stretchIdx = 0;
	let currChord = new Chord(chordStretches[stretchIdx].chordName as ChordName);
	let currTonicOrFifth = [currChord.getTonicPitch(), currChord.getFifthPitch()];
	let fifthOrTonicFound = false;
	let barSubbeatCount = 0;

	for (let stretchIdx = 0; stretchIdx < chordStretches.length; stretchIdx ++) {
		let currDur = chordStretches[stretchIdx].durationInSubbeats as number;
		absChordStretchSubbeatIndices.push(absChordStretchSubbeatIndices[stretchIdx] + currDur);
	}

	absChordStretchSubbeatIndices.shift();

	for (let barIdx = 0; barIdx < music.length; barIdx ++) {

		let bar = bars[barIdx];

		for (let subbeatIdx = 0; subbeatIdx < (bar.durationInSubbeats as number); subbeatIdx ++) {

			let strokes = music[barIdx][subbeatIdx];

			if (Array.isArray(strokes) && strokes.length > 0) {

				let absSubbeatIdx = barSubbeatCount + subbeatIdx;
				let pitch = strokes[0].notes[0];
				
				if (absSubbeatIdx >= absChordStretchSubbeatIndices[stretchIdx]) {

					if (!fifthOrTonicFound) {
						return false;
					}

					stretchIdx ++;
					currChord = new Chord(chordStretches[stretchIdx].chordName as ChordName);
					currTonicOrFifth = [currChord.getTonicPitch(), currChord.getFifthPitch()];
					fifthOrTonicFound = false;
				}

				if (currTonicOrFifth.indexOf(Util.mod(pitch, 12)) !== -1) {
					fifthOrTonicFound = true;
				}

			}
		}

		barSubbeatCount += bar.durationInSubbeats as number;
	}

	if (!fifthOrTonicFound) {
		return false;
	}

	return true;
}