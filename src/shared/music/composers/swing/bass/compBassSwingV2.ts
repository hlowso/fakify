import * as Util from "../../../../Util";
import Chart from "../../../Chart";
import { IPart, IMusicBar, ChordName, NoteName, IChordStretch } from "../../../../types";
import { Domain } from "../../../domain/Domain";
import { ChordClass } from "../../../domain/ChordClass";
import { ScaleClass } from "../../../domain/ScaleClass";
import { Note } from "../../../domain/Note";

/**
 * TRANSLATION OF PYTHON "WALK" ALGORITHM TO JAVASCRIPT
 */

interface IOddsSet {
    [event: string]: [boolean, number][]
};

const Odds: IOddsSet = {
    Jump:             [ [true, 1], [false, 7] ],
    Skip:             [ [true, 1], [false, 3] ],
    ChangeGait:       [ [true, 1], [false, 3] ],
    Turn:             [ [true, 1], [false, 9] ],
    ChromStep:        [ [true, 3], [false, 1] ],
    FavorTonic:       [ [true, 2], [false, 1] ],
    FavorOctaveSkip:  [ [true, 3], [false, 1] ]
}

const BASS_FLOOR = 12;
const BASS_CEILING = 60;

export const compBassSwingV2 = (chart: Chart, prevMusic: IMusicBar[]): IPart => {
    let { chordStretches } = chart;
    
    let music: IMusicBar[] = [];
    let quarterPitches: number[] = [];
    let skipPitches: number[] = [];    

    let jumpRandVar = Util.generateCustomRandomVariable(Odds.Jump);
    let beatsSinceJump = 0;        
    let decideToJump = () => {
        if (beatsSinceJump < 2) {
            return false;
        }
        return jumpRandVar();
    }

    let favorTonicRandVar = Util.generateCustomRandomVariable(Odds.FavorTonic); 
    let changeGaitRandVar = Util.generateCustomRandomVariable(Odds.ChangeGait);\

    let maybeChangeGait = () => {
        if (changeGaitRandVar()) {
            striding = !striding;
        }
    }

    // The direction is always either 1 (ascending)
    // or -1 (descending)
    let direction = 1;
    let turnRandVar = Util.generateCustomRandomVariable(Odds.Turn);
    let updateDirection = (jumping = false) => {
        let threshold = jumping ? 12 : 7;

        if (pitch - BASS_FLOOR <= threshold) {
            direction = 1;
        } else if (BASS_CEILING - pitch <= threshold) {
            direction = -1
        } else {
            direction *= turnRandVar() ? -1 : 1;
        }
    }

    let skipRandVar = Util.generateCustomRandomVariable(Odds.Skip);
    let favorOctaveSkipRandVar = Util.generateCustomRandomVariable(Odds.FavorOctaveSkip);
    let maybeSkip = (transitioning = false) => {
        if (skipRandVar()) {
            let chord = (
                transitioning
                    ? nextChord
                    : currChord
            );

            let skipPitch = (
                favorTonicRandVar()
                    ? chord.getTonicPitch(pitch, false)
                    : chord.getFifthPitch(pitch, false)
            );

            if (skipPitch === pitch - 12 && !favorOctaveSkipRandVar()) {
                skipPitch = pitch;
            }

            // We may assume that the quarter pitches already has at least 
            // 1 element by the time maybeSkip is called for the first time
            let idx = quarterPitches.length - 1;
            skipPitches[idx] = skipPitch;
        }
    }

    let striding = false;

    // WIP
    let step = () => {
        let nextNote: Note;
        if (striding) {
            let pos = currChord.pitchToPosition(pitch);  
            if (pos === 1 && direction === -1) {
                // TODO
            } else if (pos === 7 && direction === 1) {
                // TODO
            } else {
                nextNote = currChord.getNextNoteByPosition(pitch, direction === 1) as Note;
                pitch = nextNote.pitch;
            }
        } else {
            nextNote = currScale.getNextNoteByPosition(pitch, direction === 1) as Note;
            pitch = nextNote.pitch;
        }

        quarterPitches.push(pitch);
        beatsSinceJump ++;

        maybeSkip();

        let currScalePos = currScale.pitchToPosition(pitch);
        if (currScalePos === 1 || currScalePos === 5) {
            maybeChangeGait();
        }
    }

    let change = (quickChange: boolean, nextStretch: IChordStretch) => {

        updateDirection();

        let nextChord = new ChordClass(nextStretch.chordName as ChordName);

        // Handle a "quick" transition, which means that the chord stretch
        // being left was only 1 beat long
        if (quickChange) {
            pitch = (
                favorTonicRandVar()
                    ? nextChord.getTonicPitch(pitch, direction === 1)
                    : nextChord.getFifthPitch(pitch, direction === 1)
            );

            quarterPitches.push(pitch);
            beatsSinceJump ++;

            maybeSkip(true);
        }
        
        // Otherwise 
        else {
            let didChromStep = false;
            let closestNextTonic = nextChord.getTonicPitch(pitch, direction === 1);
            let closestNextFifth = nextChord.getFifthPitch(pitch, direction === 1);

            if (Math.abs(closestNextTonic - pitch) === 2) {
                didChromStep = chromaticTwoStep(closestNextTonic);
                beatsSinceJump += 2;
            } else if (Math.abs(closestNextFifth - pitch) === 2) {
                didChromStep = chromaticTwoStep(closestNextFifth);
                beatsSinceJump += 2;
            }

            if (!didChromStep) {
                step();
                change(true, nextStretch);
            }
        }
    }

    let currChord: ChordClass;
    let currScale: ScaleClass;
    let nextChord: ChordClass;

    // TODO: come up with a better way to get the first not from prevMusic array
    let initialTonicNoteName = (chart.segmentAtIdx({ barIdx: 0, subbeatIdx: 0}).chordName as ChordName)[0];
    let initialTonicBasePitch = Domain.getLowestPitch(initialTonicNoteName as NoteName);
    let pitch = Domain.getPitchInstance(36, initialTonicBasePitch);
    quarterPitches.push(pitch);

    chordStretches.forEach((stretch, stretchIdx) => {
        let { chordName, key, durationInSubbeats } = stretch;
        chordName = chordName as ChordName;

        // Because the feel is swing, we know that the duration
        // in subbeats of any stretch will always be 
        // divisible by 3
        let durationInBeats = durationInSubbeats / 3;
        
        let currChord = new ChordClass(chordName);
        let currScale = new ScaleClass(key);

        for (let beat = 1; beat < durationInBeats; beat ++) {

            // Handle chord transition
            if (beat === durationInBeats - 1) {
                let nextStretch = chordStretches[Util.mod(stretchIdx + 1, chordStretches.length)];
                change(beat === 0, nextStretch);
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