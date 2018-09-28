import * as Util from "../../Util";
import { contextualize } from '../../music/MusicHelper';
import { Domain } from "./Domain";
import { Note } from "./Note";
import { NoteName, ChordName, ChordShape, IShapeInfo, RelativeNoteName } from "../../types";
import { Scale } from "./ScaleClass";

export class Chord extends Domain {
    public static shapeToInfo = (shape: ChordShape): IShapeInfo => {
        let infoBase: IShapeInfo;
        let extension: RelativeNoteName[];
        switch (shape) {
            case ChordShape.Maj:
                return {
                    shape,
                    baseIntervals: [0, 4, 7],
                    relativeTonicPositions: ["1", "4", "5"]
                };
            case ChordShape.Min:
                return {
                    shape,
                    baseIntervals: [0, 3, 7],
                    relativeTonicPositions: ["2", "3", "6"]
                };
            case ChordShape.Maj7:
                return {
                    shape,
                    baseIntervals: [0, 4, 7, 11],
                    relativeTonicPositions: ["1", "4"]
                };
            case ChordShape.Min7:
                return {
                    shape,
                    baseIntervals: [0, 3, 7, 10],
                    relativeTonicPositions: ["2", "3", "6"]
                };
            case ChordShape.Dom7:
                return {
                    shape,
                    baseIntervals: [0, 4, 7, 10],
                    relativeTonicPositions: ["5"]
                };
            case ChordShape.Dom9:
                infoBase = Chord.shapeToInfo(ChordShape.Dom7);
                extension = [];
                extension[9] = "2";
                return { ...infoBase, extension };
            case ChordShape.Dim:
                return {
                    shape,
                    baseIntervals: [0, 3, 6],
                    relativeTonicPositions: ["7"]
                };

            // TODO: add cases for all chords
            
            default: 
                throw new Error(`PRECOMP - error: unkown ChordShape ${shape}`);
        }
    }

    public static getSuitableKeys = ([noteName, shape]: ChordName): Array<RelativeNoteName | NoteName> => {
        let noteNames: Array<RelativeNoteName | NoteName>;
        let { relativeTonicPositions } = Chord.shapeToInfo(shape);

        if (Domain.RELATIVE_NOTE_NAMES.indexOf(noteName as RelativeNoteName) !== -1) {
            noteNames = Domain.RELATIVE_NOTE_NAMES;
        } else if (Domain.NOTE_NAMES.indexOf(noteName as NoteName) !== -1) {
            noteNames = Domain.NOTE_NAMES;
        } else {
            return [];
        }

        let tonicIdx = noteNames.indexOf(noteName);

        return relativeTonicPositions.map(pos => {
            return noteNames[Util.mod(tonicIdx - Domain.RELATIVE_NOTE_NAMES.indexOf(pos), 12)]
        });
    }

    public static chordNamesAreEqual = (cn1: ChordName, cn2: ChordName) => {
        if (!cn1 && !cn2) return true;
        if (!cn1 && cn2) return false;
        if (cn1 && !cn2) return false;
        return cn1[0] === cn2[0] && cn1[1] === cn2[1];
    }

    private _suitableKeys: NoteName[]; 
    private _order: number;
    // private _specialNotesMutation: (notes: Note[]) => Note[];
    private _extension: NoteName[];
    private _clusterIndexOrder: [number, number, number];    

    constructor(chordName: ChordName) {
        let [ baseNoteName, shape ] = chordName;

        let { baseIntervals, extension } = Chord.shapeToInfo(shape);

        let lowestPitch = Domain.getLowestPitch((baseNoteName as NoteName));

        let pos = 1;

        let baseNotes = baseIntervals.map((pitchDiff, i) => { 
            pos = 2 * i + 1;
            let pitch = lowestPitch + pitchDiff;
            let required = pos === 3 || pos === 7
            return new Note(pitch, pos, required);
        });

        let noteClasses = (
            extension
                ? Domain.applyExtension(baseNotes, extension.map(name => contextualize(name, baseNoteName as NoteName)))
                : baseNotes
        );
        super(noteClasses);

        this._suitableKeys = Chord.getSuitableKeys(chordName) as NoteName[];
        this._order = this.noteClasses.reduce((highest, note) => note.position > highest ? note.position : highest, 0);

        // Set the order in which cluster notes should be dealt with
        this._clusterIndexOrder = [1, 2, 0];
    }

    public applyExtensionToScale(scale: Scale) {

        if (!this._extension) {
            return scale;
        }

        let posDiff = scale.getPitchPositionDiff(this.getTonicPitch(), scale.getTonicPitch());

        if (isNaN(posDiff)) {
            return scale;
        }

        let scaleExtension: NoteName[] = [];      

        this._extension.forEach((name, pos) => {

            if (pos > 7) {
                pos -= 7
            }

            scaleExtension[Util.mod(pos - posDiff, 7) + 1] = name;
        });

        scale.mutate(scaleExtension);

        return scale;
    }

    // TODO: should this be a Domain function??
    public getNotesInPitchRange(a: number, b: number, requiredOnly = false) {
        let notesInRange: Note[] = [];
        let idx = this.getClosestNoteToTargetPitch(a)[0];
        for (let note = this._notes[idx]; note.pitch <= b; note = this._notes[++idx]) {
            if (note.pitch >= a) {
                if (requiredOnly) {
                    if (note.isRequired) {
                        notesInRange.push(note);
                    }
                } else {
                    notesInRange.push(note);
                }
            }
        }
        return notesInRange;
    }

    public voice(target: number, ref: number[] = [], nudgeFactor = NaN): number[] {
        return (
            ref.length > 0
                ? this._voiceWithReference(ref, nudgeFactor)
                : this._generateVoicing(target)
        );
    }

    public getFifthPitch(target = NaN, above = true) {
        let lowestFifth = this.getLowestNoteByPosition(5) as Note;
        if (isNaN(target)) {
            return lowestFifth.basePitch;
        }
        return Domain.getPitchInstance(target, lowestFifth.pitch, above);
    }

    private _generateVoicing(target: number, firstChoices: Note[] = []) {

        // STEP 1: Determine pitch range
        let halfWdith = this._order < 9 ? 6 : 9;
        let pitchRange = [ target - halfWdith, target + halfWdith ];

        // STEP 2: Create the arrays of notes that will be needed in further steps
        let neighboursInRange = firstChoices.filter(note => pitchRange[0] <= note.pitch && note.pitch <= pitchRange[1]);
        let nonRequiredNeighboursInRange = neighboursInRange.filter(note => !note.isRequired);
        let notesInRange = this.getNotesInPitchRange(pitchRange[0], pitchRange[1]);
        let requiredNotesInRange = notesInRange.filter(note => note.isRequired);
        let firstCandidate = neighboursInRange.filter(note => note.isRequired);

        firstCandidate = firstCandidate.concat(requiredNotesInRange.filter(note => !firstCandidate.find(n => n.position === note.position)));
        firstCandidate.sort(this._compareNotes);

        // STEP 3: Remove clusters
        let cluster = this._findLowestNoteCluster(firstCandidate);
        while (cluster) {
            let topCandidateClusterIdx = firstCandidate.indexOf((cluster as [Note, Note, Note])[2]);

            // Look for a replacement among the candidate notes
            for (let idx of this._clusterIndexOrder) {
                let clusterNote = (cluster as [Note, Note, Note])[idx];
                let candidateClusterNoteIdx = firstCandidate.indexOf(clusterNote);
                
                let replacement = this._findOtherInstance(firstCandidate, clusterNote);
                if (replacement) {
                    firstCandidate.splice(candidateClusterNoteIdx, 1);
                    break;
                }
            }

            // Look for a replacement among the other required notes in the range
            for (let idx of this._clusterIndexOrder) {
                let clusterNote = (cluster as [Note, Note, Note])[idx];
                let candidateClusterNoteIdx = firstCandidate.indexOf(clusterNote);

                let replacement = this._findOtherInstance(requiredNotesInRange, clusterNote);
                if (replacement) {
                    firstCandidate.splice(candidateClusterNoteIdx, 1);
                    firstCandidate.push(replacement);
                    firstCandidate.sort(this._compareNotes);
                    break;
                }
            }
            cluster = (
                topCandidateClusterIdx < firstCandidate.length - 2 
                    ? this._findLowestNoteCluster(firstCandidate.slice(topCandidateClusterIdx + 1)) 
                    : null
            );
        }

        // STEP 4: Remove multiple instances
        let secondCandidate: Note[] = [];
        firstCandidate.forEach(note => {
            let other = this._findOtherInstance(firstCandidate, note);
            if (other) {
                if (secondCandidate.indexOf(note) === -1 && secondCandidate.indexOf(other) === -1) {
                    if (Math.random() < 0.5) {
                        secondCandidate.push(note);
                    } else {
                        secondCandidate.push(other);
                    }
                }
            } else {
                secondCandidate.push(note);
            }
        });

        // STEP 5: Create the chance for non-required notes to be added
        let remainingSpace = this.numberOfNoteClasses - secondCandidate.length;
        let nonRequiredNotes = (
            nonRequiredNeighboursInRange.length > 0
                ? nonRequiredNeighboursInRange
                : notesInRange.filter(note => !note.isRequired)
        );

        for (let i = 0; i < remainingSpace; i ++) {
            if (Math.random() < 0.5 && nonRequiredNotes.length > 0) {
                let idx = Math.floor(Math.random() * nonRequiredNotes.length);
                let note = nonRequiredNotes[idx];

                if (!this._findOtherInstance(secondCandidate, note)) {
                    secondCandidate.push(note);
                    secondCandidate.sort(this._compareNotes);
                    let nonRequiredNotesIdx = nonRequiredNotes.indexOf(note);
                    nonRequiredNotes.splice(nonRequiredNotesIdx, 1);
                }
            }
        }

        return secondCandidate.map(note => note.pitch);
    }

    private _voiceWithReference(ref: number[], nudgeFactor = NaN) {
        let voicingCandidates = this._getVoicingCandidateNotes(ref);
        let target: number;
        let refAvg = Util.mean(ref);

        if (nudgeFactor > 0) {
            target = Math.round(refAvg + (ref[ref.length - 1] - refAvg) * nudgeFactor);
        } else if (nudgeFactor < 0) {
            target = Math.round(refAvg + (refAvg - ref[0]) * nudgeFactor);
        } else {
            target = Math.round(refAvg);
        }

        return this._generateVoicing(target, voicingCandidates);
    }

    private _getVoicingCandidateNotes(ref: number[] | number) {
        if (Array.isArray(ref)) {
            let reduction = (notes: Note[], pitch: number): Note[] => { 
                let currNotes = this._getVoicingCandidateNotes(pitch);
                return notes.concat(currNotes.filter(note => notes.indexOf(note) === -1));
            };
            return ref.reduce(reduction, []);
        }

        ref = ref as number;
        let canditates: Note[] = []; 

        for (let p = ref - 2; p <= ref + 2; p ++) {
            let closestNote = this.getClosestNoteToTargetPitch(p)[1];
            if (closestNote.pitch === p) {
                canditates.push(closestNote);
            }
        }

        return canditates;
    }

    private _findLowestNoteCluster(notes: Note[]): [Note, Note, Note] | null {
        notes.sort(this._compareNotes);

        let clusterLength = 1;
        let idxLimit = notes.length - 1;

        for (let idx = 0; idx < idxLimit; idx ++) {
            let note1 = notes[idx];
            let note2 = notes[idx];

            if (note1.isCloseNeighboursWith(note2)) {
                clusterLength ++;
                if (clusterLength === 3) {
                    return [notes[idx - 1], note1, note2];
                }
            } else {
                clusterLength = 1;
            }
        }
        return null;
    }   

    private _findOtherInstance(notes: Note[], instance: Note) {
        for (let note of notes) {
            if (note.basePitch === instance.basePitch && note.pitch !== instance.pitch) {
                return note;
            }
        }
        return null;
    }

    get order() {
        return this._order;
    }

    get suitableKeys() {
        return this._suitableKeys;
    }
}