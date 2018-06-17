import { NOTE_NAMES } from "../../../MusicHelper";

const getBassNote = chord => {
    let chordBase = chord.split("^")[0];
    let index = NOTE_NAMES.indexOf(chordBase);

    return [36 + index];
}

const getFifth = chord => {
    let chordBase = chord.split("^")[0];
    let index = NOTE_NAMES.indexOf(chordBase);

    return [43 + index];
}

export const compBassSwingFeelV0 = chart => {

    return chart.barsV1.map(bar => {

        let chordPhrases = bar.chordEnvelopes.map(chordEnvelope => {
            let fullBeatsCouplets = chordEnvelope.durationInSubbeats / 6;

            if (chordEnvelope.durationInSubbeats % 6) {
                return [
                    {
                        subbeatOffset: 0,
                        notes: getBassNote(chordEnvelope.chord),
                        durationInSubbeats: chordEnvelope.durationInSubbeats,
                        velocity: 1
                    }
                ];
            }
            let set = [];
            for (let i = 0; i < fullBeatsCouplets; i ++) {
                set = [ ...set, {
                    subbeatOffset: i * 6, 
                    notes: getBassNote(chordEnvelope.chord),
                    durationInSubbeats: 3,
                    velocity: 1
                }, {
                    subbeatOffset: 3 + i * 6, 
                    notes: getFifth(chordEnvelope.chord),
                    durationInSubbeats: 3,
                    velocity: 1
                }];
            }

            return set;
        });
        
        return chordPhrases;
    }); 
};

export default compBassSwingFeelV0;