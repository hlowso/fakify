// import compSwingPianoV1 from "./swing/piano/compPianoSwingV1";
import compSwingPianoV2 from "./swing/piano/compPianoSwingV2"
import compBassSwingV1 from "./swing/bass/compBassSwingV1";
import compDrumsSwingV1 from "./swing/drums/compDrumsSwingV1";
import { generateSwingExerciseV0 } from "./swing/generateSwingExerciseV0";
import { Feel, Difficulty, IExercise } from "../../types";
import Chart from "../Chart";
import Score from "../Score";

export const CompV1 = (chart: Chart): Score => {
    switch (chart.feel) {
        case Feel.Swing:
            return _getSwingAccompaniment(chart);
    }
}

const _getSwingAccompaniment = (chart: Chart): Score => {
    return new Score([
        // compSwingPianoV1(chart),
        compSwingPianoV2(chart),
        compBassSwingV1(chart),
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
