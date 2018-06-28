import Domain from "../../Domain";
import { Difficulty, IMusicBarV2, IStroke, IPart } from "../../../types";
import Chart from "../../Chart";
import * as MusicHelper from "../../MusicHelper";

// We assume that the chart's time signature has a base of 4,
// and that the subdivision is 3 subbeats per beat
export const generateSwingExerciseV0 = (chart: Chart, instrument: string, difficulty: Difficulty): IPart => {
    switch (difficulty) {
        default:
        case Difficulty.Easy:
        case Difficulty.Hard:
            let music: IMusicBarV2[] = [];
            chart.barsInRange.forEach(bar => {

                let musicBar: IMusicBarV2 = {};

                for (let beatIdx = 0; beatIdx < bar.timeSignature[1]; beatIdx ++) {
                    let subbeatIdx = 3 * beatIdx; 
                    let currKey = chart.keyAtIdx({ barIdx: bar.barIdx, subbeatIdx });
                    let scale = new Domain(
                        MusicHelper.keyTo7Notes(currKey)
                    );

                    let stroke: IStroke = {
                        durationInSubbeats: 3,
                        notes: [scale.getRandomNote(60, 78)],
                        velocity: 1
                    }

                    // Add the stroke to the music bar at the current
                    // quarter note
                    musicBar[subbeatIdx] = [stroke];
                }

                music[bar.barIdx] = musicBar;
            });

            return {
                instrument,
                music
            }
    }
}