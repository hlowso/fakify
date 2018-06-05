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

    let segments = [];
    return song.chart.barsV1.map(bar => {

        let chordOutlines = bar.chordEnvelopes.map(chordEnvelope => {
            return [
                {
                    subbeat: 1, 
                    notes: convertChordNameToNotes(chordEnvelope.chord),
                    duration: chordEnvelope.durationInSubbeats / 2,
                    velocity: 1
                }
            ];
        });
        
        return chordOutlines;
    }); 
};

export default compPianoSwingFeelV0;