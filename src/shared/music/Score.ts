import { IPart, IScoreBar, IMusicIdx, IStroke, IMusicBar, InstrumentType } from "../types";
import * as Util from "../Util";

class Score {
    private _bars: IScoreBar[]; 

    public static validStrokes = (strokes: IStroke[]) => {
        if (!Array.isArray(strokes)) {
            return false;
        }

        for (let stroke of strokes) {
            if (
                !stroke || 
                !Number.isInteger(stroke.durationInSubbeats) ||
                stroke.durationInSubbeats <= 0 ||
                !Number.isFinite(stroke.velocity) ||
                stroke.velocity < 0 ||
                stroke.velocity > 1 ||
                !Array.isArray(stroke.notes) ||
                stroke.notes.length === 0 ||
                stroke.notes.some(n => !Number.isInteger(n))
            ) {
                return false;
            }
        }

        return true;
    }

    public static validMusic = (music: IMusicBar[]) => {
        if (!Array.isArray(music)) {
            return false;
        }

        for (let bar of music) {
            for (let subbeat in bar) {
                let subbeatIdx = parseInt(subbeat, undefined);

                if (!Number.isInteger(subbeatIdx) || subbeatIdx < 0 || !Score.validStrokes(bar[subbeat])) {
                    return false;
                }
            }
        }

        return true;
    }

    public static validPart = (part: IPart) => {
        if (!part) {
            return false;
        }

        switch(part.instrument) {
            case "piano":
            case "doubleBass":
            case "shutHiHat":
            case "rideCymbal":
                return Score.validMusic(part.music);

            default:
                return false;
        }
    }

    // Returns a tuple of 3 integers in which the first is the number of times a subsequent 
    // voicing notes average was greater than the one preceeding, the second is the number
    // of times a subsequent voicing notes average was less than the one preceding, and
    // the third is one less than the total number of voicings in the music array 
    public static getAscensionRate = (music: IMusicBar[]) => {
        let voicingAvg = -1;
        let startingIdx = -1;
        let rate = [0, 0, 0];

        let getNoteAvgFromBarAndSubbeatIdx = (bar: IMusicBar, subbeatIdx: string) => {
            return Util.mean(bar[subbeatIdx][0].notes);
        }
    
        let updateFraction = (fraction: number[], avg: number, bar: IMusicBar, subbeatIdx: string) => {
            let nextAvg = getNoteAvgFromBarAndSubbeatIdx(bar, subbeatIdx);
            fraction[2] ++;
            if (nextAvg > avg) {
                fraction[0] ++;
            } else if (nextAvg < avg) {
                fraction[1] ++;
            }
            avg = nextAvg;
        }
    
        // Get first voicing
        for (let bar of music) {
            startingIdx++;
            if (!Util.objectIsEmpty(bar)) {
                for (let subbeatIdx in bar) {
                    if (voicingAvg > 0) {
                        updateFraction(rate, voicingAvg, bar, subbeatIdx);
                    } else {
                        voicingAvg = getNoteAvgFromBarAndSubbeatIdx(bar, subbeatIdx);
                    }
                }
                break;			
            }
        }
    
        // Calculate the fraction over the rest of the music array
        for (let barIdx = startingIdx; barIdx < music.length; barIdx++) {
            let bar = music[barIdx];
            for (let subbeatIdx in bar) {
                updateFraction(rate, voicingAvg, bar, subbeatIdx);
            }
        }
    
        return rate;
    };

    constructor(partsOrScores: (IPart | Score)[] | (IPart | Score)) {
        this._bars = [];
        
        if (!Array.isArray(partsOrScores)) {
            partsOrScores = [partsOrScores];
        }

        for (let partOrScore of partsOrScores) {
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

                if (!Score.validPart(partOrScore)) {
                    throw new Error("Invalid part passed to score constructor");
                }

                let { instrument, music } = partOrScore;
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
        }
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

    public getPart = (instrument: string): IPart | null => {

        if (this.instruments.indexOf(instrument) === -1) {
            return null;
        }

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

    public changeVolume = (instrument: string, volFactor: number) => {
        switch(instrument) {
            default:
            case "piano":
                return this._changeVolume("piano", volFactor);
            case "doubleBass":
                return this._changeVolume("doubleBass", volFactor);
            case "drums":
                this._changeVolume("shutHiHat", volFactor);
                return this._changeVolume("rideCymbal", volFactor);

        }
    }

    private _changeVolume = (instrument: InstrumentType, volFactor: number) => {
        this._bars.forEach((bar, barIdx) => {
            for (let subbeat in bar) {
                if (instrument in bar[subbeat]) {
                    this._bars[barIdx][subbeat][instrument][0].velocity *= volFactor;
                }
            }
        });
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

    get instruments() {
        let instruments: string[] = [];

        if (!Array.isArray(this._bars) || this._bars.length === 0) {
            return [];
        }

        this._bars.forEach(bar => {
            for (let subbeatIdx in bar) {
                for (let instrument in bar[subbeatIdx]) {
                    if (instruments.indexOf(instrument) === -1) {
                        instruments.push(instrument);
                    }
                }
            }
        });

        return instruments;
    }
}

export default Score;