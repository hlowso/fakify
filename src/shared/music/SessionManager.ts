import * as Util from "../Util";
import * as MusicHelper from "../music/MusicHelper";
import Chart from "../music/Chart";
import Score from "../music/Score";
import { IScoreBar, IChartBar, NoteName, IChordSegment, IKeyStrokeRecord, IMusicIdx, ISubbeatTimeMap, IImprovScore, IListeningScore, IPart, IStroke } from "../types";
import soundfonts from "./soundfontsIndex";

export class SessionManager {
    // The higher the index, the harder it is
    // for the user to get a high precision score
    protected _PRECISION_INDEX = 6;

    protected _audioContext: any;
    protected _chart: Chart;
    protected _score: Score;
    protected _queueTimes: ISubbeatTimeMap;
    protected _startTime = NaN;
    protected _userKeyStrokes: IKeyStrokeRecord[] = [];
    protected _rangeLength: number;
    protected _chorusIdx = -1;
    protected _barIdx: number;
    protected _segmentIdx = -1;
    protected _subbeatIdx = -1;

    private _WAITTIME_FACTOR = (3 / 4) * 1000;
    private _PREP_TIME = 0.02;
    private _TIME_CHECKER_RATE = 5;
    private _fontPlayer: any;
    private _onUpdate: () => void;

    constructor(audioContext: any, fontPlayer: any, chart: Chart, onUpdate: () => void) {
        this._audioContext = audioContext;
        this._fontPlayer = fontPlayer;
        this._chart = chart;
        this._rangeLength = chart.rangeEndIdx - chart.rangeStartIdx + 1;

        this._barIdx = chart.rangeEndIdx;
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
        this._onUpdate();
    }

    // Had to be converted from property (arrow function) to function 
    // in order that the sub classes could make use of it. Weird.
    public recordUserKeyStroke(note: number, time: number, velocity: number): IKeyStrokeRecord {
        let [musicIdx, closestTime] = Util.getClosestQueueTime(this._queueTimes, time);
        musicIdx.chorusIdx = this._chorusIdx;
        musicIdx.segmentIdx = this._segmentIdx;

        let record = {
            musicIdx,
            note,
            velocity,
            inKey: MusicHelper.noteIsInKey(note, this.currKey),
            precision: time - closestTime
        }

        this._userKeyStrokes.push(record);
        return record;
    }

    /**
     * PROTECTED FUNCTIONS
     */

    protected _compileMusic() {
        return MusicHelper.CompV1(this._chart);
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
                this._score = this._compileMusic(); 

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
        return this._score.barAt(this._barIdx);
    }

    protected get _precisionThreshold(): number {
        return this.subbeatDuration / this._PRECISION_INDEX;
    }
}

export class ImprovSessionManager extends SessionManager {
    private _improveScore: IImprovScore;

    constructor(audioContext: any, fontPlayer: any, chart: Chart, onUpdate: () => void) {
        super(audioContext, fontPlayer, chart, onUpdate);
        this._improveScore = {
            notesPlayed: 0,
            notesInTime: 0,
            notesInKey: 0
        };
    }

    public recordUserKeyStroke(note: number, time: number, velocity: number): IKeyStrokeRecord {
        let record = super.recordUserKeyStroke(note, time, velocity);
        this._improveScore.notesPlayed ++;

        if (Math.abs(record.precision) <= this._precisionThreshold) {
            this._improveScore.notesInTime ++;
        }
        if (record.inKey) {
            this._improveScore.notesInKey ++;
        }

        return record;
    };

    get currImprovScore(): IImprovScore {
        return this._improveScore;
    }
}

export class ListeningSessionManager extends SessionManager {
    private _exercise: IPart;
    private _previousChorusExerciseNotesPassed = 0;
    private _userPlaying: boolean;
    private _listeningScore: IListeningScore;

    constructor(audioContext: any, fontPlayer: any, chart: Chart, onUpdate: () => void) {
        super(audioContext, fontPlayer, chart, onUpdate);
        this._userPlaying = true;
        this._listeningScore = {
            correctNotesCount: 0,
            percentCorrect: NaN,
            incorrectNotes: []
        };
    }

    public recordUserKeyStroke(note: number, time: number, velocity: number): IKeyStrokeRecord {
        let record = super.recordUserKeyStroke(note, time, velocity);

        if (this._userPlaying) {
            let idx = record.musicIdx;
            let exerciseStroke: IStroke | undefined;

            let exerciseBar = this._exercise.music[idx.barIdx];
            let exerciseSubbeat: IStroke[];
            let strokeExists = true;

            // Determine whether or not there was an exercise
            // note played at the music index of the record
            if (exerciseBar) {
                exerciseSubbeat = exerciseBar[idx.subbeatIdx];
                if (exerciseSubbeat) {
                    exerciseStroke = exerciseSubbeat[0];
                } else {
                    strokeExists = false;
                }
            } else {
                strokeExists = false;
            }

            // If there wasn't an exercise note...
            if (!strokeExists) {
                // Add an incorrect note to the report
                this._listeningScore.incorrectNotes.push({
                    musicIdx: idx,
                    played: note,
                    correct: ""
                });
            } else {
                // If the note played was correct...
                if (
                    exerciseStroke &&
                    exerciseStroke.notes[0] === note &&
                    Math.abs(record.precision) <= this._precisionThreshold
                ) {
                    // Correct notes played goes up by 1
                    this._listeningScore.correctNotesCount ++;
                // If an incorrect note was played when 
                // an exercise note should have been played
                } else {
                    // Add the incorrect note to the report
                    this._listeningScore.incorrectNotes.push({
                        musicIdx: idx,
                        played: note,
                        correct: (exerciseStroke as IStroke).notes[0]
                    });
                }

                // Whether or not the note played was correct,
                // update the percentage of notes played correctly
                this._listeningScore.percentCorrect = Number(
                    ((this._listeningScore.correctNotesCount / (this._chorusExerciseNotesPassed + this._previousChorusExerciseNotesPassed)) * 100).toFixed(1)
                );
            }
        }
        
        return record;
    }

    protected _compileMusic(): Score {
        let _accompaniment = super._compileMusic();
        this._userPlaying = !this._userPlaying;

        if (!this._userPlaying) {
            this._previousChorusExerciseNotesPassed += this._chorusExerciseNotesPassed;
            this._exercise = MusicHelper.GenerateExercise(this._chart);
            _accompaniment.consolidate(this._exercise);
        }
        
        return _accompaniment;
    }

    get userShouldPlay(): boolean {
        return this._userPlaying;
    }

    get currListeningScore(): IListeningScore {
        return this._listeningScore;
    }

    private get _chorusExerciseNotesPassed(): number {
        let notesPassed = 0;
        
        if (this._queueTimes) {
            let musicIdx = Util.getClosestQueueTime(this._queueTimes, this._audioContext.currentTime)[0];
            let currSubbeatIdx = musicIdx.subbeatIdx;

            if (this._exercise) {
                let exerciseBars = this._exercise.music;

                for (
                    let barIdx = this._chart.rangeStartIdx;
                    barIdx <= this._barIdx;
                    barIdx ++
                ) {
                    let exerciseBar = exerciseBars[barIdx];
                    if (barIdx === this._barIdx) {
                        for (let subbeatIdx = 0; subbeatIdx <= currSubbeatIdx; subbeatIdx ++) {
                            let strokes = (exerciseBar|| {})[subbeatIdx];
                            if (strokes) {
                                notesPassed ++;
                            }
                        }
                    } else {
                        notesPassed += Util.length(exerciseBar || []);
                    }
                }
            }
        }
        
        return notesPassed;
    }
}