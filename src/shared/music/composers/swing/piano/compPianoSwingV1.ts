import { NOTE_NAMES } from "../../../MusicHelper";
import { IChartBar, IMusicBarV2, IPart } from "../../../../types";

const convertChordNameToNotes = (chord: string): [number, number, number] => {
    let chordBase = chord.split("^")[0];
    let index = NOTE_NAMES.indexOf(chordBase);

    return [
        60 + index,
        64 + index,
        67 + index
    ];
};

export const compPianoSwingV1 = (bars: IChartBar[]): IPart => {
    let music: IMusicBarV2[] = [];
    bars.forEach(bar => {

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

        music[bar.barIdx] = musicBar;
    }); 
    
    return {
        instrument: "piano",
        music
    };
};

export default compPianoSwingV1;