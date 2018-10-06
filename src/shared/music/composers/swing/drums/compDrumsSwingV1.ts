import soundfonts from "../../../soundfontsIndex";
import { IMusicBar, IPart } from "../../../../types";
import Chart from "../../../Chart";

export const compDrumsSwingV1 = (chart: Chart): [IPart, IPart] => {

    let { rideCymbal, shutHiHat } = soundfonts;
    let rideCymbalBars: IMusicBar[] = [];
    let shutHiHatBars: IMusicBar[] = [];

    let addDingToBar = (startSubbeatIdx: number, rideCymbalBar: IMusicBar) => {
        rideCymbalBar[startSubbeatIdx] = [
            {
                notes: [rideCymbal.pitch || 0], 
                durationInSubbeats: 3, 
                velocity: 1
            }
        ];
    }

    let addDingGahToBar = (startSubbeatIdx: number, rideCymbalBar: IMusicBar) => {
        rideCymbalBar[startSubbeatIdx] = [
            {
                notes: [rideCymbal.pitch || 0], 
                durationInSubbeats: 2, 
                velocity: 1
            }
        ];
        rideCymbalBar[startSubbeatIdx + 2] = [
            { 
                notes: [rideCymbal.pitch || 0], 
                durationInSubbeats: 1, 
                velocity: 0.6
            }
        ];
    }

    let addShutHiHatToBar = (startSubbeatIdx: number, shutHiHatBar: IMusicBar) => {
        shutHiHatBar[startSubbeatIdx] = [
            {
                notes: [shutHiHat.pitch || 0], 
                durationInSubbeats: 3, 
                velocity: 1
            }
        ];
    }

    chart.forEachBarInRange(bar => {
        let rideCymbalBar: IMusicBar = {};
        let shutHiHatBar: IMusicBar = {};

        bar.chordSegments.forEach(segment => {
            let fullBeats = (segment.durationInSubbeats as number) / 3;  
            
            for (let i = 0; i < fullBeats; i ++) {
                let currSubbeatIdx = (segment.subbeatIdx as number) + i * 3;
                if (i % 2 === 0) {
                    addDingToBar(currSubbeatIdx, rideCymbalBar);
                } else {
                    addDingGahToBar(currSubbeatIdx, rideCymbalBar);
                    addShutHiHatToBar(currSubbeatIdx, shutHiHatBar);
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