import * as Util from "../Util";
import { NoteName, RelativeNoteName, IChartBar, IChordSegment, IChordBase, IBarBase, Feel, ChordName } from "../types";

export * from "./composers/index"

export const NUMBER_OF_KEYS = 88;
export const LOWEST_A = 9;
export const HIGHEST_C = LOWEST_A + NUMBER_OF_KEYS - 1;
export const LOWER_TEMPO_LIMIT = 40;
export const UPPER_TEMPO_LIMIT = 210;

// const NOTE_REGEX = /[A-G](#|b)?/g;
const RELATIVE_SCALE_NOTE_REGEX = /[1H2N34T5U6J7]/g;

export const contextualize = (word: string, keyContext: NoteName): string => {
    let { base, shape } = getWordConstituents(word);
    let baseIndex = NOTE_NAMES.indexOf(keyContext);

    let contextualizedBase = base.replace(
        RELATIVE_SCALE_NOTE_REGEX, 
        (note: RelativeNoteName) => NOTE_NAMES[(baseIndex + RELATIVE_SCALE.indexOf(note)) % 12]
    );

    return shape ? `${contextualizedBase}^${shape}` : contextualizedBase;
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
        return noteNameChoices[1];
    }
    return noteNameChoices[0]; 
}

export const getPresentableChord = (chord: string, keyContext = ""): string => {
    let { base, shape } = getWordConstituents(chord);
    return `${getPresentableNoteName(base, keyContext)}^${shape}`;
}

export const C_NOTE_NAMES_INDICES = [0, 2, 4, 5, 7, 9, 11];

export const noteIsInKey = (note: number, key: NoteName): boolean => {
    return getKeyNoteNameIndices(key).indexOf(note % 12) !== -1;
}

export const getKeyNoteNameIndices = (key: NoteName): number[] => {
    let offset = NOTE_NAMES.indexOf(key);
    if (offset === -1) return [];
    return C_NOTE_NAMES_INDICES.map(pitch => (pitch + offset) % 12);
}

export const contextualizeBars = (barsBase: IBarBase[], newKeyContext: NoteName): IBarBase[] => {
    return barsBase.map<IBarBase>((bar: IBarBase) => {
        let contextualizedBar: IBarBase = Util.copyObject(bar);
        contextualizedBar.chordSegments = bar.chordSegments.map<IChordBase>((chordBase: IChordBase ) => {
            let contextualizedChordBase = Util.copyObject(chordBase);
            contextualizedChordBase.chord = contextualize(chordBase.chord, newKeyContext);
            contextualizedChordBase.chordName = [contextualize(((chordBase.chordName as ChordName)[0] as RelativeNoteName), newKeyContext), (chordBase.chordName as ChordName)[1]]
            contextualizedChordBase.key = contextualize(chordBase.key, newKeyContext);
            return contextualizedChordBase;
        });
        return contextualizedBar;
    });
};

export const adjustBarTimes = (bars: IBarBase[], feel: Feel): IChartBar[] => {
    switch (feel) {
        case Feel.Swing: 
            return _adjustBarsSwingFeel(bars);
    }
}

// Adjust chart attributes, etc. that have to do with time so that
// the every quarter note is divided into 3 subbeats. This makes
// it easier for the instrument-specific comp functions to write their
// parts. 
const _adjustBarsSwingFeel = (bars: IBarBase[]): IChartBar[] => {

    // First we convert time signatures and beat indices
    let adjustedBars: IChartBar[] = bars.map(bar=> {
        let { timeSignature, chordSegments, barIdx } = bar;
        let conversionFactor: number; 
        let adjustedTimeSignature = Util.copyObject(timeSignature);
        let subbeatsInBar = 0;

        if (timeSignature[1] === 8) {
            if (timeSignature[0] % 2 === 1) {
                throw new Error("PRECOMP: cannot convert to swing feel " + timeSignature);
            }
            adjustedTimeSignature[0] /= 2;
            adjustedTimeSignature[1] = 4;
            conversionFactor = 3 / 2;

        } else if (timeSignature[1] === 4) {
            conversionFactor = 3;
        } else {
            throw new Error("PRECOMP: cannot convert to swing feel " + timeSignature);
        }

        let adjustedSegments = chordSegments.map<IChordSegment>((chordBase: IChordBase, segmentIdx: number) => {
            let durationInSubbeats = conversionFactor * chordBase.durationInBeats;
            let adjustedSegment: any = {
                beatIdx: chordBase.beatIdx,
                subbeatIdx: conversionFactor * chordBase.beatIdx,
                chord: chordBase.chord,
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
            timeSignature: adjustedTimeSignature,
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
            let nextSegment = (
                segmentIdx === chordSegments.length - 1
                    ? nextBar.chordSegments[0]
                    : chordSegments[segmentIdx + 1]
            );

            if (segment.chord !== nextSegment.chord) {
                changeIndices.push({ barIdx, segmentIdx });
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
                    ? stretchEnd.segmentIdx
                    : chordSegments.length - 1
            );
            let segmentStartIdx = (
                barIdx === stretchStart.barIdx
                    ? stretchStart.segmentIdx + 1
                    : 0
            );

            for (let segmentIdx = segmentEndIdx; segmentIdx >= segmentStartIdx; segmentIdx --) {
                let segment = chordSegments[segmentIdx];
                currentSubbeatSum += segment.durationInSubbeats;
                segment.subbeatsBeforeChange = currentSubbeatSum;
            }

            startBarReached = barIdx === stretchStart.barIdx;
        }
    }   
    
    return adjustedBars;
}
