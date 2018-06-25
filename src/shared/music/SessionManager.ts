import * as Util from "../Util";
import { CompV1 } from "../music/MusicHelper";
import Chart from "../music/Chart";
import { IScoreBar, IChartBar, NoteName, IChordSegment, IKeyStrokeRecord, IMusicIdx } from "../types";
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
    private _userKeyStrokes: IKeyStrokeRecord[];

    private _rangeLength: number;

    private _chorusIdx: number;
    private _barIdx: number;
    private _segmentIdx: number;
    private _subbeatIdx: number;

    private _onUpdate: () => void;
    
    constructor(audioContext: any, fontPlayer: any, chart: Chart, onUpdate: () => void) {
        this._audioContext = audioContext;
        this._fontPlayer = fontPlayer;
        this._chart = chart;
        this._rangeLength = chart.rangeEndIdx - chart.rangeStartIdx + 1;

        this._chorusIdx = -1;
        this._barIdx = chart.rangeEndIdx;
        this._segmentIdx = -1;
        this._subbeatIdx = -1;

        this._startTime = NaN;
        this._userKeyStrokes = [];
        this._onUpdate = onUpdate;
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
        return this.currChartBar.chordSegments[this._segmentIdx];
    }

    get inSession(): boolean {
        return !isNaN(this._startTime);
    }

    get sessionIdx(): IMusicIdx {
        return {
            chorusIdx: this._chorusIdx,
            barIdx: this._barIdx,
            segmentIdx: this._segmentIdx,
            subbeatIdx: this._subbeatIdx
        }
    }

    /**
     * PUBLIC FUNCTIONS
     */

    public start = () => {
        let queueLoop = (timeout = 0, getUpdate = () => true) => {
            setTimeout(() => {
                Util.waitFor(getUpdate, this._TIME_CHECKER_RATE)
                    .then(() => {
                        if (!timeout || this.inSession) {
                            this._stepBySegment();
                            this._queueCurrSegment();
                            let nextQueueTime = this._nextSegmentQueueTime;
                            let nextQueueTimeMinusPrepTime = nextQueueTime - this._PREP_TIME;
                            queueLoop(
                                (nextQueueTime - this._currQueueTime) * this._WAITTIME_FACTOR,
                                () => (this._audioContext.currentTime > nextQueueTimeMinusPrepTime)
                            );
                        }
                    });
            }, timeout);
        };
        queueLoop();
    }

    public stop = () => {
        this._fontPlayer.cancelQueue(this._audioContext);
        this._startTime = NaN;
    }

    public recordUserKeyStroke = (note: number, time: number, velocity: number): IKeyStrokeRecord => {
        let queueTimeBarComparison = (a: { [subbeatIdx: number]: number }, b: { [subbeatIdx: number]: number }) => {
            let aCenter = Math.floor(Util.length(a) / 2);
            let bCenter = Math.floor(Util.length(b) / 2);
            return a[aCenter] - b[bCenter];
        };

        let [barIdx, queueTimeBar] = Util.binarySearch(
            this._queueTimes, 
            { 0: time }, 
            queueTimeBarComparison, 
            this._chart.rangeStartIdx - 1, 
            this._chart.rangeEndIdx + 1
        );
        let [subbeatIdx, closestTime] = Util.binarySearch(
            queueTimeBar, 
            time
        );

        let record = {
            barIdx,
            subbeatIdx,
            precision: time - closestTime,
            note,
            velocity
        }

        this._userKeyStrokes.push(record);
        return record;
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

    private _tick = (noUpdate = false): boolean => {
        let segmentChanged = false;
        this._subbeatIdx = (this._subbeatIdx + 1) % this.currChartBar.durationInSubbeats;

        if (!this._subbeatIdx) {
            this._barIdx = this._chart.rangeStartIdx + (this._barIdx + 1 - this._chart.rangeStartIdx) % this._rangeLength;
            this._segmentIdx = 0;
            segmentChanged = true;

            if (this._barIdx === this._chart.rangeStartIdx) {
                // If the bar index is back at the start of the range...
                // Increment the take index
                this._chorusIdx ++;

                // Refresh the score
                this._score = CompV1(this._chart);

                // Reset the queue times
                this._resetQueueTimes();
            }
        } else {
            // Might as well keep the segment index updated also
            let subbeatSum = 0;
            for (let segIdx = 0; segIdx <= this._segmentIdx; segIdx ++) {
                subbeatSum += this.currChartBar.chordSegments[segIdx].durationInSubbeats;
            }

            if (this._subbeatIdx >= subbeatSum) {
                this._segmentIdx ++;
                segmentChanged = true;
            }
        }

        // noUpdate is false only when _tick is called by _stepBySegment
        if (!noUpdate) {
            this._onUpdate();
        }

        return segmentChanged;
    }

    private _stepBySegment = () => {
        let segmentChanged;
        do { segmentChanged = this._tick(true); }
        while (!segmentChanged)
        this._onUpdate();
    }

    // TODO refactor this bish...
    private _resetQueueTimes = () => {
        // Set the global start time if necessary
        let startTime;
        if (!this.inSession) {
            this._startTime = startTime = this._audioContext.currentTime;
        } else {
            startTime = this._queueTimes[this._chart.rangeEndIdx + 1][0];
        }

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

    private get _currQueueTime(): number {
        return this._queueTimes[this._barIdx][this._subbeatIdx];
    }

    private get _nextSegmentQueueTime(): number {
        // Get the subbeat and bar indeces at the next segment
        let subbeatIdx = (this._subbeatIdx + this.currChordSegment.durationInSubbeats) % this.currChartBar.durationInSubbeats;
        let barIdx = subbeatIdx ? this._barIdx : this._barIdx + 1;
        return this._queueTimes[barIdx][subbeatIdx];
    }

    private get _currScoreBar(): IScoreBar {
        return this._score[this._barIdx];
    }
}

export default SessionManager;