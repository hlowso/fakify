import * as Util from "../../../../Util";
import { ChordClass } from "../../../Domain";
import { ChordName, IMusicBar, IPart, IMusicIdx, IChordSegment } from "../../../../types";
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
    let waitChoices: [number, number][];
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

        waitChoices = [];
        currWeight = 1;
        currIdxIsOffBeat = Util.mod(absSubbeatIdx, 3) === 2;
        subbeatWait = currIdxIsOffBeat ? 1 : 2; 

        while (subbeatWait < maxSubbeatWait) {
            waitChoices.push([subbeatWait, Math.max(currWeight, 1)]);
            currWeight += (subbeatWait < 4) ? 1 : -1;
            subbeatWait += (
                Util.mod(subbeatWait, 3) === 0
                    ? currIdxIsOffBeat
                        ? 1 : 2
                    : currIdxIsOffBeat
                        ? 2 : 1
            );
        }

        if (waitChoices.length === 0) {
            if (maxSubbeatWait > 0) {
                subbeatWait = maxSubbeatWait;
            } else {
                break;
            }
        } else {
            randVar = Util.generateCustomRandomVariable(waitChoices); 
            subbeatWait = randVar();
        }

        absSubbeatIdx += subbeatWait;
        
        if (prevMusicIdx) {
            maxStrokeDurationBars[prevMusicIdx.barIdx][prevMusicIdx.subbeatIdx as number] = Math.min(subbeatWait, remainderOfCurrStretch + 3);
        }

        remainderOfCurrStretch -= subbeatWait;
        if (remainderOfCurrStretch < 0) {
            stretchIdx ++;
            remainderOfCurrStretch += chordStretches[stretchIdx].durationInSubbeats;
        } 

        musicIdx = chart.absSubbeatIdxToMusicIdx(absSubbeatIdx) as IMusicIdx; 
        
        if (!musicIdx) {
            break;
        }

        if (!maxStrokeDurationBars[musicIdx.barIdx]) {
            maxStrokeDurationBars[musicIdx.barIdx] = [];
        }

        prevMusicIdx = musicIdx;
    }

    bars.forEach((bar, barIdx) => {
        let maxStrokeDurationBar = maxStrokeDurationBars[barIdx];
        let musicBar: IMusicBar = {};
        if (maxStrokeDurationBar) {
            maxStrokeDurationBar.forEach((maxDuration, subbeatIdx) => {
                
                let segment = chart.segmentAtIdx({ barIdx, subbeatIdx });

                // If the subbeat index is the last in the current segment,
                // allow for the possibility of playing the next chord
                if (subbeatIdx === (segment.subbeatIdx + segment.durationInSubbeats - 1)) {
                    let nextSegment = chart.nextSegmentAtIdx({ barIdx, subbeatIdx });
                    if (nextSegment) {
                        segment = nextSegment as IChordSegment;
                    }
                }

                // Reset the previous voicing if it gets too high or too low
                if (previousVoicing.length > 0) {
                    let prevVoicingAvg = previousVoicing.reduce((sum, pitch) => sum + pitch) / previousVoicing.length;
                    let diff = prevVoicingAvg - 60;
                    if (diff < -18 || diff > 18) {
                        previousVoicing = [];
                    }
                }

                let chord = new ChordClass(segment.chordName as ChordName);
                let voicing = chord.voice(60, previousVoicing);
                
                musicBar[subbeatIdx] = [
                    {
                        notes: voicing,
                        durationInSubbeats: Math.ceil(Math.random() * maxDuration),
                        velocity: 1
                    }
                ];

                previousVoicing = voicing;
            });
        }

        music[barIdx] = musicBar;
    });

    console.log(music);

    return {
        instrument: "piano",
        music
    };
};

export default compPianoSwingV1;