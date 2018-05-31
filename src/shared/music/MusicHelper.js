import * as Util from "../Util";

const RELATIVE_SCALE= ["1", "H", "2", "N", "3", "4", "T", "5", "U", "6", "J", "7"];
const NOTE_NAMES = ["C", "C#|Db", "D", "D#|Eb", "E", "F", "F#|Gb", "G", "G#|Ab", "A", "A#|Bb", "B"];

const NOTE_REGEX = /[A-G](#|b)?/g;
const RELATIVE_SCALE_NOTE_REGEX = /[1H2N34T5U6J7]/g;

const _contextualize = (word, keySignature) => {
    let constituents = word.split("^");
    let base = constituents[0], chordShape = constituents[1];
    let baseIndex = NOTE_NAMES.indexOf(keySignature);
    return `${base.replace(RELATIVE_SCALE_NOTE_REGEX, note => NOTE_NAMES[(baseIndex + RELATIVE_SCALE.indexOf(note)) % 12])}^${chordShape}`;
};

export const getSessionSong = (song, keySignature = "") => {
    if (!keySignature) keySignature = song.originalKeySignature;

    let { chart } = song;
    let { bars, keyRanges, segments } = chart;
    let sessionChart = {};

    sessionChart.bars = {};
    Object.entries(bars).forEach(([barNumber, bar]) => {
        sessionChart.bars[barNumber] = {}; 
        Object.entries(bar).forEach(([beat, chord]) => {
            sessionChart.bars[barNumber][beat] = _contextualize(chord, keySignature);
        });
    });

    sessionChart.keyRanges = keyRanges.map(range => ({
        from: range.from,
        to: range.to,
        key: _contextualize(range.key, keySignature)
    }));

    sessionChart.segments = segments.map(segment => ({
        chartIndex: segment.chartIndex,
        chord: _contextualize(segment.chord, keySignature)
    }));

    let sessionSong = Util.copyObject(song);
    sessionSong.chart = sessionChart;
    sessionSong.keySignature = keySignature;

    return sessionSong;
};