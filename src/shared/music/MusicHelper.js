import * as Util from "../Util";

const NOTE_REGEX = /[A-G](#|b)?/g;
const RELATIVE_SCALE_NOTE_REGEX = /[1H2N34T5U6J7]/g;

const _contextualize = (word, keyContext) => {
    let { base, chordShape } = getWordConstituents(word);
    let baseIndex = NOTE_NAMES.indexOf(keyContext);

    let contextualizedBase = base.replace(
        RELATIVE_SCALE_NOTE_REGEX, 
        note => NOTE_NAMES[(baseIndex + RELATIVE_SCALE.indexOf(note)) % 12]
    );

    return chordShape ? `${contextualizedBase}^${chordShape}` : contextualizedBase;
};

export const getWordConstituents = word => {
    let constituents = word.split("^");
    return {
        base: constituents[0],
        chordShape: constituents[1]
    };
}

export * from "./compers/index";

export const RELATIVE_SCALE= ["1", "H", "2", "N", "3", "4", "T", "5", "U", "6", "J", "7"];
export const NOTE_NAMES = ["C", "C#|Db", "D", "D#|Eb", "E", "F", "F#|Gb", "G", "G#|Ab", "A", "A#|Bb", "B|Cb"];

// The chart viewer passes the key of the first chordEnvelope of the first
// bar of the chart object to the getPresentableChord function below to 
// make user-facing chord bases contain only one note. All major key signatures
// that can be written with either sharps or flats are written with flats by 
// convention

export const getPresentableNoteName = (noteName, keyContext = "") => {
    let noteNameChoices = /b/g.test(noteName) ? noteName.split("|") : [noteName, noteName];

    if (!keyContext || keyContext === "F" || /b/g.test(keyContext)) {
        return noteNameChoices[1];
    }
    return noteNameChoices[0]; 
}

export const getPresentableChord = (chord, keyContext = "") => {
    let { base, chordShape } = getWordConstituents(chord);
    return `${getPresentableNoteName(base, keyContext)}^${chordShape}`;
}

export const C_NOTE_NAMES_INDECES = [0, 2, 4, 5, 7, 9, 11];

export const noteIsInKey = (note, key) => {
    return getKeyNoteNameIndeces(key).indexOf(note % 12) !== -1;
}

export const getKeyNoteNameIndeces = key => {
    let offset = NOTE_NAMES.indexOf(key);
    if (offset === -1) return [];
    return C_NOTE_NAMES_INDECES.map(pitch => (pitch + offset) % 12);
}

export const contextualizeBars = (barsBase, newKeyContext) => {
    return barsBase.map(bar => {
        let contextualizedBar = Util.copyObject(bar);
        contextualizedBar.chordEnvelopes = bar.chordEnvelopes.map(chordEnvelope => {
            let contextualizedChordEnvelope = Util.copyObject(chordEnvelope);
            contextualizedChordEnvelope.chord = _contextualize(chordEnvelope.chord, newKeyContext);
            contextualizedChordEnvelope.key = _contextualize(chordEnvelope.key, newKeyContext);
            return contextualizedChordEnvelope;
        });
        return contextualizedBar;
    });
};
