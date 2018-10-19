import * as Util from "../../../../Util";
import { Chord } from "../../../domain/ChordClass";
import { ChordName, Tempo, IMusicBar, IPart, IMusicIdx, IChordSegment, /*IStroke,*/ IChordStretch, IChartBar } from "../../../../types";
import Chart from "../../../Chart";

const VEL_FACTOR = 0.6;
const DURATION_SPREAD_ROOT = 3;
const DURATION_SPREAD_FACTOR = Math.log2(DURATION_SPREAD_ROOT);
const MAX_TEMPO = 210;
const VOICING_TARGET = 60;
// const INITIAL_REFERRAL_TO_PREVIOUS_MUSIC_ODDS = 0.75;
const NUDGE_WITHIN_RANGE_ODDS = 0.8;
const VOICING_DEVIATION_LIMIT = 13;

export const compPianoSwingV2 = (chart: Chart, prevMusic?: IMusicBar[]): IPart => {

    /**
     * DECLARATIONS & INIT
     */

    let { chordStretches, bars } = chart;
    chordStretches = chordStretches as IChordStretch[];
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

    let maxStrokeDurationBars: Array<number[]> = bars.map(bar => []);

    /**
     * CONSULT PREV MUSIC FOR INIT
     */

    // If there is previous music, we can set the starting values of absSubbeatIdx and 
    // previousVoicing accordingly

    // TODO: uncomment the block below which consults the prevMusic array passed in
    // to create initial settings

    // if (Array.isArray(prevMusic) && prevMusic.length > 0 && Math.random() < INITIAL_REFERRAL_TO_PREVIOUS_MUSIC_ODDS) {

    //     let lastStroke: IStroke | undefined;
    //     let subbeatDurationFromTopOfLastPlayedBarToTopOfChart = 0;

    //     for (let barIdx = chart.rangeEndIdx; barIdx >= chart.rangeStartIdx; barIdx --) {

    //         subbeatDurationFromTopOfLastPlayedBarToTopOfChart += bars[barIdx].durationInSubbeats as number;

    //         let lastMusicBar = prevMusic[barIdx];

    //         if (!Util.objectIsEmpty(lastMusicBar)) {

    //             let subbeatIdx;
    //             for (subbeatIdx in lastMusicBar) {
    //                 lastStroke = lastMusicBar[subbeatIdx][0];
    //             }

    //             if (lastStroke) {
    //                 subbeatIdx = parseInt(subbeatIdx as string, undefined);
    //                 absSubbeatIdx = subbeatIdx + lastStroke.durationInSubbeats - subbeatDurationFromTopOfLastPlayedBarToTopOfChart;
    //                 previousVoicing = lastStroke.notes;
    //             }

    //             break;
    //         }

    //     }

    //     if (absSubbeatIdx <= -1) {
    //         absSubbeatIdx = -1;
    //     } else {
    //         prevMusicIdx = musicIdx = chart.absSubbeatIdxToMusicIdx(absSubbeatIdx) as IMusicIdx; 
    //     }
    // }

    /**
     * FILL maxStrokeDurationBars
     */

    while (musicIdx) {        
        currTwoBarDuration = getCurrTwoBarDuration(bars, musicIdx.barIdx);
        remainderOfCurrStretchPlusNextStretch = remainderOfCurrStretch + getStretchDuration(chordStretches, stretchIdx + 1);
        
        // Get the maximum possible wait time in subbeats/
        // Subtract 2 from remainder of curr stretch plus next because the next voicing
        // must land at or before the second last subbeat of the next stretch in order
        // for it to count for that stretch
        if (currTwoBarDuration < remainderOfCurrStretchPlusNextStretch - 2) {
            maxSubbeatWait = currTwoBarDuration;
        } else {
            maxSubbeatWait = remainderOfCurrStretchPlusNextStretch - 2;
        }

        subbeatWait = getMaxDuration(maxSubbeatWait, absSubbeatIdx);
        absSubbeatIdx += subbeatWait;
        musicIdx = chart.absSubbeatIdxToMusicIdx(absSubbeatIdx) as IMusicIdx; 
        
        if (prevMusicIdx) {
            maxStrokeDurationBars[prevMusicIdx.barIdx][prevMusicIdx.subbeatIdx as number] = subbeatWait;
        }

        remainderOfCurrStretch -= subbeatWait;
        if (remainderOfCurrStretch <= 0) {
            stretchIdx ++;
            remainderOfCurrStretch += getStretchDuration(chordStretches, stretchIdx);
        } 

        prevMusicIdx = musicIdx;
    }

    /**
     * GENERATE CHORD VOICINGS AND CREATE MUSIC ARRAY
     */

    maxStrokeDurationBars.forEach((maxStrokeDurationBar, barIdx) => {
        let musicBar: IMusicBar = {};
        maxStrokeDurationBar.forEach((maxDuration, subbeatIdx) => {
            let segment = chart.segmentAtIdx({ barIdx, subbeatIdx });

            // If the subbeat index is the last in the current segment,
            // allow for the possibility of playing the next chord
            if (subbeatIdx === ((segment.subbeatIdx as number) + (segment.durationInSubbeats as number) - 1)) {
                let nextSegment = chart.nextSegmentAtIdx({ barIdx, subbeatIdx });
                if (nextSegment) {
                    segment = nextSegment as IChordSegment;
                }
            }

            let voicing = getVoicing(segment.chordName as ChordName, previousVoicing);
            let durationInSubbeats = maxPossibleDurationToDuration(maxDuration, chart.tempo as Tempo);

            // Quiet down piano by default since it's 
            // inherently louder than double bass and drums
            let velocity = VEL_FACTOR;

            // Even quieter if the next stroke comes immediately 
            // after this stroke
            if (maxDuration === 1) {
                velocity *= 0.5;
            }
            
            // Moderately quieter if the stroke is stoccato
            // but there isn't an immediately following stroke
            else if (durationInSubbeats === 1) {
                velocity = 0.75 * VEL_FACTOR;
            }

            musicBar[subbeatIdx] = [{
                notes: voicing,
                durationInSubbeats,
                velocity
            }];

            previousVoicing = voicing;
        });

        music[barIdx] = musicBar;
    });

    return {
        instrument: "piano",
        music
    };
};

/**
 * HELPERS
 */

function getStretchDuration(stretches: IChordStretch[], stretchIdx: number) {
    return stretches[Util.mod(stretchIdx, stretches.length)].durationInSubbeats as number;
}

function getCurrTwoBarDuration(bars: IChartBar[], barIdx: number) {
    return (bars[barIdx].durationInSubbeats as number) 
        + (bars[Util.mod(barIdx + 1, bars.length)].durationInSubbeats as number);
}

function getMaxDuration(maxSubbeatWait: number, absSubbeatIdx: number) {
    let waitChoices: [number, number][] = [];
    let currWeight = 1;
    let currIdxIsOffBeat = Util.mod(absSubbeatIdx, 3) === 2;
    let subbeatWait = currIdxIsOffBeat ? 1 : 2; 

    while (subbeatWait <= maxSubbeatWait) {
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

    let randVar = Util.generateCustomRandomVariable(waitChoices); 
    return randVar();
}

function getVoicing(chordName: ChordName, previousVoicing: number[]) {
    let chord = new Chord(chordName);
    let nudgeFactor = NaN;           

    if (previousVoicing.length > 0) {
        let prevVoicingAvg = Util.mean(previousVoicing);
        let diff = prevVoicingAvg - VOICING_TARGET;

        if (diff > VOICING_DEVIATION_LIMIT) {
            nudgeFactor = -0.5;
        } else if (diff < -1 * VOICING_DEVIATION_LIMIT) {
            nudgeFactor = 0.5;
        } else {
            let diffFactor = Math.pow(diff / VOICING_DEVIATION_LIMIT, 2) * 3;
            diffFactor = diffFactor > 1 ? 1 : diffFactor;
            let diffFactorSign = diff > 0 ? -1 : 1;

            if (Math.random() < NUDGE_WITHIN_RANGE_ODDS) {
                nudgeFactor = diffFactorSign * diffFactor;
            }
        }
    }

    return chord.voice(VOICING_TARGET, previousVoicing, nudgeFactor);
}

function maxPossibleDurationToDuration(max: number, tempo: Tempo) {
    let durationSkewer = 0.5 * tempo[0] / MAX_TEMPO; 

    // base must be a number between 0 and 2
    let base = Math.random() + (
        Math.random() < durationSkewer
            ? 0
            : 1
    );
    return Math.ceil( max *  Math.pow(base, DURATION_SPREAD_FACTOR) / DURATION_SPREAD_ROOT );
}

export default compPianoSwingV2;