import { ChordClass } from "../../../Domain";
import { ChordName, IChartBar, IMusicBarV2, IPart } from "../../../../types";

export const compPianoSwingV1 = (bars: IChartBar[]): IPart => {
    let music: IMusicBarV2[] = [];
    let previousVoicing: number[] = [];

    bars.forEach(bar => {

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