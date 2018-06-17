export interface IChart {
    barsBase?: any;
    barsV1: any;
    tempo: number[];
    keyContext: string;
    rangeStartIndex: number;
    rangeEndIndex: number;
}

export enum Feel { 
    Swing = "swing"
}

export interface IMusicBar {
    timeSignature: number[];
    durationInSubbeats: number;
    chordPassages: IChordPassage[];
}

export interface IChordPassage {
    durationInSubbeats: number;
    parts: {
        [instrument: string]: IStroke[];
    }
}

export interface IStroke {
    subbeatOffset: number;
    durationInSubbeats: number;
    notes: number[];
    velocity: number;
}