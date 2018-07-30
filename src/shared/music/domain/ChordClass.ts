import * as Util from "../../Util";
import { Domain } from "./Domain";
import { Note } from "./Note";
import { NoteName, ChordName, ChordShape, IShapeInfo, RelativeNoteName } from "../../types";

export class ChordClass extends Domain {
    public static shapeToInfo = (shape: ChordShape): IShapeInfo => {
        let infoBase: IShapeInfo;
        let extend: (notes: Note[]) => Note[];
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
                infoBase = ChordClass.shapeToInfo(ChordShape.Dom7);
                extend = notes => {
                    let notesCopy = Util.copyObject(notes);
                    let tonic = notes.find(note => note.position === 1);
                    let ninth = notes.find(note => note.position === 2 || note.position === 9);
                    if (ninth === undefined) {
                        notesCopy.push(new Note((tonic as Note).basePitch + 2, 9, true).asNoteClass());
                    }
                    return notesCopy;
                };
                return { ...infoBase, extend };
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
        if (Domain.RELATIVE_NOTE_NAMES.indexOf(noteName as RelativeNoteName) !== -1) {
            noteNames = Domain.RELATIVE_NOTE_NAMES;
        } else if (Domain.NOTE_NAMES.indexOf(noteName as NoteName) !== -1) {
            noteNames = Domain.NOTE_NAMES;
        } else {
            return [];
        }

        let { relativeTonicPositions } = ChordClass.shapeToInfo(shape);

        return relativeTonicPositions.map(pos => {
            let tonicIdx = noteNames.indexOf(noteName);
            return noteNames[Util.mod(tonicIdx - noteNames.indexOf(pos), 12)]
        });
    }

    private _suitableKeys: NoteName[]; 
    private _order: number;
    private _specialNotesMutation: (notes: Note[]) => Note[];
    private _clusterIndexOrder: [number, number, number];    

    constructor(chordName: ChordName) {
        let [ noteName, shape ] = chordName;
        let { baseIntervals, extend } = ChordClass.shapeToInfo(shape);
        let lowestPitch = Domain.getLowestPitch((noteName as NoteName));
        let highestPosition = 1;
        let baseNotes = baseIntervals.map((pitchDiff, i): Note => { 
            highestPosition = 2 * i + 1;
            let pitch = lowestPitch + pitchDiff;
            let required = highestPosition === 3 || highestPosition === 7
            return new Note(pitch, highestPosition, required);
        });

        let noteClasses = (extend || Util.identity)(baseNotes);
        super(noteClasses);

        this._suitableKeys = ChordClass.getSuitableKeys(chordName) as NoteName[];
        this._order = highestPosition;
        
        // Build the contextualized specialNotesMutation function
        let notesRemovedFromBase = baseNotes.filter(note => noteClasses.indexOf(note) === -1);
        let notesAddedToBase = noteClasses.filter(note => baseNotes.indexOf(note) === -1);
        this._specialNotesMutation = (notes: Note[]) => {
            let notesCopy = notes.filter(note => notesRemovedFromBase.indexOf(note) === -1);
            notesAddedToBase.forEach(note => notesCopy.push(note));
            return notesCopy;
        };

        // Set the order in which cluster notes should be dealt with
        this._clusterIndexOrder = [1, 2, 0];
    }

    public applyMutation(domain: Domain) {
        let noteClasses = this._specialNotesMutation(domain.noteClasses);
        return new Domain(noteClasses);
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

    public voice(target: number, ref: number[] = []): number[] {
        return (
            ref.length > 0
                ? this._voiceWithReference(ref)
                : this._generateVoicing(target)
        );
    }

    public getTonicPitch(target: number, above = true) {
        let lowestTonic = this.getLowestNoteByPosition(1) as Note;
        return Domain.getPitchInstance(target, lowestTonic.pitch, above);
    }

    public getFifthPitch(target: number, above = true) {
        let lowestFifth = this.getLowestNoteByPosition(5) as Note;
        return Domain.getPitchInstance(target, lowestFifth.pitch, above);
    }

    private _generateVoicing(target: number, firstChoices: Note[] = []) {

        // STEP 1: Determine pitch range(s)
        let pitchRangeSets: [number, number][] = [];
        if (this._order < 9) {
            // If the order of the chord class is 7 or under,
            // there will be only one pitch range: the octave 
            // with target at its center
            pitchRangeSets.push([target - 6, target + 6]);
        } else {
            // Otherwise, the pitch ranges are the possible 9th 
            // intervals between chord note classes (i.e 1 to 9, 
            // 2 to 10, 3 to 11, etc...) that contain the target pitch
            let idxLimit = this.numberOfNoteClasses;
            for (let idx = 0; idx < idxLimit; idx ++) {
                let note1 = this._noteClasses[idx];
                let note2 = this._noteClasses[Util.mod(idx + 1, idxLimit)];
                let positionDiff = note2.position - Util.mod(note1.position, 7);
                if (positionDiff === 1 || positionDiff === 8) {
                    pitchRangeSets.push([
                        Domain.getPitchInstance(target, note1.pitch, false),
                        Domain.getPitchInstance(target, note2.pitch, true)
                    ]);
                }
            }
        }

        // For each pitch range...
        let voicingCandidates = pitchRangeSets.map(range => {

            // STEP 2: Create the arrays of notes that will be needed in further steps
            let neighboursInRange = firstChoices.filter(note => range[0] <= note.pitch && note.pitch <= range[1]);
            let nonRequiredNeighboursInRange = neighboursInRange.filter(note => !note.isRequired);
            let notesInRange = this.getNotesInPitchRange(range[0], range[1]);
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
            
            return secondCandidate;
        });

        // STEP 6: Choose the best voicing of all those in voicingCandidates
        let bestVoicing;
        let greatestNumberOfFirstChoiceNotes = 0;
        voicingCandidates.forEach(candidate => {
            let numberOfFirstChoiceNotes = candidate.filter(note => firstChoices.indexOf(note) !== -1).length;
            if (numberOfFirstChoiceNotes > greatestNumberOfFirstChoiceNotes) {
                bestVoicing = candidate;
            }
        });

        if (!bestVoicing) {
            voicingCandidates.forEach(candidate => {
                if (this._findLowestNoteCluster(candidate) === null) {
                    bestVoicing = candidate;
                }
            });
        }

        if (!bestVoicing) {
            bestVoicing = voicingCandidates[0];
        }

        return bestVoicing.map(note => note.pitch);
    }

    private _voiceWithReference(ref: number[]) {
        let voicingCandidates = this._getVoicingCandidateNotes(ref);
        let target = Math.floor((ref[0] + ref[ref.length - 1]) / 2);
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