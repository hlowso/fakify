// export interface ISong {

// }

// export interface IChartBar {

// }

export interface IUserStrokeRecord {
    musicIndex: IMusicIdx;
    precision: number;
    note: number;
    velocity: number;
    duration?: number;
}

export interface IMusicIdx {
    barIdx: number;
    chordIdx: number;
    subbeatOffset?: number;
}

export interface IChart {
    barsV1: any;
    tempo: number[];
    keyContext: string;
    feel: Feel;
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

export interface ISessionPassage {
    sessionId: string;
    duration: number;
    subbeatDuration: number;
    subbeatOffsetToQueueTime: number[];
    musicIndex: IMusicIdx;
    parts: {
        [instrument: string]: IStroke[];
    }
}

export enum PlayMode {
    Improv = "improv",
    ListenAndRepeat = "listenAndRepeat"
}