import * as Util from "../../Util";
import compPianoSwingFeelV0 from "./swing/piano/compPianoSwingFeelV0";
import compBassSwingFeelV0 from "./swing/bass/compBassSwingFeelV0";
import compDrumsSwingFeelV0 from "./swing/drums/compDrumsSwingFeelV0";
import { IChart, IMusicBar, Feel, IChartBar, IChartChord } from "../../types";

export const comp = (chart: IChart, ignoreRange = false): IMusicBar[] => {
    let pianoAccompaniment: any; 
    let bassAccompaniment: any;
    let drumsAccompaniment: any;
    let timeAdjustedBars: any;
    let timeBarsAdjuster: any;
    let getAccompaniment: any;

    switch(chart.feel) {
        case Feel.Swing:
            timeBarsAdjuster = adjustBarsSwingFeel;
            getAccompaniment = getSwingFeelAccompaniment;
            break;        
    }

    timeAdjustedBars = timeBarsAdjuster(chart.barsV1);
    [
        pianoAccompaniment, 
        bassAccompaniment, 
        drumsAccompaniment
    ] = getAccompaniment(timeAdjustedBars);

    return timeAdjustedBars.map((chartBar: IChartBar, i: number) => { 

        let pianoBarPassages = pianoAccompaniment[i];
        let bassBarPassages = bassAccompaniment[i];
        let drumsBarPassages = drumsAccompaniment[i];

        return {
            timeSignature: chartBar.timeSignature,
            durationInSubbeats: 3 * chartBar.timeSignature[0],
            chordPassages: pianoBarPassages.map((pianoPhrase: any, j: number) => ({
                durationInSubbeats: chartBar.chordEnvelopes[j].durationInSubbeats,
                parts: {
                    "piano": pianoPhrase,
                    "doubleBass": bassBarPassages[j],
                    ...drumsBarPassages[j]  
                } 
            }))
        };
    });
};

// Adjust chart attributes, etc. that have to do with time so that
// the every quarter note is divided into 3 subbeats. This makes
// it easier for the instrument-specific comp functions to write their
// parts. 
const adjustBarsSwingFeel = (bars: IChartBar[]): IChartBar[] => {
    return bars.map((bar: IChartBar) => {
        let { timeSignature, chordEnvelopes } = bar;
        let conversionFactor: number, 
            updatedTimeSignature = Util.copyObject(timeSignature),
            beatConverter: (beat: string) => string;

        if (timeSignature[1] === 8) {
            if (timeSignature[0] % 2 === 1) {
                throw new Error("PRECOMP: cannot convert to swing feel");
            }

            updatedTimeSignature[0] /= 2;
            updatedTimeSignature[1] = 4;
            conversionFactor = 3 / 2;
            beatConverter = beat => Number(beat) % 2 
                                        ? `${(Number(beat) - 1) / 2 + 1}`
                                        : `${(Number(beat) - 2) / 2 + 1}+`; 
        } else if (timeSignature[1] === 4) {
            conversionFactor = 3;
            beatConverter = beat => beat;
        } else {
            throw new Error("PRECOMP: cannot convert to swing feel");
        }

        return {
            timeSignature: updatedTimeSignature,
            chordEnvelopes: chordEnvelopes.map((chordEnvelope: IChartChord) => {
                let updatedChordEnvelope = Util.copyObject(chordEnvelope);
                updatedChordEnvelope.beat = beatConverter(chordEnvelope.beat);
                updatedChordEnvelope.subbeatsBeforeChange = chordEnvelope.beatsBeforeChange * conversionFactor;
                updatedChordEnvelope.durationInSubbeats = chordEnvelope.durationInBeats * conversionFactor;
                return updatedChordEnvelope;
            })
        };
    });
}

const getSwingFeelAccompaniment = (bars: IChartBar[]): any => {
    return [
        compPianoSwingFeelV0(bars),
        compBassSwingFeelV0(bars),
        compDrumsSwingFeelV0(bars)
    ];
};

