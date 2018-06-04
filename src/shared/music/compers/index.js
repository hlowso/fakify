import * as Util from "../../Util";
import compPianoSwingFeelV0 from "./swing/piano/compPianoSwingFeelV0";

export const compAll = (song, feel) => {

    switch(feel) {
        case "swing":
            return compSwingFeel(song);
    }

};

const compSwingFeel = song => {

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
        } else {
            conversionFactor = 3;
            beatConverter = beat => beat;
        }

        chordEnvelopes.forEach(chordEnvelope => {
            chordEnvelope.beat = beatConverter(chordEnvelope.beat);
            chordEnvelope.durationInSubbeats = chordEnvelope.beatsBeforeChange * conversionFactor;
            delete chordEnvelope.beatsBeforeChange;
        });
    }

    return compPianoSwingFeelV0(timeAdjustedSong).map(musicSegment => ({
        "piano": musicSegment
    }));
};

