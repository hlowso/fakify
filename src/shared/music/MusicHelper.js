import * as Util from "../Util";

const RELATIVE_SCALE= ["1", "H", "2", "N", "3", "4", "T", "5", "U", "6", "J", "7"];
const NOTE_NAMES = ["C", "C#|Db", "D", "D#|Eb", "E", "F", "F#|Gb", "G", "G#|Ab", "A", "A#|Bb", "B"];

const NOTE_REGEX = /[A-G](#|b)?/g;
const RELATIVE_SCALE_NOTE_REGEX = /[1H2N34T5U6J7]/g;

const _contextualize = (word, keySignature) => {
    let constituents = word.split("^");
    let base = constituents[0], chordShape = constituents[1];
    let baseIndex = NOTE_NAMES.indexOf(keySignature);
    let contextualizedBase = base.replace(RELATIVE_SCALE_NOTE_REGEX, note => NOTE_NAMES[(baseIndex + RELATIVE_SCALE.indexOf(note)) % 12]);

    return chordShape ? `${contextualizedBase}^${chordShape}` : contextualizedBase;
};

// TODO rename this function so it's more specific to key signatures.
export const contextualize = (song, keySignature = "") => {

    let { tempo, originalTempo, originalKeySignature, chart } = song;
    let { bars, barsV1, currentSegmentIndex } = chart;
    let sessionChart = {};

    if (!keySignature) keySignature = originalKeySignature;
    if (!tempo) tempo = originalTempo;

    sessionChart.barsV1 = barsV1.map(bar => {
        let contextualizedBar = Util.copyObject(bar);
        contextualizedBar.chordEnvelopes = bar.chordEnvelopes.map(chordEnvelope => {
            let contextualizedChordEnvelope = Util.copyObject(chordEnvelope);
            contextualizedChordEnvelope.chord = _contextualize(chordEnvelope.chord, keySignature);
            contextualizedChordEnvelope.key = _contextualize(chordEnvelope.key, keySignature);
            return contextualizedChordEnvelope;
        });
        return contextualizedBar;
    });

    sessionChart.currentSegmentIndex = currentSegmentIndex;

    // The session song receives all the attributes of the song
    let sessionSong = Util.copyObject(song);

    // But the chart is contextualized
    sessionSong.chart = sessionChart;

    sessionSong.keySignature = keySignature;
    sessionSong.tempo = tempo; 

    return sessionSong;
};

export * from "./compers/index";
