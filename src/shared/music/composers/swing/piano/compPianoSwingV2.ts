import * as Util from "../../../../Util";
import { ChordClass } from "../../../domain/ChordClass";
import { ChordName, IMusicBar, IPart, IMusicIdx, IChordSegment, IStroke } from "../../../../types";
import Chart from "../../../Chart";

export const compPianoSwingV1 = (chart: Chart, prevMusic?: IMusicBar[]): IPart => {
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

    let maxStrokeDurationBars: Array<number[]> = bars.map(bar => []);

    // If there is previous music, we can set the starting values of absSubbeatIdx and 
    // previousVoicing accordingly
    if (Array.isArray(prevMusic) && prevMusic.length > 0) {
        let lastMusicBar = prevMusic[prevMusic.length - 1];
        let lastStroke: IStroke = { notes: [], durationInSubbeats: NaN, velocity: NaN };
        let subbeatIdx;
        for (subbeatIdx in lastMusicBar) {
            lastStroke = lastMusicBar[subbeatIdx][0];
        }

        subbeatIdx = parseInt(subbeatIdx as string, undefined);

        absSubbeatIdx = subbeatIdx + lastStroke.durationInSubbeats - bars[bars.length - 1].durationInSubbeats;
        previousVoicing = lastStroke.notes;
    }

    while (musicIdx) {        
        currTwoBarDuration = bars[musicIdx.barIdx].durationInSubbeats + bars[Util.mod(musicIdx.barIdx + 1, bars.length)].durationInSubbeats;
        remainderOfCurrStretchPlusNextStretch = remainderOfCurrStretch + chordStretches[Util.mod(stretchIdx + 1, chordStretches.length)].durationInSubbeats;
        
        if (currTwoBarDuration < remainderOfCurrStretchPlusNextStretch) {
            maxSubbeatWait = currTwoBarDuration;
        } else {
            maxSubbeatWait = remainderOfCurrStretchPlusNextStretch;
        }

        // Subbtract 1 from the max subbeat wait, because if the stroke lands on 
        // the last subbeat of a segment, it's chord will be that of the next segment
        maxSubbeatWait --;

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

        randVar = Util.generateCustomRandomVariable(waitChoices); 
        subbeatWait = randVar();
        absSubbeatIdx += subbeatWait;
        musicIdx = chart.absSubbeatIdxToMusicIdx(absSubbeatIdx) as IMusicIdx; 
        
        if (prevMusicIdx) {
            maxStrokeDurationBars[prevMusicIdx.barIdx][prevMusicIdx.subbeatIdx as number] = Math.min(subbeatWait, remainderOfCurrStretch + 3);
        }

        remainderOfCurrStretch -= subbeatWait;
        if (remainderOfCurrStretch < 0) {
            stretchIdx ++;
            remainderOfCurrStretch += chordStretches[Util.mod(stretchIdx, chordStretches.length)].durationInSubbeats;
        } 

        prevMusicIdx = musicIdx;
    }

    maxStrokeDurationBars.forEach((maxStrokeDurationBar, barIdx) => {
        let musicBar: IMusicBar = {};
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
                if (diff < -15 || diff > 15) {
                    previousVoicing = [];
                }
            }

            let chord = new ChordClass(segment.chordName as ChordName);
            let voicing = chord.voice(60, previousVoicing);

            let steepNess = 1.584963; // log base 2 of 3
            let durationInSubbeats = Math.ceil( maxDuration *  Math.pow(2 * Math.random(), steepNess) / 3 );
            
            musicBar[subbeatIdx] = [
                {
                    notes: voicing,
                    durationInSubbeats,
                    velocity: 1
                }
            ];

            previousVoicing = voicing;
        });

        music[barIdx] = musicBar;
    });

    return {
        instrument: "piano",
        music
    };
};

export default compPianoSwingV1;