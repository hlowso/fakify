import soundfonts from "../../../soundfontsIndex";
import { IMusicBar, IPart } from "../../../../types";
import Chart from "../../../Chart";

export const compDrumsSwingV1 = (chart: Chart): [IPart, IPart] => {

    let { rideCymbal, shutHiHat } = soundfonts;
    let rideCymbalBars: IMusicBar[] = [];
    let shutHiHatBars: IMusicBar[] = [];

    chart.bars.forEach(bar => {
        let rideCymbalBar: IMusicBar = {};
        let shutHiHatBar: IMusicBar = {};

        bar.chordSegments.forEach(segment => {
            let fullBeatCouplets = segment.durationInSubbeats / 6;
            
            if (!Number.isInteger(fullBeatCouplets)) {
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
                    rideCymbalBar[segment.subbeatIdx + i * 6] = [
                        {
                            notes: [rideCymbal.pitch || 0], 
                            durationInSubbeats: 3, 
                            velocity: 1
                        }
                    ];
                    rideCymbalBar[segment.subbeatIdx + 3 + i * 6] = [
                        { 
                            notes: [rideCymbal.pitch || 0], 
                            durationInSubbeats: 2, 
                            velocity: 1
                        }
                    ];
                    rideCymbalBar[segment.subbeatIdx + 5 + i * 6] = [
                        {
                            notes: [rideCymbal.pitch || 0], 
                            durationInSubbeats: 1, 
                            velocity: 0.6
                        }
                    ];


                    shutHiHatBar[segment.subbeatIdx + i * 6 + 3] = [
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