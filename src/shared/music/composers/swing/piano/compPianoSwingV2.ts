import * as Util from "../../../../Util";
import { Chord } from "../../../domain/ChordClass";
import { ChordName, Tempo, IMusicBar, IPart, IMusicIdx, IChordSegment, IStroke, IChordStretch, IChartBar } from "../../../../types";
import Chart from "../../../Chart";

const VEL_FACTOR = 0.6;
const DURATION_SPREAD_ROOT = 3;
const DURATION_SPREAD_FACTOR = Math.log2(DURATION_SPREAD_ROOT);
const MAX_TEMPO = 210;
const VOICING_TARGET = 60;
const INITIAL_REFERRAL_TO_PREVIOUS_MUSIC_ODDS = 0.75;
const NUDGE_WITHIN_RANGE_ODDS = 0.8;
const VOICING_DEVIATION_LIMIT = 13;

export const compPianoSwingV2 = (chart: Chart, prevMusic?: IMusicBar[]): IPart => {

    /**
     * DECLARATIONS & INIT
     */

    let { chordStretchesInRange, bars, barsInRange } = chart;
    chordStretchesInRange = chordStretchesInRange as IChordStretch[];
    let music: IMusicBar[] = [];
    let previousVoicing: number[] = [];

    let musicIdx: IMusicIdx | undefined; 
    let currTwoBarDuration: number;
    let absStartIdx = (chart.musicIdxToAbsSubbeatIdx({ barIdx: chart.rangeStartIdx, subbeatIdx: 0 }) as number) - 1;
    let absSubbeatIdx = absStartIdx;
    let maxSubbeatWait: number;
    let subbeatWait: number;
    let remainderOfCurrStretch = 0;
    let durationIntoNextStretch: number;
    let remainderOfCurrStretchPlusSomeOfNextStretch: number;
    let stretchIdx = -1;
    let buffer: number | undefined = 0;

    let maxStrokeDurationBars: Array<number[]> = bars.map(bar => []);

    /**
     * CONSULT PREV MUSIC FOR INIT
     */

    // If there is previous music, we can set the starting values of absSubbeatIdx and 
    // previousVoicing accordingly

    if (Array.isArray(prevMusic) && prevMusic.length > 0 && Math.random() < INITIAL_REFERRAL_TO_PREVIOUS_MUSIC_ODDS) {

        let lastStroke: IStroke | undefined;
        let subbeatDurationFromTopOfLastPlayedBarToTopOfChart = 0;

        for (let barIdx = chart.rangeEndIdx; barIdx >= chart.rangeStartIdx; barIdx --) {

            subbeatDurationFromTopOfLastPlayedBarToTopOfChart += bars[barIdx].durationInSubbeats as number;

            let lastMusicBar = prevMusic[barIdx];

            if (!Util.objectIsEmpty(lastMusicBar)) {

                let subbeatIdx;
                for (subbeatIdx in lastMusicBar) {
                    lastStroke = lastMusicBar[subbeatIdx][0];
                }

                if (lastStroke) {
                    subbeatIdx = parseInt(subbeatIdx as string, undefined);
                    buffer = subbeatIdx + lastStroke.durationInSubbeats - subbeatDurationFromTopOfLastPlayedBarToTopOfChart;

                    previousVoicing = lastStroke.notes;
                }

                break;
            }

        }
    }

    /**
     * FILL maxStrokeDurationBars
     */

    while (musicIdx !== null) {  
        
        // It is assumed that the current stretch has been voiced
        // (initially, remainderOfCurrStretch is set to 0 and stretchIdx is set to -1
        // so that remainderOfCurrStretchPlusSomeOfNextStretch will be the duration of only some of the 
        // first stretch)
        
        currTwoBarDuration = getCurrTwoBarDuration(barsInRange, musicIdx ? musicIdx.barIdx : chart.rangeStartIdx);
        durationIntoNextStretch = Math.floor(getStretchDuration(chordStretchesInRange, stretchIdx + 1) / 2);
        remainderOfCurrStretchPlusSomeOfNextStretch = remainderOfCurrStretch + durationIntoNextStretch;
        
        // Get the maximum possible wait time in subbeats
        maxSubbeatWait = Math.min(currTwoBarDuration, remainderOfCurrStretchPlusSomeOfNextStretch);
        subbeatWait = getMaxDuration(maxSubbeatWait, absSubbeatIdx, buffer);
        buffer = undefined;
        setMaxStrokeDuration(maxStrokeDurationBars, subbeatWait, musicIdx);

        remainderOfCurrStretch -= subbeatWait;
        if (remainderOfCurrStretch <= 1) {

            // We can increment the stretch index only when we know that 
            // what is currently the next stretch is covered by a voicing,
            // which is the case if the remainder of the current stretch is 
            // 1 subbeat or less

            stretchIdx ++;
            remainderOfCurrStretch += getStretchDuration(chordStretchesInRange, stretchIdx);
        } 

        absSubbeatIdx += subbeatWait;
        musicIdx = chart.absSubbeatIdxToMusicIdx(absSubbeatIdx) as IMusicIdx; 

        if (musicIdx && musicIdx.barIdx > chart.rangeEndIdx) {
            break;
        }
    }

    /**
     * GENERATE CHORD VOICINGS AND CREATE MUSIC ARRAY
     */

    maxStrokeDurationBars.forEach((maxStrokeDurationBar, barIdx) => {

        let musicBar: IMusicBar = {};
        maxStrokeDurationBar.forEach((maxDuration, subbeatIdx) => {

            let segment = getSegment(chart, barIdx, subbeatIdx);
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

function setMaxStrokeDuration(maxStrokeDurationBars: Array<number[]>, subbeatWait: number, prevMusicIdx?: IMusicIdx) {
    if (prevMusicIdx) {
        maxStrokeDurationBars[prevMusicIdx.barIdx][prevMusicIdx.subbeatIdx as number] = subbeatWait;
    }
}

function getStretchDuration(stretches: IChordStretch[], stretchIdx: number) {

    if (!stretches[Util.mod(stretchIdx, stretches.length)]) {
        console.log(stretches, stretchIdx);
    }

    return stretches[Util.mod(stretchIdx, stretches.length)].durationInSubbeats as number;
}

function getCurrTwoBarDuration(bars: IChartBar[], barIdx: number) {
    let currBarIdx = bars.findIndex(bar => bar.barIdx === barIdx);

    return (bars[currBarIdx].durationInSubbeats as number) 
        + (bars[Util.mod(currBarIdx + 1, bars.length)].durationInSubbeats as number);
}

function getSegment(chart: Chart, barIdx: number, subbeatIdx: number) {
    let segment = chart.segmentAtIdx({ barIdx, subbeatIdx });

    // If the subbeat index is the last in the current segment,
    // allow for the possibility of playing the next chord
    if (subbeatIdx === ((segment.subbeatIdx as number) + (segment.durationInSubbeats as number) - 1)) {
        let nextSegment = chart.nextSegmentAtIdx({ barIdx, subbeatIdx });
        if (nextSegment) {
            segment = nextSegment as IChordSegment;
        }
    }

    return segment;
}

function getMaxDuration(maxSubbeatWait: number, absSubbeatIdx: number, buffer?: number) {
    let waitChoices: [number, number][] = [];
    let currWeight = 1;
    let currIdxIsOffBeat = Util.mod(absSubbeatIdx, 3) === 2;
    let subbeatWait = currIdxIsOffBeat ? 1 : 2; 

    if (buffer && buffer > maxSubbeatWait) {
        buffer = undefined;
    }

    while (subbeatWait <= maxSubbeatWait) {
        if (!buffer || subbeatWait >= buffer) {
            waitChoices.push([subbeatWait, Math.max(currWeight, 1)]);
        }

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