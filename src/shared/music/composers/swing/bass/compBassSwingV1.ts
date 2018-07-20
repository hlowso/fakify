import { NOTE_NAMES } from "../../../MusicHelper";
import { NoteName, IMusicBar, IPart } from "../../../../types";
import Chart from "../../../Chart";

const getBassNote = (chord: string): number => {
    let chordBase = chord.split("^")[0];
    let index = NOTE_NAMES.indexOf(chordBase as NoteName);

    return 36 + index;
}

const getFifth = (chord: string): number => {
    let chordBase = chord.split("^")[0];
    let index = NOTE_NAMES.indexOf(chordBase as NoteName);

    return 43 + index;
}

export const compBassSwingV1 = (chart: Chart): IPart => {

    let music: IMusicBar[] = [];
    chart.bars.forEach(bar => {

        let musicBar: IMusicBar = {};

        bar.chordSegments.forEach(segment => {
            let fullBeatCouplets = segment.durationInSubbeats / 6;

            if (!Number.isInteger(fullBeatCouplets)) {
                musicBar[0] = [
                    {
                        notes: [getBassNote(segment.chord)],
                        durationInSubbeats: segment.durationInSubbeats,
                        velocity: 1
                    }
                ];
            }

            for (let i = 0; i < fullBeatCouplets; i ++) {
                musicBar[segment.subbeatIdx + i * 6] = [
                    {
                        notes: [getBassNote(segment.chord)],
                        durationInSubbeats: 3,
                        velocity: 1
                    }
                ];
                musicBar[segment.subbeatIdx + 3 + i * 6] = [
                    {
                        notes: [getFifth(segment.chord)],
                        durationInSubbeats: 3,
                        velocity: 1
                    }
                ];
            }
        });
        
        music[bar.barIdx] = musicBar;
    }); 

    return {instrument: "doubleBass", music };
};

export default compBassSwingV1;