import { NOTE_NAMES } from "../../../MusicHelper";
import { IChartBar, IMusicBarV2 } from "../../../../types";

const getBassNote = (chord: string): number => {
    let chordBase = chord.split("^")[0];
    let index = NOTE_NAMES.indexOf(chordBase);

    return 36 + index;
}

const getFifth = (chord: string): number => {
    let chordBase = chord.split("^")[0];
    let index = NOTE_NAMES.indexOf(chordBase);

    return 43 + index;
}

export const compBassSwingV1 = (bars: IChartBar[]): IMusicBarV2[] => {

    return bars.map(bar => {

        let musicBar: IMusicBarV2 = {};

        bar.chordSegments.forEach(segment => {
            let fullBeatCouplets = segment.durationInSubbeats / 6;

            if (segment.durationInSubbeats % 6) {
                musicBar[0] = [
                    {
                        notes: [getBassNote(segment.chord)],
                        durationInSubbeats: segment.durationInSubbeats,
                        velocity: 1
                    }
                ];
            }

            for (let i = 0; i < fullBeatCouplets; i ++) {
                musicBar[i * 6] = [
                    {
                        notes: [getBassNote(segment.chord)],
                        durationInSubbeats: 3,
                        velocity: 1
                    }
                ];
                musicBar[3 + i * 6] = [
                    {
                        notes: [getFifth(segment.chord)],
                        durationInSubbeats: 3,
                        velocity: 1
                    }
                ];
            }
        });
        
        return musicBar;
    }); 
};

export default compBassSwingV1;