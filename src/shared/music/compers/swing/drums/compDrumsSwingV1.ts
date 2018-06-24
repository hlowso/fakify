import soundfonts from "../../../soundfontsIndex";
import { IChartBar, IMusicBarV2 } from "../../../../types";

export const compDrumsSwingV1 = (bars: IChartBar[]): Array<{ rideCymbal: IMusicBarV2; shutHiHat: IMusicBarV2 }> => {

    let { rideCymbal, shutHiHat } = soundfonts;

    return bars.map(bar => {

        let musicBarPair: { 
            rideCymbal: IMusicBarV2;
            shutHiHat: IMusicBarV2;
        } = {
            rideCymbal: {},
            shutHiHat: {}
        };

        bar.chordSegments.forEach(segment => {
            let fullBeatCouplets = segment.durationInSubbeats / 6;
            
            if (segment.durationInSubbeats % 6) {
                musicBarPair.rideCymbal[segment.subbeatIdx] = [
                    {
                        notes: [rideCymbal.pitch || 0],
                        durationInSubbeats: segment.durationInSubbeats,
                        velocity: 1
                    }
                ];
            } else {
                for (let i = 0; i < fullBeatCouplets; i ++) {
                    // ding, ding-gah
                    musicBarPair.rideCymbal[i * 6] = [
                        {
                            notes: [rideCymbal.pitch || 0], 
                            durationInSubbeats: 3, 
                            velocity: 1
                        }
                    ];
                    musicBarPair.rideCymbal[3 + i * 6] = [
                        { 
                            notes: [rideCymbal.pitch || 0], 
                            durationInSubbeats: 2, 
                            velocity: 1
                        }
                    ];
                    musicBarPair.rideCymbal[5 + i * 6] = [
                        {
                            notes: [rideCymbal.pitch || 0], 
                            durationInSubbeats: 1, 
                            velocity: 0.6
                        }
                    ];


                    musicBarPair.shutHiHat[i * 6 + 3] = [
                        {
                            notes: [shutHiHat.pitch || 0], 
                            durationInSubbeats: 3, 
                            velocity: 1
                        }
                    ];
                }
            }
        });

        return musicBarPair;
    }); 
};

export default compDrumsSwingV1;