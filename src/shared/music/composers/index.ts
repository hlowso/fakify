import compSwingPianoV1 from "./swing/piano/compPianoSwingV1";
import compBassSwingV1 from "./swing/bass/compBassSwingV1";
import compDrumsSwingV1 from "./swing/drums/compDrumsSwingV1";
import { generateSwingExerciseV0 } from "./swing/generateSwingExerciseV0";
import { Feel, IChartBar, IMusicBarV2, IScoreBar } from "../../types";
import Chart from "../Chart";

export const CompV1 = (chart: Chart): IScoreBar[] => {
    let { bars, feel } = chart;
    let getAccompaniment: any;

    switch (feel) {
        case Feel.Swing:
            getAccompaniment = _getSwingAccompaniment;
            break;
    }

    let accompaniment = getAccompaniment(bars);

    return bars.map((bar: IChartBar, i: number) => {
        let scoreBar = {};
        for (let instrument in accompaniment) {
            let musicBar = accompaniment[instrument][i];
            for (let subbeatIdx in musicBar) {
                let subbeatStrokes = scoreBar[subbeatIdx] || {};
                subbeatStrokes[instrument] = musicBar[subbeatIdx];
                scoreBar[subbeatIdx] = subbeatStrokes;
            }
        }
        return scoreBar;
    });
}

const _getSwingAccompaniment = (bars: IChartBar[]): {piano: IMusicBarV2[], doubleBass: IMusicBarV2[], rideCymbal: IMusicBarV2[], shutHiHat: IMusicBarV2[]} => {
    return {
        piano: compSwingPianoV1(bars),
        doubleBass: compBassSwingV1(bars),
        ...compDrumsSwingV1(bars)
    };
}

export const GenerateExercise = (chart: Chart): IMusicBarV2[] => {
    let { feel } = chart;

    switch (feel) {
        case Feel.Swing: 
            return generateSwingExerciseV0(chart);
        default:
            throw new Error(`PRECOMP: error - unknown feel ${feel}`);
    }
}
