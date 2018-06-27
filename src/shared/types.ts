// export interface ISong {

// }

export type Tempo = [number, number];
export type TimeSignature = [number, number];
export type NoteName = "C" | "C#|Db" | "D" | "D#|Eb" | "E" | "F" | "F#|Gb" | "G" | "G#|Ab" | "A" | "A#|Bb" | "B|Cb";
export type RelativeNoteName = "1" | "H" | "2" | "N" | "3" | "4" | "T" | "5" | "U" | "6" | "J" | "7";

export interface IBarBase {
    barIdx: number;
    timeSignature: TimeSignature;
    chordSegments: IChordBase[];
}

export interface IChordBase {
    beatIdx: number;
    chord: string;
    key: RelativeNoteName | NoteName;
    durationInBeats: number;
}

export interface IChartBar {
    barIdx: number;
    timeSignature: TimeSignature;
    chordSegments: IChordSegment[];
    durationInSubbeats: number;
}

export interface IChordSegment {
    beatIdx: number;
    subbeatIdx: number;
    chord: string;
    key: NoteName;
    durationInSubbeats: number;
    subbeatsBeforeChange: number;
}

export interface IKeyStrokeRecord {
    musicIdx: IMusicIdx;
    note: number;
    velocity: number;
    precision: number;
    inKey: boolean;
    duration?: number;
}

export interface IMusicIdx {
    chorusIdx?: number;
    barIdx: number;
    segmentIdx?: number;
    subbeatIdx: number;
}

export enum Feel {
    Swing = "swing"
}

export interface IChordPassage {
    durationInSubbeats: number;
    parts: {
        [instrument: string]: IStroke[];
    }
}

export interface IStroke {
    subbeatOffset?: number;
    durationInSubbeats: number;
    notes: number[];
    velocity: number;
}

export enum PlayMode {
    None = "none",
    Improv = "improv",
    ListenAndRepeat = "listenAndRepeat"
}

export enum Difficulty {
    Easy = "easy",
    Hard = "hard"
}

export interface IScoreBar {
    [subbeatIdx: number]: {
        [instrument: string]: IStroke[];
    }
}

export interface IMusicBarV2 {
    [subbeatIdx: number]: IStroke[];
}

export interface ISubbeatTimeMap { 
    [barIdx: number]: { [subbeatIdx: number]: number };
}

export interface IImprovScore {
    notesPlayed: number;
    notesInTime: number;
    notesInKey: number;
}