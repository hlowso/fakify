import { IPart, IScoreBar, IMusicIdx, IStroke, IMusicBar } from "../types";

class Score {
    private _bars: IScoreBar[]; 

    constructor(partsOrScores: (IPart | Score)[] | (IPart | Score)) {
        this._bars = [];
        
        if (!Array.isArray(partsOrScores)) {
            partsOrScores = [partsOrScores];
        }

        partsOrScores.forEach(partOrScore => {
            // If the current object is a score
            if (partOrScore instanceof Score) {
                (partOrScore as Score).forEachBar((otherBar, idx) => {
                    if (!this._bars[(idx as number)]) {
                        this._bars[(idx as number)] = otherBar;
                    } else {
                        for (let subbeatIdx in otherBar) {
                            if (!this._bars[(idx as number)][subbeatIdx]) {
                                this._bars[(idx as number)][subbeatIdx] = {};
                            }
                            for (let instrument in otherBar[subbeatIdx]) {
                                if (!this._bars[(idx as number)][subbeatIdx][instrument]) {
                                    this._bars[(idx as number)][subbeatIdx][instrument] = [];
                                } 
                                this._bars[(idx as number)][subbeatIdx][instrument].concat(otherBar[subbeatIdx][instrument]);
                            }
                        }
                    }
                });

            // If the current object is a part
            } else {
                let { instrument, music } = (partOrScore as IPart);
                music.forEach((bar, idx) => {
                    if (!this._bars[idx]) {
                        this._bars[idx] = {};
                    }
                    for (let subbeatIdx in bar) {
                        if (!this._bars[idx][subbeatIdx]) {
                            this._bars[idx][subbeatIdx] = {};
                        } 
                        if (!this._bars[idx][subbeatIdx][instrument]) {
                            this._bars[idx][subbeatIdx][instrument] = [];
                        }
                        this._bars[idx][subbeatIdx][instrument] = this._bars[idx][subbeatIdx][instrument].concat(bar[subbeatIdx]);
                    }
                });

            }
        });
    }

    public barAt = (idx: number): IScoreBar => {
        return this._bars[idx];
    }

    public strokesAt = (idx: IMusicIdx, instrument = ""): IStroke[] | { [instrument: string]: IStroke[] } => {
        if (instrument) {
            return this._bars[idx.barIdx][(idx.subbeatIdx as number)][instrument];
        }
        return this._bars[idx.barIdx][(idx.subbeatIdx as number)];
    }

    public consolidate = (otherMusic: (Score | IPart)[] | (Score | IPart)) => {
        let scores = (
            Array.isArray(otherMusic)
                ? [this, ...otherMusic]
                : [this, otherMusic]
        );
        this._bars = new Score(scores).bars;
    }

    public forEachBar = (callback: (bar: IScoreBar, idx?: number) => void) => {
        this._bars.forEach(callback);
    }

    public getPart = (instrument: string): IPart => {
        let music = this._bars.map(bar => {
            let musicBar: IMusicBar = {};
            for (let subbeatIdx in bar) {
                let strokes = bar[subbeatIdx][instrument];
                if (strokes) {
                    musicBar[subbeatIdx] = strokes;
                }
            }
            return musicBar;
        });

        return {
            instrument,
            music
        }
    }

    get bars(): IScoreBar[] {
        return this._bars;
    }

    get length(): number {
        return this._bars.filter(String).length;
    }

    get lastBar() {
        return this._bars[this._bars.length - 1];
    }
}

export default Score;