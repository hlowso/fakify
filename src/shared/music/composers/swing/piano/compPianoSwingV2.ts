import * as Util from "../../../../Util";
import { ChordClass } from "../../../Domain";
import { ChordName, IMusicBarV2, IPart } from "../../../../types";
import Chart from "../../../Chart";

export const compPianoSwingV1 = (chart: Chart): IPart => {
    let music: IMusicBarV2[] = [];
    let previousVoicing: number[] = [];

    // TODO ...    
    // chart.forEachChordStretch((stretch, stretchIdx) => {

    // });

    chart.bars.forEach(bar => {

        let musicBar: IMusicBarV2 = {};
        bar.chordSegments.forEach(segment => {
            let voicing = new ChordClass(segment.chordName as ChordName).voice(60, previousVoicing);
            musicBar[segment.subbeatIdx] = [
                {
                    notes: voicing,
                    durationInSubbeats: segment.durationInSubbeats / 2,
                    velocity: 1
                }
            ];
            previousVoicing = voicing;
        });

        music[bar.barIdx] = musicBar;
    }); 
    
    return {
        instrument: "piano",
        music
    };
};

export default compPianoSwingV1;