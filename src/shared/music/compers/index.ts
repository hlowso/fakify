// import * as Util from "../../Util";
import compSwingPianoV1 from "./swing/piano/compPianoSwingV1";
import compBassSwingV1 from "./swing/bass/compBassSwingV1";
import compDrumsSwingV1 from "./swing/drums/compDrumsSwingV1";
import { Feel, IChartBar, IMusicBarV2, IScoreBar } from "../../types";
import Chart from "../Chart";


export const CompV1 = (chart: Chart): IScoreBar[] => {
    let { bars, feel } = chart;
    let getAccompaniment: any;
    let pianoAccompaniment: IMusicBarV2[];
    let bassAccompaniment: IMusicBarV2[];
    let drumsAccompaniment: IMusicBarV2[];

    switch (feel) {
        case Feel.Swing:
            getAccompaniment = _getSwingAccompaniment;
            break;
    }

    [
        pianoAccompaniment, 
        bassAccompaniment, 
        drumsAccompaniment
    ] = getAccompaniment(bars);

    return bars.map((bar: IChartBar, i: number) => {
        return {
            piano: pianoAccompaniment[i],
            doubleBass: bassAccompaniment[i],
            ...drumsAccompaniment[i]
        };
    });
}

const _getSwingAccompaniment = (bars: IChartBar[]): [IMusicBarV2[], IMusicBarV2[], Array<{ rideCymbal: IMusicBarV2; shutHiHat: IMusicBarV2 }>] => {
    return [
        compSwingPianoV1(bars),
        compBassSwingV1(bars),
        compDrumsSwingV1(bars)
    ];
}
