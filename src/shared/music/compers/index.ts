import * as Util from "../../Util";
import compPianoSwingFeelV0 from "./swing/piano/compPianoSwingFeelV0";
import compBassSwingFeelV0 from "./swing/bass/compBassSwingFeelV0";
import compDrumsSwingFeelV0 from "./swing/drums/compDrumsSwingFeelV0";
import { IChart, IMusicBar, Feel } from "../../types";

export const comp = (chart: IChart, ignoreRange = false): IMusicBar[] => {
    let chartSection = Util.copyObject(chart);

    if (!ignoreRange) {
        let { barsV1, rangeStartIndex, rangeEndIndex } = chart;
        chartSection.barsV1 = barsV1.filter(
            (bar: any, i: number) => rangeStartIndex <= i && i <= rangeEndIndex
        );
    }

    switch(chart.feel) {
        case Feel.Swing:
            return compSwingFeel(chartSection);

        default:
            return [];
    }
};

const compSwingFeel = (chartSection: IChart): IMusicBar[] => {

    // Adjust chart attributes, etc. that have to do with time so that
    // the every quarter note is divided into 3 subbeats. This makes
    // it easier for the instrument-specific comp functions to write their
    // parts. 
    let timeAdjustedChart = Util.copyObject(chartSection);
    
    for (let bar of timeAdjustedChart.barsV1) {
        let { timeSignature, chordEnvelopes } = bar;
        let conversionFactor: number, 
            beatConverter: (beat: string) => string;

        if (timeSignature[1] === 8) {
            if (timeSignature[0] % 2 === 1) {
                return [];
            }

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
            return [];
        }

        chordEnvelopes.forEach((chordEnvelope: any) => {
            chordEnvelope.beat = beatConverter(chordEnvelope.beat);
            chordEnvelope.subbeatsBeforeChange = chordEnvelope.beatsBeforeChange * conversionFactor;
            chordEnvelope.durationInSubbeats = chordEnvelope.durationInBeats * conversionFactor;
        });
    }

    let bassTake = compBassSwingFeelV0(timeAdjustedChart);
    let drumsTake = compDrumsSwingFeelV0(timeAdjustedChart);

    return compPianoSwingFeelV0(timeAdjustedChart).map((pianoBarPhrases: any, i: number) => { 

        let bassBarPhrases = bassTake[i];
        let drumsBarPhrases = drumsTake[i];
        let chartBar = timeAdjustedChart.barsV1[i];

        return {
            timeSignature: chartBar.timeSignature,
            durationInSubbeats: 12,
            chordPassages: pianoBarPhrases.map((pianoPhrase: any, j: number) => ({
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

