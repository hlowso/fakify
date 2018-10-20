import * as Mongo from "mongodb";

export interface ISession {
    token: string;
}

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

export type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

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

export interface ISongTitle {
    songId: Mongo.ObjectId | string;
    title: string;
}

export type InstrumentType = "piano" | "doubleBass" | "shutHiHat" | "rideCymbal";

export type Tempo = [number, number];
export type TimeSignature = [number, number];
export type NoteName = "C" | "C#|Db" | "D" | "D#|Eb" | "E" | "F" | "F#|Gb" | "G" | "G#|Ab" | "A" | "A#|Bb" | "B|Cb";
export type RelativeNoteName = "1" | "H" | "2" | "N" | "3" | "4" | "T" | "5" | "U" | "6" | "J" | "7";

export enum ChordShape { 
    Maj = "Maj",
    Maj6 = "Maj6",
    Maj7 = "Maj7",
    Maj9 = "Maj9",    
    Add9 = "Add9",
    Majb5 = "Majb5",
    Maj7b5 = "Maj7b5",
    Maj7$5 = "Maj7$5",
    Maj7b9 = "Maj7b9",
    Maj$9 = "Maj$9",
    Majb9 = "Majb9",
    Maj7$9 = "Maj7$9",
    Maj7$11 = "Maj7$11",
    Min = "Min",
    Min6 = "Min6",
    Min7 = "Min7",
    Min9 = "Min9",
    Min$5 = "Min$5",
    Min7b5 = "Min7b5",
    Min7$5 = "Min7$5",
    Min7b9 = "Min7b9",
    Min7$9 = "Min7$9",
    Min7$11 = "Min7$11",
    MinMaj7 = "MinMaj7",
    Dom7 = "Dom7",
    Dom9 = "Dom9",
    Dom7b5 = "Dom7b5",
    Dom7$5 = "Dom7$5",
    Dom7b9 = "Dom7b9",
    Dom7$9 = "Dom7$9",
    Dom7$11 = "Dom7$11",
    Dom9b5 = "Dom9b5",
    Dom9$5 = "Dom9$5",    
    Aug = "Aug",
    Aug7 = "Aug7",
    Aug7$9 = "Aug7$9",
    Dim = "Dim",
    Dim7 = "Dim7",
    Sus2 = "Sus2",
    Sus4 = "Sus4"
}

export enum PresentableChordShape { 
    Maj = "",
    Maj6 = "6",
    Maj7 = "ma7",
    Maj9 = "ma9",    
    Add9 = "add9",
    Majb5 = "ma(b5)",
    Maj7b5 = "ma7(b5)",
    Maj7$5 = "ma7(#5)",
    Maj7b9 = "ma7(b9)",
    Maj$9 = "ma(#9)",
    Majb9 = "ma(b9)",
    Maj7$9 = "ma7($9)",
    Maj7$11 = "maj7(#11)",
    Min = "-",
    Min6 = "-6",
    Min7 = "-7",
    Min9 = "-9",
    Min$5 = "min(#5)",
    Min7b5 = "-7(b5)",
    Min7$5 = "-7(#5)",
    Min7b9 = "-7(b9)",
    Min7$9 = "-7($9)",
    Min7$11 = "-7(#11)",
    MinMaj7 = "-(maj7)",
    Dom7 = "7",
    Dom9 = "9",
    Dom7b5 = "7(b5)",
    Dom7$5 = "7(#5)",
    Dom7b9 = "7(b9)",
    Dom7$9 = "7(#9)",
    Dom7$11 = "7(#11)",
    Dom9b5 = "9(b5)",
    Dom9$5 = "9(#5)",    
    Aug = "aug",
    Aug7 = "aug7",
    Aug7$9 = "aug7($9)",
    Dim = "dim",
    Dim7 = "dim7",
    Sus2 = "sus2",
    Sus4 = "sus4"
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