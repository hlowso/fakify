import * as Util from "../Util";
import { CompV1 } from "../music/MusicHelper";
import Chart from "../music/Chart";
import { IScoreBar, IChartBar, NoteName, IChordSegment } from "../types";
import soundfonts from "./soundfontsIndex";

class SessionManager {
    private _WAITTIME_FACTOR = (3 / 4) * 1000;
    private _PREP_TIME = 0.02;
    private _TIME_CHECKER_RATE = 5;

    private _audioContext: any;
    private _fontPlayer: any;
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
        this._chart = chart;
        this._rangeLength = chart.rangeEndIdx - chart.rangeStartIdx + 1;

        this._barIdx = chart.rangeEndIdx;
        this._subbeatIdx = -1;

        this._startTime = NaN;
    }

    /**
     * PUBLIC GETTERS
     */

    get startTime(): number {
        return this._startTime;
    }

    get currKey(): NoteName {
        return this.currChordSegment.key;
    }

    get subbeatDuration(): number {
        let { tempo, bars } = this._chart;
        let { durationInSubbeats, timeSignature } = bars[0];

        // Calculate the subbeat duration based on the first bar of 
        // music. It will be the same all troughout the score
        return 60 / ( durationInSubbeats * (tempo[0] / ( timeSignature[0] * ( tempo[1] / timeSignature[1] ))));
    }

    get currChartBar(): IChartBar {
        return this._chart.bars[this._barIdx];
    }

    get currChordSegment(): IChordSegment {
        let currBar = this.currChartBar;
        let segIdx = -1;
        let subbeatCount = 0;
        let chordSegment;
        
        do {
            chordSegment = currBar.chordSegments[++segIdx];
            subbeatCount += chordSegment.durationInSubbeats;
        } while (subbeatCount <= this._subbeatIdx)

        return chordSegment;
    }

    /**
     * PUBLIC FUNCTIONS
     */

    public start = () => {
        this._tick();
        let queueLoop = (prevQueueTime: number) => {
            let queueTime = this._queueTimes[this._barIdx][this._subbeatIdx];
            let getUpdate = () => this._audioContext.currentTime > queueTime;
            let waitTime = (queueTime - prevQueueTime) * this._WAITTIME_FACTOR;

            setTimeout(() => {
                Util.waitFor(getUpdate, this._TIME_CHECKER_RATE)
                    .then(() => {
                        if (!isNaN(this._startTime)) {
                            this._queueCurrSegment();
                            this._stepBySegment();
                            queueLoop(queueTime);
                        }
                    });
            }, waitTime);
        };
        queueLoop(this._startTime);
    }

    public stop = () => {
        this._fontPlayer.cancelQueue(this._audioContext);
        this._startTime = NaN;
    }

    /**
     * PRIVATE FUNCTIONS
     */

    private _queueCurrSegment = () => {
        let scoreBar = this._currScoreBar;
        let currSegment = this.currChordSegment;
        let subbeatDuration = this.subbeatDuration;
        let { subbeatIdx, durationInSubbeats } = currSegment;
        let startIdx = subbeatIdx;
        let scoreIndeces = Object.keys(scoreBar).map(s => parseInt(s, 10));

        for (let scoreIdx of scoreIndeces) {
            if (scoreIdx === startIdx + durationInSubbeats) {
                break;
            }
            let parts = scoreBar[scoreIdx];
            for (let instrument in parts) {
                let strokes = parts[instrument];
                if (strokes) {
                    strokes.forEach(stroke => {
                        stroke.notes.forEach(note => {
                            this._fontPlayer.queueWaveTable(
                                this._audioContext, 
                                this._audioContext.destination, 
                                window[soundfonts[instrument].variable], 
                                this._queueTimes[this._barIdx][scoreIdx], 
                                note,
                                subbeatDuration * stroke.durationInSubbeats,
                                stroke.velocity
                            );
                        });
                    });
                }
            }
        }
    }

    private _tick = () => {
        this._subbeatIdx = (this._subbeatIdx + 1) % this.currChartBar.durationInSubbeats;
        if (!this._subbeatIdx) {
            this._barIdx = this._chart.rangeStartIdx + (this._barIdx + 1 - this._chart.rangeStartIdx) % this._rangeLength;
            if (this._barIdx === this._chart.rangeStartIdx) {
                // If the bar index is back at the start of the range,
                // refresh the score
                this._score = CompV1(this._chart);

                // Set the global start time if necessary
                let startTime;
                if (isNaN(this._startTime)) {
                    this._startTime = startTime = this._audioContext.currentTime + this._PREP_TIME;
                } else {
                    startTime = this._queueTimes[this._chart.rangeEndIdx + 1][0];
                }
                
                // Reset the queue times
                this._resetQueueTimes(startTime);
            }
        }
    }

    private _stepBySegment = () => {
        let currSegment = this.currChordSegment;
        let startIdx = currSegment.subbeatIdx
        for (
            let subbeatIdx = startIdx; 
            subbeatIdx < startIdx + currSegment.durationInSubbeats; 
            subbeatIdx ++
        ) {
            this._tick();
        }
    }

    // TODO refactor this bish...
    private _resetQueueTimes = (startTime: number) => {
        let _subbeatDuration = this.subbeatDuration;
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

    /**
     * PRIVATE GETTERS
     */

    private get _currScoreBar(): IScoreBar {
        return this._score[this._barIdx];
    }
}

export default SessionManager;