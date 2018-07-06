import { ChordClass } from "../../../Domain";
import { ChordName, IChartBar, IMusicBarV2, IPart } from "../../../../types";

export const compPianoSwingV1 = (bars: IChartBar[]): IPart => {
    let music: IMusicBarV2[] = [];
    bars.forEach(bar => {

        let musicBar: IMusicBarV2 = {};
        bar.chordSegments.forEach(segment => {
            musicBar[segment.subbeatIdx] = [
                {
                    notes: new ChordClass(segment.chordName as ChordName).voice(60),
                    durationInSubbeats: segment.durationInSubbeats / 2,
                    velocity: 1
                }
            ];
        });

        music[bar.barIdx] = musicBar;
    }); 
    
    return {
        instrument: "piano",
        music
    };
};

export default compPianoSwingV1;