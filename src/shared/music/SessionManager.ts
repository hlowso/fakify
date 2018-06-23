import uuid from "uuid";
// import { CompV2 } from "../music/MusicHelper";
import Chart from "../music/Chart";
import { 
    IMusicIdx, 
    IMusicBar, 
    IChordPassage, 
    // IChartBar, 
    // IChordSegment, 
    ISessionPassage 
} from "../types";

class SessionManager {

    //
    // STATIC 
    //

    public static getMusicIdx = (barIdx: number, subbeatIdx: number): IMusicIdx => ({
        barIdx, subbeatIdx
    });

    private _audioContext: any;
    // private _fontPlayer: any;
    private _sessionId: string;
    private _chart: Chart;
    // private _take: IMusicBar[];

    private _rangeLength: number;

    // private _currentChartBar: IChartBar;
    // private _currentChartChord: IChartChord;
    private _currentMusicBar: IMusicBar;
    private _currentPassage: IChordPassage;

    private _barIdx: number;
    private _chordIdx: number;
    private _subbeatIdx: number;
    
    constructor(audioContext: any, fontPlayer: any, chart: Chart) {
        this._audioContext = audioContext;
        // this._fontPlayer = fontPlayer;
        this._sessionId = uuid();
        this._chart = chart;
        this._rangeLength = chart.rangeEndIdx - chart.rangeStartIdx;

        this._barIdx = chart.rangeStartIdx - 1;
        this._chordIdx = -1;
        this._subbeatIdx = -1;
    }

    /**
     * STEPPING FUNCTIONS
     */

    public stepBySubbeat = (): IMusicIdx => {
        if (this._subbeatIdx === this._currentPassage.durationInSubbeats - 1) {
            return this.stepByPassage();
        }
        this._subbeatIdx ++;
        return this._getMusicIdx();
    };

    public stepByPassage = (): IMusicIdx => {
        if (this._chordIdx === -1 || this._chordIdx === this._currentMusicBar.chordPassages.length - 1) {
            return this.stepByBar();
        }
        this._chordIdx ++;
        this._subbeatIdx = 0;

        return this._getMusicIdx();
    }

    public stepByBar = (): IMusicIdx => {
        this._barIdx++;
        if (this._barIdx > this._chart.rangeEndIdx) {
            this._barIdx = this._chart.rangeStartIdx;
        } 
        this._chordIdx = 0;
        this._subbeatIdx = 0;
     
        return this._getMusicIdx();
    }

    public nextSessionPassage = (): ISessionPassage => {
        this.stepByPassage();
        return this.sessionPassage;
    }

    /**
     * GETS
     */

    public get sessionId(): string {
        return this._sessionId;
    }

    // public get currentKey(): string {
    //     return this._currentChartChord.key;
    // }

    public get atlastPassage(): boolean {
        return this._barIdx === this._rangeLength - 1 && this._chordIdx === this._currentMusicBar.chordPassages.length - 1;
    }

    public get passage(): IChordPassage {
        return this._currentPassage;
    }

    public get bar(): IMusicBar {
        return this._currentMusicBar;
    }

    public get idx(): IMusicIdx {
        return this._getMusicIdx();
    }

    public get sessionPassage(): ISessionPassage {
        let { tempo } = this._chart;
        let { durationInSubbeats, timeSignature } = this._currentMusicBar;
        let subbeatDuration = 60 / ( durationInSubbeats * (tempo[0] / ( timeSignature[0] * ( tempo[1] / timeSignature[1] ))));

        let { currentTime } = this._audioContext;
        let subbeatOffsetToQueueTime = [];

        for (
            let subbeatOffset = 0; 
            subbeatOffset < this._currentPassage.durationInSubbeats; 
            subbeatOffset++
        ) {
            subbeatOffsetToQueueTime.push(currentTime + subbeatDuration * subbeatOffset);
        }

        return { 
            sessionId: this._sessionId, 
            duration: this._currentPassage.durationInSubbeats * subbeatDuration,
            subbeatDuration, 
            subbeatOffsetToQueueTime,
            chartIndex: this._getMusicIdx(),
            parts: this._currentPassage.parts
        };
    }

    public start = () => {

    }

    public stop = () => {

    }

    /**
     * PRIVATE FUNCTIONS
     */

    private _getMusicIdx = (): IMusicIdx => {
        return SessionManager.getMusicIdx(this._barIdx, this._subbeatIdx);
    }

    // private _moveToIdx = () => {
    //     if (this._barIdx === this._chart.rangeStartIdx) {
    //         this._take = CompV2(this._chart);
    //     }

    //     this._currentChartBar = this._chart.barsV1[this._barIdx];
    //     this._currentChartChord = this._currentChartBar.chordEnvelopes[this._chordIdx];

    //     this._currentMusicBar = this._take[this._barIdx];
    //     this._currentPassage = this._currentMusicBar.chordPassages[this._chordIdx];
    // }
    
}

export default SessionManager;