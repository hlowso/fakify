import { IMusicIdx, IMusicBar, IChordPassage } from "../types";

class MusicIterator {

    public static getMusicIdx = (barIdx: number, chordIdx: number, subbeatOffset: number): IMusicIdx => ({
        barIdx, chordIdx, subbeatOffset
    });

    private _music: IMusicBar[];
    private _bar: number;
    private _chord: number;
    private _subbeat: number;
    private _barCount: number;

    private _currentBar: IMusicBar;
    private _currentPassage: IChordPassage;
    
    constructor(music: IMusicBar[]) {
        this._music = music;
        this._barCount = music.length;

        this._currentBar = music[0];
        this._currentPassage = this._currentBar.chordPassages[0];
        
        this._bar = 0;
        this._chord = 0;
        this._subbeat = 0;
    }

    public next = (): IMusicIdx => {
        let idx = this._getMusicIdx();
        this.nextPassage();
        return idx;
    }

    public nextSubbeat = (): IMusicIdx => {
        if (this._subbeat === this._currentPassage.durationInSubbeats - 1) {
            return this.nextPassage();
        }
        this._subbeat ++;
        return this._getMusicIdx();
    };

    public nextPassage = (): IMusicIdx => {
        if (this._chord === this._currentBar.chordPassages.length - 1) {
            return this.nextBar();
        }
        this._chord ++;
        this._subbeat = 0;
        this._currentPassage = this._currentBar.chordPassages[this._chord];
        return this._getMusicIdx();
    }

    public nextBar = (): IMusicIdx => {
        this._bar++;
        this._bar %= this._barCount;
        this._chord = 0;
        this._subbeat = 0;

        this._currentBar = this._music[this._bar];
        this._currentPassage = this._currentBar.chordPassages[0];
     
        return this._getMusicIdx();
    }

    public previousSubbeat = (): IMusicIdx => {
        if (!this._subbeat) {
            return this.previousPassage();
        }
        this._subbeat --;
        return this._getMusicIdx();
    };

    public previousPassage = (): IMusicIdx => {
        if (!this._chord) {
            return this.previousBar();
        }
        this._chord ++;
        this._currentPassage = this._currentBar.chordPassages[this._chord];
        this._subbeat = this._currentPassage.durationInSubbeats - 1;
        
        return this._getMusicIdx();
    }

    public previousBar = (): IMusicIdx => {
        this._bar --;
        this._bar %= this._barCount;

        this._currentBar = this._music[this._bar];
        this._chord = this._currentBar.chordPassages.length - 1;

        this._currentPassage = this._currentBar[this._chord];
        this._subbeat = this._currentPassage.durationInSubbeats - 1;
     
        return this._getMusicIdx();
    }

    public get atlastPassage(): boolean {
        return this._bar === this._barCount - 1 && this._chord === this._currentBar.chordPassages.length - 1;
    }

    public get passage(): IChordPassage {
        return this._currentPassage;
    }

    public get bar(): IMusicBar {
        return this._currentBar;
    }

    public get idx(): IMusicIdx {
        return this._getMusicIdx();
    }

    private _getMusicIdx = (): IMusicIdx => {
        return MusicIterator.getMusicIdx(this._currentBar.chartBarIndex, this._chord, this._subbeat);
    }
    
}

export default MusicIterator;