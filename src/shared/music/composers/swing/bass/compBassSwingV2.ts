import * as Util from "../../../../Util";
import Chart from "../../../Chart";
import { IPart, IMusicBar, ChordName, NoteName } from "../../../../types";
import { Domain } from "../../../domain/Domain";

/**
 * TRANSLATION OF PYTHON "WALK" ALGORITHM TO JAVASCRIPT
 */

interface IOddsSet {
    [event: string]: [boolean, number][]
};

const odds: IOddsSet = {
    jump:             [ [true, 1], [false, 7] ],
    skip:             [ [true, 1], [false, 3] ],
    changeGait:       [ [true, 1], [false, 3] ],
    turn:             [ [true, 1], [false, 9] ],
    chromStep:        [ [true, 3], [false, 1] ],
    favorTonic:       [ [true, 2], [false, 1] ],
    favorOctaveSkip:  [ [true, 3], [false, 1] ]
}

const BASS_FLOOR = 12;
const BASS_CEILING = 60;

export const compBassSwingV2 = (chart: Chart, prevMusic: IMusicBar[]): IPart => {
    let { chordStretches } = chart;
    
    let music: IMusicBar[] = [];
    let quarterPitches: number[] = [];
    let skipPitches: number[] = [];    

    // Helper functions
    let jumpRandVar = Util.generateCustomRandomVariable(odds.jump);
    let beatsSinceJump = 0;        
    let decideToJump = () => {
        if (beatsSinceJump < 2) {
            return false;
        }
        return jumpRandVar();
    }

    let favorTonicRandVar = Util.generateCustomRandomVariable(odds.favorTonic); 

    // The direction is always either 1 (ascending)
    // or -1 (descending)
    let direction = 1;
    let turnRandVar = Util.generateCustomRandomVariable(odds.turn);
    let updateDirection = (jumping = false) => {
        let threshold = jumping ? 12 : 7;

        if (pitch - BASS_FLOOR <= threshold) {
            direction = 1;
        } else if (BASS_CEILING - pitch <= threshold) {
            direction = -1
        } else {
            direction *= turnRandVar() ? -1 : 1;
        }

        return direction;
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

                // Handle a "quick" transition, which means that the chord stretch
                // being left was only 1 beat long
                if (beat === 0) {

                }
                
                // Otherwise 
                else {

                }
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