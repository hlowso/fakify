import * as Mongo from "mongodb";

export interface IIncomingUser {
    email: string;
    password: string;
}

export interface IUser {
    _id?: Mongo.ObjectId | string;
    userId?: string;
    email: string;
    passhash: string;
    token: string;
}

export const AdminRoutes = [
    "/login",
    "/signup"
]

export const StandardRoutes = [
    "/play",
    "/create"
]

export enum Tabs {
    Login = "login",
    Signup = "signup",
    Play = "play",
    Create = "create",
    None = ""
}

export interface ISong {
    _id?: Mongo.ObjectId | string;
    userId?: Mongo.ObjectId | string;
    title?: string;
    originalContext?: NoteName;
    originalTempo?: Tempo;
    barsBase?: IChartBar[];
}

export type Tempo = [number, number];
export type TimeSignature = [number, number];
export type NoteName = "C" | "C#|Db" | "D" | "D#|Eb" | "E" | "F" | "F#|Gb" | "G" | "G#|Ab" | "A" | "A#|Bb" | "B|Cb";
export type RelativeNoteName = "1" | "H" | "2" | "N" | "3" | "4" | "T" | "5" | "U" | "6" | "J" | "7";

export enum ChordShape { 
    Maj = "+",
    Maj7 = "^ma7",    
    Min = "-",
    Min7 = "^-7",
    Dom7 = "^7",
    Dom9 = "^9",
    Dim = "^Dim"
}

export type ChordName = [NoteName | RelativeNoteName, ChordShape];

// export interface IBarBase {
//     barIdx: number;
//     timeSignature: TimeSignature;
//     chordSegments: IChordBase[];
// }

// export interface IChordBase {
//     beatIdx: number;
//     chord: string;
//     chordName?: ChordName;
//     key: RelativeNoteName | NoteName;
// }

export interface IChartBar {
    barIdx: number;
    timeSignature: TimeSignature;
    chordSegments: IChordSegment[];
    durationInSubbeats?: number;
}

export interface IChordStretch {
    beatIdx?: number;
    subbeatIdx?: number;
    chordName?: ChordName;
    key?: RelativeNoteName | NoteName;
    durationInBeats?: number;
    durationInSubbeats?: number;
}

export interface IChordSegment extends IChordStretch {
    subbeatsBeforeChange?: number;
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
    subbeatIdx?: number;
}

export enum Feel {
    Swing = "swing"
}

// export interface IChordPassage {
//     durationInSubbeats: number;
//     parts: {
//         [instrument: string]: IStroke[];
//     }
// }

export interface IStroke {
    subbeatOffset?: number;
    durationInSubbeats: number;
    notes: number[];
    velocity: number;
}

export enum PlayMode {
    None = "none",
    Improv = "improv",
    Listening = "listening"
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

export interface IPart {
    instrument: string;
    music: IMusicBar[];
}

export interface IMusicBar {
    [subbeatIdx: number]: IStroke[];
}

export interface IExercise {
    firstNote: number;
    rangeStartNote: number;
    rangeEndNote: number;
    numberOfNotes: number;
    part: IPart;
}

export interface ISubbeatTimeMap { 
    [barIdx: number]: { [subbeatIdx: number]: number };
}

export interface IImprovReport {
    notesPlayed: number;
    notesInTime: number;
    notesInKey: number;
}

export interface IListeningReport {
    correctNotesCount: number;
    percentCorrect: number;
    incorrectNotes: Array<{
        musicIdx: IMusicIdx;
        played: number;
        correct: number;
    }>;
}

export interface IMidiMessage {
    // Type, Note, Velocity
    // Must remain in tuple format to 
    // be compatible with onmidimessage which originates
    // from navigator.requestMIDIAccess
    data: [number, number, number];
}

export interface IChartSettings {
    tempo?: Tempo;
    context?: NoteName; 
    feel?: Feel; 
    rangeStartIdx?: number; 
    rangeEndIdx?: number;
}

export interface IShapeInfo {
    shape: ChordShape;
    baseIntervals: number[];
    relativeTonicPositions: RelativeNoteName[]; 
    extension?: RelativeNoteName[];
}