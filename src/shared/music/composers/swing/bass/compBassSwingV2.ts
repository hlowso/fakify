import * as Util from "../../../../Util";
import Chart from "../../../Chart";
import { IPart, IMusicBar, ChordName, NoteName } from "../../../../types";
import { Domain } from "../../../domain/Domain";

/**
 * TRANSLATION OF PYTHON "WALK" ALGORITHM TO JAVASCRIPT
 */

export const compBassSwingV2 = (chart: Chart, prevMusic: IMusicBar[]): IPart => {
    let { chordStretches } = chart;
    
    let music: IMusicBar[] = [];
    let quarterPitches: number[] = [];
    let skipPitches: number[] = [];    

    // Helper functions
    let jumpRandVar = Util.generateCustomRandomVariable([[true, 1], [false, 7]]);
    let beatsSinceJump = 0;        
    let decideToJump = () => {
        if (beatsSinceJump < 2) {
            return false;
        }
        return jumpRandVar();
    }

    // TODO: come up with a better way to get the first not from prevMusic array
    let initialTonicNoteName = (chart.segmentAtIdx({ barIdx: 0, subbeatIdx: 0}).chordName as ChordName)[0];
    let initialTonicBasePitch = Domain.getLowestPitch(initialTonicNoteName as NoteName);
    let pitch = Domain.getPitchInstance(36, initialTonicBasePitch);
    quarterPitches.push(pitch);

    chordStretches.forEach((stretch, stretchIdx) => {
        let { chordName, key, durationInSubbeats } = stretch;

        // Because the feel is swing, we know that the duration
        // in subbeats of any stretch will always be 
        // divisible by 3
        let durationInBeats = durationInSubbeats / 3;

        

        for (let beat = 0; beat < durationInBeats; beat ++) {

            // Handle chord transition
            if (beat === durationInBeats - 1) {

            }

            // Allow for the possibility of "jumps"
            else if (decideToJump()) {

            }

            // Otherwise we step, either by one scale note or one chord note
            else {

            }
        }
    });

    return {
        instrument: "doubleBass",
        music
    }
}