// import {IChart, IMusicBar, Feel, IChartBar} from "../../types";

// export const comp = (chart: IChart, ignoreRange = false): IMusicBar[] => {
//     let pianoAccompaniment: any; 
//     let bassAccompaniment: any;
//     let drumsAccompaniment: any;
//     let timeAdjustedBars: any;
//     let timeBarsAdjuster: any;
//     let getAccompaniment: any;

//     switch(chart.feel) {
//         case Feel.Swing:
//             timeBarsAdjuster = adjustBarsSwingFeel;
//             getAccompaniment = getSwingFeelAccompaniment;
//             break;        
//     }

//     timeAdjustedBars = timeBarsAdjuster(chart.barsV1);
//     [
//         pianoAccompaniment, 
//         bassAccompaniment, 
//         drumsAccompaniment
//     ] = getAccompaniment(timeAdjustedBars);

//     return timeAdjustedBars.map((chartBar: IChartBar, i: number) => { 

//         let pianoBarPassages = pianoAccompaniment[i];
//         let bassBarPassages = bassAccompaniment[i];
//         let drumsBarPassages = drumsAccompaniment[i];

//         return {
//             timeSignature: chartBar.timeSignature,
//             durationInSubbeats: 3 * chartBar.timeSignature[0],
//             chordPassages: pianoBarPassages.map((pianoPhrase: any, j: number) => ({
//                 durationInSubbeats: chartBar.chordEnvelopes[j].durationInSubbeats,
//                 parts: {
//                     "piano": pianoPhrase,
//                     "doubleBass": bassBarPassages[j],
//                     ...drumsBarPassages[j]  
//                 } 
//             }))
//         };
//     });
// };


// const getSwingFeelAccompaniment = (bars: IChartBar[]): any => {
//     return [
//         compPianoSwingFeelV0(bars),
//         compBassSwingFeelV0(bars),
//         compDrumsSwingFeelV0(bars)
//     ];
// };
