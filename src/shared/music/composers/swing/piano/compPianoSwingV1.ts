import { NOTE_NAMES } from "../../../MusicHelper";
import { IChartBar, IMusicBarV2 } from "../../../../types";

const convertChordNameToNotes = (chord: string): [number, number, number] => {
    let chordBase = chord.split("^")[0];
    let index = NOTE_NAMES.indexOf(chordBase);

    return [
        60 + index,
        64 + index,
        67 + index
    ];
};

export const compPianoSwingV1 = (bars: IChartBar[]): IMusicBarV2[] => {
    return bars.map(bar => {

        let musicBar: IMusicBarV2 = {};
        bar.chordSegments.forEach(segment => {
            musicBar[segment.subbeatIdx] = [
                {
                    notes: convertChordNameToNotes(segment.chord),
                    durationInSubbeats: segment.durationInSubbeats / 2,
                    velocity: 1
                }
            ];
        });

        return musicBar;
        
    }); 
};

export default compPianoSwingV1;