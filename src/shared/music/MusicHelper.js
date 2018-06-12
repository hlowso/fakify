import * as Util from "../Util";

const NOTE_REGEX = /[A-G](#|b)?/g;
const RELATIVE_SCALE_NOTE_REGEX = /[1H2N34T5U6J7]/g;

const _contextualize = (word, keySignature) => {
    let { base, chordShape } = getWordConstituents(word);
    let baseIndex = NOTE_NAMES.indexOf(keySignature);

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

export const getPresentableNoteName = (noteName, keySignature = "") => {
    let noteNameChoices = /b/g.test(noteName) ? noteName.split("|") : [noteName, noteName];

    if (!keySignature || keySignature === "F" || /b/g.test(keySignature)) {
        return noteNameChoices[1];
    }
    return noteNameChoices[0]; 
}

export const getPresentableChord = (chord, keySignature = "") => {
    let { base, chordShape } = getWordConstituents(chord);
    return `${getPresentableNoteName(base, keySignature)}^${chordShape}`;
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

// TODO rename this function so it's more specific to key signatures.
export const contextualize = (song, newKeySignature = "") => {

    let { originalTempo, originalKeySignature, chart } = song;
    let { tempo, keySignature, barsBase } = chart;
    let sessionChart = { barsBase };

    if (!newKeySignature) {
        newKeySignature = keySignature ? keySignature : originalKeySignature;
    }
    if (!tempo) tempo = originalTempo;

    sessionChart.keySignature = newKeySignature;
    sessionChart.tempo = tempo;

    sessionChart.barsV1 = barsBase.map(bar => {
        let contextualizedBar = Util.copyObject(bar);
        contextualizedBar.chordEnvelopes = bar.chordEnvelopes.map(chordEnvelope => {
            let contextualizedChordEnvelope = Util.copyObject(chordEnvelope);
            contextualizedChordEnvelope.chord = _contextualize(chordEnvelope.chord, newKeySignature);
            contextualizedChordEnvelope.key = _contextualize(chordEnvelope.key, newKeySignature);
            return contextualizedChordEnvelope;
        });
        return contextualizedBar;
    });

    // The session song receives all the attributes of the song
    let sessionSong = Util.copyObject(song);

    // But the chart contains the contextualized barsV1 array
    sessionSong.chart = sessionChart;

    return sessionSong;
};
