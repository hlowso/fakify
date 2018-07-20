import { NOTE_NAMES } from "../../../MusicHelper";
import { NoteName, IChartBar, IMusicBar, IPart } from "../../../../types";

const convertChordNameToNotes = (chord: string): [number, number, number] => {
    let chordBase = chord.split("^")[0];
    let index = NOTE_NAMES.indexOf(chordBase as NoteName);

    return [
        60 + index,
        64 + index,
        67 + index
    ];
};

export const compPianoSwingV1 = (bars: IChartBar[]): IPart => {
    let music: IMusicBar[] = [];
    bars.forEach(bar => {

        let musicBar: IMusicBar = {};
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