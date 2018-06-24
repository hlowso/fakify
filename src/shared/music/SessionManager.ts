import uuid from "uuid";

import * as Util from "../Util";
import { CompV1 } from "../music/MusicHelper";
import Chart from "../music/Chart";
import { IScoreBar, NoteName } from "../types";
import soundfonts from "./soundfontsIndex";

class SessionManager {
    private _WAITTIME_FRACTION = 9 / 10;
    private _PREP_TIME = 0.02;
    private _TIME_CHECKER_RATE = 5;

    private _audioContext: any;
    private _fontPlayer: any;
    private _sessionId: string;
    private _chart: Chart;
    private _score: IScoreBar[];
    private _queueTimes: { [barIdx: number]: { [subbeatIdx: number]: number }};
    private _startTime: number;

    private _rangeLength: number;

    private _barIdx: number;
    private _subbeatIdx: number;
    
    constructor(audioContext: any, fontPlayer: any, chart: Chart) {
        this._audioContext = audioContext;
        this._fontPlayer = fontPlayer;
        this._sessionId = uuid();
        this._chart = chart;
        this._rangeLength = chart.rangeEndIdx - chart.rangeStartIdx + 1;

        this._barIdx = chart.rangeEndIdx;
        this._subbeatIdx = -1;

        this._startTime = NaN;
    }

    /**
     * GETTERS
     */

    get sessionId(): string {
        return this._sessionId;
    }

    get startTime(): number {
        return this._startTime;
    }

    get currentKey(): NoteName {
        return "C"; // this._chart.bars[this._barIdx].chordSegments[]
    }

    // public get currentKey(): string {
    //     return this._currentChartChord.key;
    // }


    // public get bar(): IMusicBar {
    //     return this._currentMusicBar;
    // }

    // public get sessionPassage(): ISessionPassage {
    //     let { tempo } = this._chart;
    //     let { durationInSubbeats, timeSignature } = this._currentMusicBar;
    //     let subbeatDuration = ;

    //     let { currentTime } = this._audioContext;
    //     let subbeatOffsetToQueueTime = [];

    //     for (
    //         let subbeatOffset = 0; 
    //         subbeatOffset < this._currentPassage.durationInSubbeats; 
    //         subbeatOffset++
    //     ) {
    //         subbeatOffsetToQueueTime.push(currentTime + subbeatDuration * subbeatOffset);
    //     }

    //     return { 
    //         sessionId: this._sessionId, 
    //         duration: this._currentPassage.durationInSubbeats * subbeatDuration,
    //         subbeatDuration, 
    //         subbeatOffsetToQueueTime,
    //         chartIndex: this._getMusicIdx(),
    //         parts: this._currentPassage.parts
    //     };
    // }

    public start = () => {
        let _subbeatDuration = this._subbeatDuration;
        let queueLoop = () => {
            setTimeout(() => {
                this._tick();
                let queueTime = this._queueTimes[this._barIdx][this._subbeatIdx];
                let queueTimeMinusPrepTime = queueTime - this._PREP_TIME;
                let getUpdate = () => this._audioContext.currentTime > queueTimeMinusPrepTime;

                Util.waitFor(getUpdate, this._TIME_CHECKER_RATE)
                    .then(() => {
                        if (!isNaN(this._startTime)) {
                            let scoreBar = this._currScoreBar;
                            for (let instrument in scoreBar) {
                                let musicBar = scoreBar[instrument];
                                let strokes = musicBar[this._subbeatIdx];
                                if (strokes) {
                                    strokes.forEach(stroke => {
                                        stroke.notes.forEach(note => {
                                            this._fontPlayer.queueWaveTable(
                                                this._audioContext, 
                                                this._audioContext.destination, 
                                                window[soundfonts[instrument].variable], 
                                                queueTime, 
                                                note,
                                                _subbeatDuration * stroke.durationInSubbeats,
                                                stroke.velocity
                                            );
                                        });
                                    });
                                }
                            }
                            queueLoop();
                        }
                    });
            }, (_subbeatDuration * this._WAITTIME_FRACTION) * 1000);
        };
        queueLoop();
    }

    public stop = () => {
        this._fontPlayer.cancelQueue(this._audioContext);
        this._startTime = NaN;
    }

    /**
     * PRIVATE FUNCTIONS
     */

    private _tick = () => {
        this._subbeatIdx = (this._subbeatIdx + 1) % this._chart.bars[this._barIdx].durationInSubbeats;; 
        if (!this._subbeatIdx) {
            this._barIdx = this._chart.rangeStartIdx + (this._barIdx + 1 - this._chart.rangeStartIdx) % this._rangeLength;
            if (this._barIdx === this._chart.rangeStartIdx) {
                // If the bar index is back at the start of the range,
                // we refresh the score
                this._score = CompV1(this._chart);

                // ... and we reset the queue times
                let startTime;
                if (isNaN(this._startTime)) {
                    this._startTime = startTime = this._audioContext.currentTime + 1;
                } else {
                    startTime = this._queueTimes[this._chart.rangeEndIdx + 1][0];
                }
                
                this._resetQueueTimes(startTime);
            }
        }
    }

    private _resetQueueTimes = (startTime: number) => {
        let _subbeatDuration = this._subbeatDuration;
        let durationOfLastBarInRange = this._chart.lastBarInRange.durationInSubbeats;
        let durationOfFirstBarInRange = this._chart.firstBarInRange.durationInSubbeats;
        this._queueTimes = {};

        // Start with the last bar of the chart (for handling user spills)
        let time = startTime - _subbeatDuration * durationOfLastBarInRange;
        this._queueTimes[this._chart.rangeStartIdx - 1] = {};
        
        for (
            let subbeatIdx = 0; 
            subbeatIdx < durationOfLastBarInRange; 
            subbeatIdx ++
        ) {
            this._queueTimes[this._chart.rangeStartIdx - 1][subbeatIdx] = time;
            time += _subbeatDuration;
        }

        // Now loop through all the bars in the range
        this._chart.forEachBarInRange((bar, idx) => {
            let queueTimeBar: { [subbeatIdx: number]: number } = {};
            for (let subbeatIdx = 0; subbeatIdx < bar.durationInSubbeats; subbeatIdx ++) {
                queueTimeBar[subbeatIdx] = time;
                time += _subbeatDuration;
            }
            this._queueTimes[idx] = queueTimeBar;
        });

        // And end with the next bar after the end of the range
        // (again for handling user spills)
        this._queueTimes[this._chart.rangeEndIdx + 1] = {};

        for (
            let subbeatIdx = 0; 
            subbeatIdx < durationOfFirstBarInRange; 
            subbeatIdx ++
        ) {
            this._queueTimes[this._chart.rangeEndIdx + 1][subbeatIdx] = time;
            time += _subbeatDuration;
        }
    }

    private get _subbeatDuration(): number {
        let { tempo, bars } = this._chart;
        let { durationInSubbeats, timeSignature } = bars[0];
        return 60 / ( durationInSubbeats * (tempo[0] / ( timeSignature[0] * ( tempo[1] / timeSignature[1] ))));
    }

    private get _currScoreBar(): IScoreBar {
        return this._score[this._barIdx];
    }

    // private _moveToIdx = () => {
    //     if (this._barIdx === this._chart.rangeStartIdx) {
    //         this._take = CompV1(this._chart);
    //     }

    //     this._currentChartBar = this._chart.barsV1[this._barIdx];
    //     this._currentChartChord = this._currentChartBar.chordEnvelopes[this._chordIdx];

    //     this._currentMusicBar = this._take[this._barIdx];
    //     this._currentPassage = this._currentMusicBar.chordPassages[this._chordIdx];
    // }
    
}

export default SessionManager;