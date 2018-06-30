import soundfonts from "../../../soundfontsIndex";
import { IChartBar, IMusicBarV2, IPart } from "../../../../types";

export const compDrumsSwingV1 = (bars: IChartBar[]): [IPart, IPart] => {

    let { rideCymbal, shutHiHat } = soundfonts;
    let rideCymbalBars: IMusicBarV2[] = [];
    let shutHiHatBars: IMusicBarV2[] = [];

    bars.forEach(bar => {
        let rideCymbalBar: IMusicBarV2 = {};
        let shutHiHatBar: IMusicBarV2 = {};

        bar.chordSegments.forEach(segment => {
            let fullBeatCouplets = segment.durationInSubbeats / 6;
            
            if (segment.durationInSubbeats % 6) {
                rideCymbalBar[segment.subbeatIdx] = [
                    {
                        notes: [rideCymbal.pitch || 0],
                        durationInSubbeats: segment.durationInSubbeats,
                        velocity: 1
                    }
                ];
            } else {
                for (let i = 0; i < fullBeatCouplets; i ++) {
                    // ding, ding-gah
                    rideCymbalBar[i * 6] = [
                        {
                            notes: [rideCymbal.pitch || 0], 
                            durationInSubbeats: 3, 
                            velocity: 1
                        }
                    ];
                    rideCymbalBar[3 + i * 6] = [
                        { 
                            notes: [rideCymbal.pitch || 0], 
                            durationInSubbeats: 2, 
                            velocity: 1
                        }
                    ];
                    rideCymbalBar[5 + i * 6] = [
                        {
                            notes: [rideCymbal.pitch || 0], 
                            durationInSubbeats: 1, 
                            velocity: 0.6
                        }
                    ];


                    shutHiHatBar[i * 6 + 3] = [
                        {
                            notes: [shutHiHat.pitch || 0], 
                            durationInSubbeats: 3, 
                            velocity: 1
                        }
                    ];
                }
            }
        });

        rideCymbalBars[bar.barIdx] = rideCymbalBar;
        shutHiHatBars[bar.barIdx] = shutHiHatBar;
    }); 

    return [
        {
            instrument: "rideCymbal",
            music: rideCymbalBars
        },
        {
            instrument: "shutHiHat",
            music: shutHiHatBars
        }
    ];
};

export default compDrumsSwingV1;