import * as Util from "../Util";
import { NoteName, RelativeNoteName, IChartBar, IChordSegment, Feel, ChordName } from "../types";

export const NUMBER_OF_KEYS = 88;
export const LOWEST_A = 9;
export const HIGHEST_C = LOWEST_A + NUMBER_OF_KEYS - 1;

export const contextualize = (note: RelativeNoteName, keyContext: NoteName) => {
    return contextualizeOrDecontextualize(note, keyContext) as NoteName;
}

export const contextualizeOrDecontextualize = (note: RelativeNoteName | NoteName, keyContext: NoteName, decontextualize = false): string => {
    let targetReferenceIdx = NOTE_NAMES.indexOf(keyContext);
    let originReferenceIdx = 0;
    let originScale: (NoteName | RelativeNoteName)[] = RELATIVE_SCALE;
    let targetScale: (NoteName | RelativeNoteName)[] = NOTE_NAMES;

    if (decontextualize) {
        originReferenceIdx = targetReferenceIdx;
        targetReferenceIdx = 0;
        originScale = NOTE_NAMES;
        targetScale = RELATIVE_SCALE;
    }

    let indexDiff = originScale.indexOf(note) - originReferenceIdx;
    return targetScale[Util.mod(targetReferenceIdx + indexDiff, 12)];
};

export const getWordConstituents = (word: string): any => {
    let constituents = word.split("^");

    return {
        base: constituents[0],
        shape: constituents[1]
    };
}

export const RELATIVE_SCALE: RelativeNoteName[] = ["1", "H", "2", "N", "3", "4", "T", "5", "U", "6", "J", "7"];
export const NOTE_NAMES: NoteName[] = ["C", "C#|Db", "D", "D#|Eb", "E", "F", "F#|Gb", "G", "G#|Ab", "A", "A#|Bb", "B|Cb"];

// Temporary ugly code for getting the set of notes in a scale from 
// a note name. TODO: create a ticket for organizing notes better. 
// Should Note be its own class?
export const keyTo7Notes = (key: NoteName) => {
    let tonicIdx = NOTE_NAMES.indexOf(key);
    return C_NOTE_NAMES_INDICES.map(note => note + tonicIdx);
}

// The chart viewer passes the key of the first chordEnvelope of the first
// bar of the chart object to the getPresentableChord function below to 
// make user-facing chord bases contain only one note. All major key signatures
// that can be written with either sharps or flats are written with flats by 
// convention

export const getPresentableNoteName = (noteName: NoteName, keyContext = ""): string => {
    let noteNameChoices = /b/g.test(noteName) ? noteName.split("|") : [noteName, noteName];

    if (!keyContext || keyContext === "F" || /b/g.test(keyContext)) {
        if (noteName === "B|Cb" && keyContext !== "G#|Ab" && keyContext !== "C#|Db" && keyContext !== "F#|Gb") {
            return noteNameChoices[0];
        }
        return noteNameChoices[1];
    }
    return noteNameChoices[0]; 
}

export const getPresentableChord = (chord: string, keyContext = ""): string => {
    let { base, shape } = getWordConstituents(chord);
    return `${getPresentableNoteName(base, keyContext)}^${shape}`;
}

export const C_NOTE_NAMES_INDICES = [0, 2, 4, 5, 7, 9, 11];

export const noteIsInKey = (note: number, key: NoteName | ""): boolean => {
    return getKeyNoteNameIndices(key).indexOf(note % 12) !== -1;
}

export const getKeyNoteNameIndices = (key: NoteName | ""): number[] => {
    let offset = NOTE_NAMES.indexOf(key as NoteName);
    if (offset === -1) return [];
    return C_NOTE_NAMES_INDICES.map(pitch => (pitch + offset) % 12);
}

export const contextualizeOrDecontextualizeBars = (barsBase: IChartBar[], newKeyContext: NoteName, decontextualize = false): IChartBar[] => {
    return barsBase.map((bar: IChartBar) => {

        let contextualizedBar: IChartBar = Util.copyObject(bar);

        contextualizedBar.chordSegments = bar.chordSegments.map((chordBase: IChordSegment) => {

            let contextualizedChordBase = Util.copyObject(chordBase);

            contextualizedChordBase.chordName = [contextualizeOrDecontextualize(((chordBase.chordName as ChordName)[0] as RelativeNoteName), newKeyContext, decontextualize), (chordBase.chordName as ChordName)[1]] as ChordName;
            
            if (chordBase.key) {
                contextualizedChordBase.key = contextualizeOrDecontextualize(chordBase.key, newKeyContext, decontextualize) as (RelativeNoteName | NoteName);
            }

            return contextualizedChordBase;
        });

        return contextualizedBar;
    });
};

export const adjustBarTimes = (bars: IChartBar[], feel: Feel): IChartBar[] => {

    // First add the durationInBeats to each chord segment
    bars.forEach(bar => {
        let { timeSignature, chordSegments } = bar;
        let beatsLeftToOccupyInBar = timeSignature[0];

        // CAREFUL!! Reversing the chordSegments in place
        chordSegments.reverse().forEach(segment => {
            segment.durationInBeats = beatsLeftToOccupyInBar - (segment.beatIdx as number);
            beatsLeftToOccupyInBar -= segment.durationInBeats;
        });

        // Must reverse chordSegments back again
        chordSegments.reverse();
    });

    switch (feel) {
        case Feel.Swing: 
            return _adjustBarsSwingFeel(bars);
    }
}

// Adjust chart attributes, etc. that have to do with time so that
// the every quarter note is divided into 3 subbeats. This makes
// it easier for the instrument-specific comp functions to write their
// parts. 
const _adjustBarsSwingFeel = (bars: IChartBar[]): IChartBar[] => {

    // First we convert time signatures and beat indices
    let adjustedBars: IChartBar[] = bars.map((bar, barIdx) => {

        let { timeSignature, chordSegments } = bar;
        let conversionFactor: number; 
        let subbeatsInBar = 0;

        if (timeSignature[1] === 4) {
            conversionFactor = 3;
        } else {
            throw new Error("PRECOMP: cannot convert to swing feel " + timeSignature);
        }

        let adjustedSegments = chordSegments.map((chordBase: IChordSegment, segmentIdx: number) => {
            let durationInSubbeats = conversionFactor * (chordBase.durationInBeats as number);
            let adjustedSegment: any = {
                beatIdx: chordBase.beatIdx,
                subbeatIdx: conversionFactor * (chordBase.beatIdx as number),
                chordName: chordBase.chordName,
                key: chordBase.key,
                durationInSubbeats,

                // subbeatsBegoreChange will be corrected below (if necessary)
                subbeatsBeforeChange: Infinity
            };
            subbeatsInBar += durationInSubbeats;
            return adjustedSegment;
        });

        return {
            barIdx,
            timeSignature,
            durationInSubbeats: subbeatsInBar,
            chordSegments: adjustedSegments
        };
    });

    // Now we mark the places in the chart where the chords
    // change from segment to segment
    let changeIndices = [];

    for (let barIdx = 0; barIdx < adjustedBars.length; barIdx++) {
        let nextBarIdx = (barIdx + 1) % adjustedBars.length;
        let bar = adjustedBars[barIdx];
        let nextBar = adjustedBars[nextBarIdx];
        let { chordSegments } = bar;

        for (let segmentIdx = 0; segmentIdx < chordSegments.length; segmentIdx ++) {
            let segment = chordSegments[segmentIdx];
            let nextSegmentBar;
            let nextSegmentIdx;
            
            if (segmentIdx === chordSegments.length - 1) {
                nextSegmentBar = nextBar;
                nextSegmentIdx = 0;
            } else {
                nextSegmentBar = bar;
                nextSegmentIdx = segmentIdx + 1;
            }
            
            let nextSegment = nextSegmentBar.chordSegments[nextSegmentIdx];

            if (
                (segment.chordName as ChordName)[0] !== (nextSegment.chordName as ChordName)[0] || 
                (segment.chordName as ChordName)[1] !== (nextSegment.chordName as ChordName)[1]                 
            ) {
                changeIndices.push({ barIdx: nextSegmentBar.barIdx, segmentIdx: nextSegmentIdx });
            }
        }
    }

    // If there are NO changes (for whatever reason), the subbeatsBeforeChange
    // attribute will be Infinity everywhere
    if (!changeIndices.length) {
        return adjustedBars;
    }

    // Otherwise, by counting subbeats backwards from change index 
    // to change index, we properly calculate the subbeatsBeforeChange 
    // attribute for all segments
    for (let i = 0; i < changeIndices.length; i ++) {
        let stretchStart = changeIndices[i];
        let stretchEnd = changeIndices[Util.mod(i + 1, changeIndices.length)];
        let currentSubbeatSum = 0;
        let startBarReached = false;

        for (
                let barIdx = stretchEnd.barIdx; 
                !startBarReached; 
                barIdx = Util.mod(barIdx - 1, adjustedBars.length)
        ) {
            let { chordSegments } =  adjustedBars[barIdx];
            
            let segmentEndIdx = (
                barIdx === stretchEnd.barIdx
                    ? (barIdx === stretchStart.barIdx && stretchEnd.segmentIdx < stretchStart.segmentIdx) 
                        ? chordSegments.length - 1
                        : stretchEnd.segmentIdx - 1
                    : chordSegments.length - 1
            );
            
            let segmentStartIdx = (
                barIdx === stretchStart.barIdx
                    ? stretchStart.segmentIdx
                    : 0
            );

            for (let segmentIdx = segmentEndIdx; segmentIdx >= segmentStartIdx; segmentIdx --) {
                let segment = chordSegments[segmentIdx];
                currentSubbeatSum += segment.durationInSubbeats as number;
                segment.subbeatsBeforeChange = currentSubbeatSum;
            }

            startBarReached = barIdx === stretchStart.barIdx;
        }
    }   
    
    return adjustedBars;
}

/**
 * 
 * @param voicing 
 * @returns true if the voicing contains no clusters
 */
export function voicingContainsNoClusters(voicing: number[]) {
    let i = 0, j = 1, k = 2;

    voicing.sort((a, b) => a - b);

    while (k < voicing.length) {
        let p1 = voicing[i],
            p2 = voicing[j],
            p3 = voicing[k];

        if (p2 - p1 <= 2 && p3 - p2 <= 2) {
            return false;
        }

        i ++; j ++; k++;
    }

    return true;
}

/**
 * pickClosestKey
 * @param prevKey a note name representing the target key
 * @param keys an array of note names from which to choose the closest to prevKey
 * @returns the closest key in keys to prevKey
 */

export function pickClosestKey(prevKey: NoteName | RelativeNoteName, keys: (NoteName | RelativeNoteName)[]): NoteName | RelativeNoteName | undefined {

    /* VALIDATIONS */

    let errMsg = 'invalid arguments passed to pickClosestKey:';

    if (typeof prevKey !== "string" || !Array.isArray(keys) || keys.length === 0 ) {
        console.error(errMsg, prevKey, keys);
        return;
    }

    let relative: boolean;

    if (NOTE_NAMES.indexOf(prevKey as NoteName) !== -1) {
        relative = false;

        if (keys.some(k => NOTE_NAMES.indexOf(k as NoteName) === -1)) {
            console.error(errMsg, keys);
            return;
        }

    } else if (RELATIVE_SCALE.indexOf(prevKey as RelativeNoteName) !== -1) {
        relative = true;

        if (keys.some(k => RELATIVE_SCALE.indexOf(k as RelativeNoteName)  === -1)) {
            console.error(errMsg, keys);
            return;
        }

    } else {
        console.error(errMsg, prevKey);
        return;
    }

    /* ALGORITHM */

    let noteSet: (NoteName | RelativeNoteName)[] = relative ? RELATIVE_SCALE : NOTE_NAMES;
    let prevKeyBaseIdx = noteSet.indexOf(prevKey);
    let keyBaseIndices = keys.map(k => noteSet.indexOf(k));

    let prevScale = C_NOTE_NAMES_INDICES.map(p => noteSet[Util.mod(prevKeyBaseIdx + p, 12)]);
    let keyScales = keyBaseIndices.map(baseIdx => C_NOTE_NAMES_INDICES.map(p => noteSet[Util.mod(baseIdx + p, 12)]));

    let distances: Array<[ NoteName | RelativeNoteName, number ]> = keyScales.map((scale, idx) => {
        return [ keys[idx], scale.filter(n => prevScale.indexOf(n) !== -1).length ] as [ NoteName | RelativeNoteName, number ];
    });

    distances.sort((a, b) => a[1] - b[1]);

    return distances[0][0];
}
