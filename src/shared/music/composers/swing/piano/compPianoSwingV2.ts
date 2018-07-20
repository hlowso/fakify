import * as Util from "../../../../Util";
import { ChordClass } from "../../../Domain";
import { ChordName, IMusicBar, IPart, IMusicIdx } from "../../../../types";
import Chart from "../../../Chart";

export const compPianoSwingV1 = (chart: Chart): IPart => {
    let { chordStretches, bars } = chart;
    let music: IMusicBar[] = [];
    let previousVoicing: number[] = [];

    let musicIdx: IMusicIdx | undefined;
    let prevMusicIdx: IMusicIdx | undefined;
    let currTwoBarDuration: number;
    let absSubbeatIdx = 0;
    let maxSubbeatWait: number;
    let subbeatWait: number;
    let remainderOfCurrStretch = 0;
    let remainderOfCurrStretchPlusNextStretch: number;
    let stretchIdx = 0;
    let choices: [number, number][];
    let currWeight: number;
    let randVar: () => number;

    let maxStrokeDurationBars: Array<number[]> = [];

    while (absSubbeatIdx < chart.durationInSubbeats) {
        prevMusicIdx = musicIdx;
        musicIdx = chart.absSubbeatIdxToMusicIdx(absSubbeatIdx) as IMusicIdx;   
        
        currTwoBarDuration = bars[musicIdx.barIdx].durationInSubbeats;
        remainderOfCurrStretchPlusNextStretch = remainderOfCurrStretch;
        
        if (musicIdx.barIdx < bars.length - 1) {
            currTwoBarDuration += bars[musicIdx.barIdx + 1].durationInSubbeats;
        }

        if (stretchIdx < chordStretches.length) {
            remainderOfCurrStretchPlusNextStretch + chordStretches[stretchIdx].durationInSubbeats;
        }

        if (currTwoBarDuration < remainderOfCurrStretchPlusNextStretch) {
            maxSubbeatWait = currTwoBarDuration;
        } else {
            maxSubbeatWait = remainderOfCurrStretchPlusNextStretch;
        }

        choices = [];
        currWeight = 1;
        for (let i = 0; i < maxSubbeatWait; i ++) {
            choices.push([i, i < 5 ? currWeight : Math.max(--currWeight, 1)]);
        }

        randVar = Util.generateCustomRandomVariable(choices); 
        subbeatWait = randVar();
        absSubbeatIdx += subbeatWait;

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
        } 

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
                        durationInSubbeats: Math.random() * maxDuration,
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