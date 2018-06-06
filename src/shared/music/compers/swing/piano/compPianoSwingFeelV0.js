import { NOTE_NAMES } from "../../../MusicHelper";

const convertChordNameToNotes = chord => {
    let chordBase = chord.split("^")[0];
    let index = NOTE_NAMES.indexOf(chordBase);

    return [
        60 + index,
        64 + index,
        67 + index
    ];
};

export const compPianoSwingFeelV0 = song => {
    return song.chart.barsV1.map(bar => {

        let chordPhrases = bar.chordEnvelopes.map(chordEnvelope => {
            return [
                {
                    subbeatOffset: 0, 
                    notes: convertChordNameToNotes(chordEnvelope.chord),
                    durationInSubbeats: chordEnvelope.durationInSubbeats / 2,
                    velocity: 1
                }
            ];
        });
        
        return chordPhrases;
    }); 
};

export default compPianoSwingFeelV0;