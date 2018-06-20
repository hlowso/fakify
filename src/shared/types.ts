// export interface ISong {

// }

export interface IChartBar {
    timeSignature: number[];
    chordEnvelopes: IChartChord[];
}

export interface IChartChord {
    beat: string;
    chord: string;
    beatsBeforeChange: number;
    durationInBeats: number;
    durationInSubbeats?: number;
    key: string;
}

export interface IUserStrokeRecord {
    chartIndex: IMusicIdx;
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
    chartBarIndex?: number;
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
    chartIndex: IMusicIdx;
    parts: {
        [instrument: string]: IStroke[];
    }
}

export enum PlayMode {
    Improv = "improv",
    ListenAndRepeat = "listenAndRepeat"
}