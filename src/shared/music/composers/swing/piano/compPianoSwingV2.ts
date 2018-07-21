import * as Util from "../../../../Util";
import { ChordClass } from "../../../Domain";
import { ChordName, IMusicBar, IPart, IMusicIdx } from "../../../../types";
import Chart from "../../../Chart";

export const compPianoSwingV1 = (chart: Chart): IPart => {
    let { chordStretches, bars } = chart;
    let music: IMusicBar[] = [];
    let previousVoicing: number[] = [];

    let musicIdx: IMusicIdx = { barIdx: 0, segmentIdx: 0, subbeatIdx: 0 };
    let prevMusicIdx: IMusicIdx | undefined;
    let currTwoBarDuration: number;
    let absSubbeatIdx = -1;
    let maxSubbeatWait: number;
    let subbeatWait: number;
    let remainderOfCurrStretch = 0;
    let remainderOfCurrStretchPlusNextStretch: number;
    let stretchIdx = -1;
    let choices: [number, number][];
    let currWeight: number;
    let randVar: () => number;
    let currIdxIsOffBeat: boolean;

    let maxStrokeDurationBars: Array<number[]> = [];

    while (absSubbeatIdx < chart.durationInSubbeats) {        
        currTwoBarDuration = bars[musicIdx.barIdx].durationInSubbeats;
        remainderOfCurrStretchPlusNextStretch = remainderOfCurrStretch;
        
        if (musicIdx.barIdx < bars.length - 1) {
            currTwoBarDuration += bars[musicIdx.barIdx + 1].durationInSubbeats;
        }

        if (stretchIdx < chordStretches.length - 1) {
            remainderOfCurrStretchPlusNextStretch += chordStretches[stretchIdx + 1].durationInSubbeats;
        }

        if (currTwoBarDuration < remainderOfCurrStretchPlusNextStretch) {
            maxSubbeatWait = currTwoBarDuration;
        } else {
            maxSubbeatWait = remainderOfCurrStretchPlusNextStretch;
        }

        choices = [];
        currWeight = 1;
        currIdxIsOffBeat = Util.mod(absSubbeatIdx, 3) === 2;
        subbeatWait = currIdxIsOffBeat ? 1 : 2; 

        while (subbeatWait < maxSubbeatWait) {
            choices.push([subbeatWait, Math.max(currWeight, 1)]);
            currWeight += (subbeatWait < 4) ? 1 : -1;
            subbeatWait += (
                Util.mod(subbeatWait, 3) === 0
                    ? currIdxIsOffBeat
                        ? 1 : 2
                    : currIdxIsOffBeat
                        ? 2 : 1
            );
        }

        randVar = Util.generateCustomRandomVariable(choices); 
        subbeatWait = randVar();
        absSubbeatIdx += subbeatWait;
        musicIdx = chart.absSubbeatIdxToMusicIdx(absSubbeatIdx) as IMusicIdx; 
        
        if (!musicIdx) {
            break;
        }

        if (!maxStrokeDurationBars[musicIdx.barIdx]) {
            maxStrokeDurationBars[musicIdx.barIdx] = [];
        }

        maxStrokeDurationBars[musicIdx.barIdx][musicIdx.subbeatIdx as number] = 0;

        if (prevMusicIdx) {
            maxStrokeDurationBars[prevMusicIdx.barIdx][prevMusicIdx.subbeatIdx as number] += subbeatWait;
        }

        remainderOfCurrStretch -= subbeatWait;
        if (remainderOfCurrStretch < 0) {
            stretchIdx ++;
            remainderOfCurrStretch += chordStretches[stretchIdx].durationInSubbeats;
        } 

        prevMusicIdx = musicIdx;
    }

    bars.forEach((bar, barIdx) => {
        let maxStrokeDurationBar = maxStrokeDurationBars[barIdx];
        let musicBar: IMusicBar = {};
        if (maxStrokeDurationBar) {
            maxStrokeDurationBar.forEach((maxDuration, subbeatIdx) => {
                let { chordName } = chart.segmentAtIdx({ barIdx, subbeatIdx });
                let chord = new ChordClass(chordName as ChordName);
                let voicing = chord.voice(60, previousVoicing);
                musicBar[subbeatIdx] = [
                    {
                        notes: voicing,
                        durationInSubbeats: Math.ceil(Math.random() * maxDuration),
                        velocity: 1
                    }
                ];
            });
        }

        music[barIdx] = musicBar;
    });

    return {
        instrument: "piano",
        music
    };
};

export default compPianoSwingV1;