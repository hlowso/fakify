import { Note } from "./music/domain/Note";

export interface ISong {
    id: string;
    title: string;
    originalContext: NoteName;
    originalTempo: Tempo;
    tempo: Tempo;
    suitableFeels: Feel[];
    barsBase: IBarBase[];
}

export type Tempo = [number, number];
export type TimeSignature = [number, number];
export type NoteName = "C" | "C#|Db" | "D" | "D#|Eb" | "E" | "F" | "F#|Gb" | "G" | "G#|Ab" | "A" | "A#|Bb" | "B|Cb";
export type RelativeNoteName = "1" | "H" | "2" | "N" | "3" | "4" | "T" | "5" | "U" | "6" | "J" | "7";

export enum ChordShape { 
    Maj = "Major",
    Maj7 = "Major7",    
    Min = "Minor",
    Min7 = "Minor7",
    Dom7 = "Dominant7",
    Dom9 = "Dominant9",
    Dim = "Diminished"
}

export type ChordName = [NoteName | RelativeNoteName, ChordShape];

export interface IBarBase {
    barIdx: number;
    timeSignature: TimeSignature;
    chordSegments: IChordBase[];
}

export interface IChordBase {
    beatIdx: number;
    chord: string;
    chordName?: ChordName;
    key: RelativeNoteName | NoteName;
    durationInBeats: number;
}

export interface IChartBar {
    barIdx: number;
    timeSignature: TimeSignature;
    chordSegments: IChordSegment[];
    durationInSubbeats: number;
}

export interface IChordStretch {
    chordName?: ChordName;
    key?: NoteName;
    durationInSubbeats: number;
}

export interface IChordSegment extends IChordStretch {
    beatIdx: number;
    subbeatIdx: number;
    chord: string;
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
    subbeatIdx?: number;
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
    extend?: (baseNotes: Note[]) => Note[];
}