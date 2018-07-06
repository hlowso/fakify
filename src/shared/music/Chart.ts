import * as MusicHelper from "../music/MusicHelper";
import { IBarBase, IChartBar, Feel, NoteName, Tempo, IMusicIdx } from "../types";

class Chart {
    private _barsBase: IBarBase[];
    private _bars: IChartBar[];
    private _context: NoteName;
    private _tempo: Tempo;
    private _feel: Feel;
    private _onSet: () => void;
    private _rangeStartIdx: number;
    private _rangeEndIdx: number;

    constructor(
        bars: IBarBase[], 
        context: NoteName, 
        tempo: Tempo,
        feel: Feel,
        onSet: () => void, 
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
        this._onSet = onSet;
        this._rangeStartIdx = rangeStartIdx;
        this._rangeEndIdx = rangeEndIdx;
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

    public keyAtIdx = (idx: IMusicIdx) => {
        let bar = this._bars[idx.barIdx];
        let subbeatCount = bar.chordSegments[0].durationInSubbeats;
        let segIdx = 0; 

        while (subbeatCount < (idx.subbeatIdx as number)) {
            segIdx ++;
            subbeatCount += bar.chordSegments[segIdx].durationInSubbeats; 
        }

        return bar.chordSegments[segIdx].key;
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
        this._onSet();
    }

    set tempo(newTempo: Tempo) {
        this._tempo = newTempo;
        this._onSet();
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
        this._onSet();
    }

    set rangeStartIdx(newIdx: number) {
        this._rangeStartIdx = newIdx;
        this._onSet();
    }

    set rangeEndIdx(newIdx: number) {
        this._rangeEndIdx = newIdx;
        this._onSet();
    }
}

export default Chart;