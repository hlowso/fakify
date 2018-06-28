import { IPart, IScoreBar } from "../types";

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

    public barAt = (idx: number) => {
        return this._bars[idx];
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

    get bars(): IScoreBar[] {
        return this._bars;
    }

    get length(): number {
        return this._bars.filter(String).length;
    }
}

export default Score;