import * as Util from "../../Util";
import compPianoSwingFeelV0 from "./swing/piano/compPianoSwingFeelV0";
import compBassSwingFeelV0 from "./swing/bass/compBassSwingFeelV0";
import compDrumsSwingFeelV0 from "./swing/drums/compDrumsSwingFeelV0";

export const compAll = (song, feel) => {
    let take;

    switch(feel) {
        case "swing":
            take = compSwingFeel(song);
            break;
    }

    for (
            let i = song.chart.rangeStartIndex;
            i <= song.chart.rangeEndIndex;
            i ++
    ) {
        take[i].withinRange = true;
    }
    
    return take;
};

const compSwingFeel = song => {

    // Adjust song attributes, etc. that have to do with time so that
    // the every quarter note is divided into 3 subbeats. This makes
    // it easier for the instrument-specific comp functions to write their
    // parts. At the moment, only songs 
    let timeAdjustedSong = Util.copyObject(song);
    
    for (let bar of timeAdjustedSong.chart.barsV1) {
        let { timeSignature, chordEnvelopes } = bar;
        let conversionFactor, beatConverter;

        if (timeSignature[1] === 8) {
            if (timeSignature[0] % 2 === 1) return null;

            timeSignature[0] /= 2;
            timeSignature[1] = 4;
            conversionFactor = 3 / 2;
            beatConverter = beat => Number(beat) % 2 
                                        ? `${(Number(beat) - 1) / 2 + 1}`
                                        : `${(Number(beat) - 2) / 2 + 1}+`; 
        } else if (timeSignature[1] === 4) {
            conversionFactor = 3;
            beatConverter = beat => beat;
        } else {
            return null;
        }

        chordEnvelopes.forEach(chordEnvelope => {
            chordEnvelope.beat = beatConverter(chordEnvelope.beat);
            chordEnvelope.subbeatsBeforeChange = chordEnvelope.beatsBeforeChange * conversionFactor;
            chordEnvelope.durationInSubbeats = chordEnvelope.durationInBeats * conversionFactor;
        });
    }

    let bassTake = compBassSwingFeelV0(timeAdjustedSong);
    let drumsTake = compDrumsSwingFeelV0(timeAdjustedSong);

    return compPianoSwingFeelV0(timeAdjustedSong).map((pianoBarPhrases, i) => { 

        let bassBarPhrases = bassTake[i];
        let drumsBarPhrases = drumsTake[i];
        let chartBar = timeAdjustedSong.chart.barsV1[i];

        return {
            timeSignature: chartBar.timeSignature,
            barSubdivision: 12,
            musicSegments: pianoBarPhrases.map((pianoPhrase, j) => ({
                durationInSubbeats: chartBar.chordEnvelopes[j].durationInSubbeats,
                parts: {
                    "piano": pianoPhrase,
                    "doubleBass": bassBarPhrases[j],
                    ...drumsBarPhrases[j]  
                } 
            }))
        };
    });
};

