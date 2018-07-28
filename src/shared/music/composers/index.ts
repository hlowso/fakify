// import compSwingPianoV1 from "./swing/piano/compPianoSwingV1";
import compSwingPianoV2 from "./swing/piano/compPianoSwingV2"
// import compBassSwingV1 from "./swing/bass/compBassSwingV1";
import { compBassSwingV2 } from "./swing/bass/compBassSwingV2";
import compDrumsSwingV1 from "./swing/drums/compDrumsSwingV1";
import { generateSwingExerciseV0 } from "./swing/generateSwingExerciseV0";
import { Feel, Difficulty, IExercise, IMusicBar } from "../../types";
import Chart from "../Chart";
import Score from "../Score";

export const CompV1 = (chart: Chart, prevScore?: Score): Score => {
    switch (chart.feel) {
        case Feel.Swing:
            return _getSwingAccompaniment(chart, prevScore);
    }
}

const _getSwingAccompaniment = (chart: Chart, prevScore?: Score): Score => {
    let prevPianoMusic: IMusicBar[] | undefined;
    let prevBassMusic: IMusicBar[] | undefined;
    
    if (prevScore) {
        prevPianoMusic = prevScore.getPart("piano").music;
        prevBassMusic = prevScore.getPart("doubleBass").music;
    }

    return new Score([
        compSwingPianoV2(chart, prevPianoMusic),
        // compBassSwingV1(chart),
        compBassSwingV2(chart, prevBassMusic),
        ...compDrumsSwingV1(chart)
    ]);
}

export const GenerateExercise = (chart: Chart, instrument = "piano", difficulty = Difficulty.Easy): IExercise => {
    let { feel } = chart;

    switch (feel) {
        case Feel.Swing: 
            return generateSwingExerciseV0(chart, instrument, difficulty);
        default:
            throw new Error(`PRECOMP: error - unknown feel ${feel}`);
    }
}
