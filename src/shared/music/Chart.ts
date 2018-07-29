import * as MusicHelper from "../music/MusicHelper";
import { IBarBase, IChartBar, Feel, NoteName, Tempo, IMusicIdx, IChordStretch } from "../types";

class Chart {
    private _barsBase: IBarBase[];
    private _bars: IChartBar[];
    private _chordStretches: IChordStretch[];
    private _context: NoteName;
    private _tempo: Tempo;
    private _feel: Feel;
    private _externalUpdate: () => void;
    private _rangeStartIdx: number;
    private _rangeEndIdx: number;
    private _durationInSubbeats: number;

    constructor(
        bars: IBarBase[], 
        context: NoteName, 
        tempo: Tempo,
        feel: Feel,
        externalUpdate: () => void, 
        rangeStartIdx = 0, 
        rangeEndIdx = bars.length
    ) {
        this._barsBase = bars;
        this._bars = MusicHelper.adjustBarTimes(
            MusicHelper.contextualizeBars(
                bars,
                context
            ),
            feel
        );
        this._context = context;
        this._tempo = tempo;
        this._feel = feel;
        this._externalUpdate = externalUpdate;
        this._rangeStartIdx = rangeStartIdx;
        this._rangeEndIdx = rangeEndIdx;
        this._durationInSubbeats = 0;

        // Build the chord stretches from the bars
        this._buildChordStretches();        
    }

    public forEachBarInRange = (callback: (bar: IChartBar, idx: number) => void) => {
        for (let barIdx = this._rangeStartIdx; barIdx <= this._rangeEndIdx; barIdx ++) {
            callback(this._bars[barIdx], barIdx);
        }
    }

    public barIdxIsInRange = (idx: number): boolean => (
        this._rangeStartIdx <= idx &&
        idx <= this._rangeEndIdx
    )

    public segmentAtIdx = (idx: IMusicIdx) => {
        let { barIdx, segmentIdx } = this._completeMusicIdx(idx);
        return this._bars[barIdx].chordSegments[segmentIdx as number];
    }

    public nextSegmentAtIdx = (idx: IMusicIdx) => {
        let { barIdx, segmentIdx } = this._completeMusicIdx(idx);
        segmentIdx = segmentIdx as number;

        let bar = this._bars[barIdx];
        if (segmentIdx < bar.chordSegments.length - 1) {
            return bar.chordSegments[segmentIdx + 1];
        }
        if (barIdx < this._bars.length - 1) {
            return this._bars[barIdx + 1].chordSegments[0];
        }
        return;
    }

    public keyAtIdx = (idx: IMusicIdx) => {
        return this.segmentAtIdx(idx).key;
    }

    public absSubbeatIdxToMusicIdx = (absIdx: number): IMusicIdx | undefined => {
        let totalSubbeatCount = 0;

        for (let barIdx = 0; barIdx < this._bars.length; barIdx ++) {
            let bar = this._bars[barIdx];
            let barSubbeatCount = 0;
            
            for (let segmentIdx = 0; segmentIdx < bar.chordSegments.length; segmentIdx ++) {
                let segment = bar.chordSegments[segmentIdx];
                let segmentDuration = segment.durationInSubbeats

                totalSubbeatCount += segmentDuration; 

                if (totalSubbeatCount > absIdx) {
                    return {
                        barIdx,
                        segmentIdx,
                        subbeatIdx: barSubbeatCount + segmentDuration - (totalSubbeatCount - absIdx) 
                    }
                }     
                
                barSubbeatCount += segmentDuration;   
            }
        }

        return;
    }

    private _buildChordStretches = () => {
        this._chordStretches = [];
        let subbeatsBeforeChange = 0;

        this._bars.forEach(bar => {
            this._durationInSubbeats += bar.durationInSubbeats;
            bar.chordSegments.forEach(segment => {
                if (subbeatsBeforeChange === 0) {
                    subbeatsBeforeChange = segment.subbeatsBeforeChange;
                    this._chordStretches.push({
                        chordName: segment.chordName,
                        key: segment.key,
                        durationInSubbeats: subbeatsBeforeChange
                    });
                }
                subbeatsBeforeChange -= segment.durationInSubbeats;
            });
        });
    }

    private _completeMusicIdx = (idx: IMusicIdx) => {
        if (idx.segmentIdx) {
            return idx;
        }

        let bar = this._bars[idx.barIdx];
        let subbeatCount = bar.chordSegments[0].durationInSubbeats;
        let segmentIdx = 0; 

        while (subbeatCount < (idx.subbeatIdx as number)) {
            segmentIdx ++;
            subbeatCount += bar.chordSegments[segmentIdx].durationInSubbeats; 
        }

        return { ...idx, segmentIdx };
    }

    /**
     * GETTERS
     */

    get bars(): IChartBar[] {
        return this._bars;
    }

    get barsInRange(): IChartBar[] {
        return this._bars.filter(
            (bar: IChartBar, idx: number) => this.barIdxIsInRange(idx)
        );
    }

    get chordStretches() {
        return this._chordStretches;
    }

    get context(): NoteName {
        return this._context;
    }

    get tempo(): Tempo {
        return this._tempo;
    }

    get feel(): Feel {
        return this._feel;
    }

    get rangeStartIdx(): number {
        return this._rangeStartIdx;
    }

    get rangeEndIdx(): number {
        return this._rangeEndIdx;
    }

    get firstBarInRange(): IChartBar {
        return this._bars[this._rangeStartIdx];
    }

    get lastBarInRange(): IChartBar {
        return this._bars[this._rangeEndIdx];
    }

    get durationInSubbeats() {
        return this._durationInSubbeats;
    }

    /**
     * SETTERS
     */

    set context(newContext: NoteName) {
        this._context = newContext;
        this._bars = MusicHelper.adjustBarTimes(
            MusicHelper.contextualizeBars(
                this._barsBase,
                newContext
            ),
            this._feel
        );
        this._buildChordStretches();
        this._externalUpdate();
    }

    set tempo(newTempo: Tempo) {
        this._tempo = newTempo;
        this._externalUpdate();
    }

    set feel(newFeel: Feel) {
        this._feel = newFeel;
        this._bars = MusicHelper.adjustBarTimes(
            MusicHelper.contextualizeBars(
                this._barsBase,
                this._context
            ),
            newFeel
        );
        this._externalUpdate();
    }

    set rangeStartIdx(newIdx: number) {
        this._rangeStartIdx = newIdx;
        this._externalUpdate();
    }

    set rangeEndIdx(newIdx: number) {
        this._rangeEndIdx = newIdx;
        this._externalUpdate();
    }
}

export default Chart;