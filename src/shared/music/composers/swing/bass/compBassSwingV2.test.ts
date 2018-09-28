import Chart from "../../../Chart";
import { Chord } from "../../../domain/ChordClass";
import * as Util from "../../../../Util";
import barsBase from "../../../../test-data/bars-251";
import { compBassSwingV2 } from "./compBassSwingV2";
import { IChartBar, Feel, IChordStretch, ChordName } from "../../../../types";

const chart = new Chart(() => {}, barsBase as IChartBar[], "A#|Bb", [ 120, 4 ], Feel.Swing);

test("compBassSwingV2 generates at least one tonic or fifth of the current chord per chord stretch", () => {

	let testRuns = 50;
	let successfulRuns = 0;

	for (let i = 0; i < testRuns; i ++) {
		successfulRuns += compBassSwingV2_Generates_At_Least_One_Tonic_Or_Fifth_Per_Chord_Stretch(chart) ? 1 : 0;
	}

	expect(successfulRuns).toBe(testRuns);
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