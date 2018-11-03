import * as Util from "../../Util";
import { contextualize, voicingContainsNoClusters } from '../../music/MusicHelper';
import { Domain } from "./Domain";
import { Note } from "./Note";
import { NoteName, ChordName, ChordShape, IShapeInfo, RelativeNoteName, INoteChange } from "../../types";
import { Scale } from "./ScaleClass";

export class Chord extends Domain {
    public static shapeToInfo = (shape: ChordShape): IShapeInfo => {
        let infoBase: IShapeInfo;
        let extension: INoteChange[] = [];
        switch (shape) {
    
            /**
             * MAJOR
             */
    
            case ChordShape.Maj:
                return {
                    shape,
                    baseIntervals: [0, 4, 7],
                    relativeTonicPositions: ["1", "4", "5"]
                };
    
            case ChordShape.Maj6:
                infoBase = Chord.shapeToInfo(ChordShape.Maj);
                extension[13] = { target: "6" };
                return { ...infoBase, extension };
    
            case ChordShape.Maj7:
                return {
                    shape,
                    baseIntervals: [0, 4, 7, 11],
                    relativeTonicPositions: ["1", "4"]
                };
    
            case ChordShape.Maj9:
                infoBase = Chord.shapeToInfo(ChordShape.Maj7);
                extension[9] = { target: "2" };
                return { ...infoBase, extension };
    
            case ChordShape.Add9:
                infoBase = Chord.shapeToInfo(ChordShape.Maj);
                extension[9] = { target: "2" };
                return { ...infoBase, extension };

            case ChordShape.b9:
                infoBase = Chord.shapeToInfo(ChordShape.Maj);
                extension[9] = { target: "H" };
                return { ...infoBase, extension };
    
            case ChordShape.Majb5:
                infoBase = Chord.shapeToInfo(ChordShape.Maj);
                extension[5] = { target: "T", origin: "5" };
                return { ...infoBase, extension };
    
            case ChordShape.Maj7b5:
                infoBase = Chord.shapeToInfo(ChordShape.Maj7);
                extension[5] = { target: "T", origin: "5" };
                return { ...infoBase, extension };
    
            case ChordShape.Maj7$5:
                infoBase = Chord.shapeToInfo(ChordShape.Maj7);
                extension[5] = { target: "U", origin: "5" };
                return { ...infoBase, extension };
    
            case ChordShape.Maj7b9:
                infoBase = Chord.shapeToInfo(ChordShape.Maj7);
                extension[9] = { target: "H", origin: "2" };
                return { ...infoBase, extension };
            
            case ChordShape.Maj$9:
                infoBase = Chord.shapeToInfo(ChordShape.Maj);
                extension[9] = { target: "N", origin: "2" };
                return { ...infoBase, extension };
            
            case ChordShape.Majb9:
                infoBase = Chord.shapeToInfo(ChordShape.Maj);
                extension[9] = { target: "H", origin: "2" };
                return { ...infoBase, extension };
    
            case ChordShape.Maj7$9:
                infoBase = Chord.shapeToInfo(ChordShape.Maj7);
                extension[9] = { target: "N", origin: "2" };
                return { ...infoBase, extension };
    
            case ChordShape.Maj7$11:
                infoBase = Chord.shapeToInfo(ChordShape.Maj7);
                extension[11] = { target: "T", origin: "4" };
                return { ...infoBase, extension };
    
            /**
             * MINOR
             */
    
            case ChordShape.Min:
                return {
                    shape,
                    baseIntervals: [0, 3, 7],
                    relativeTonicPositions: ["2", "3", "6"]
                };
    
            case ChordShape.Min6: 
                infoBase = Chord.shapeToInfo(ChordShape.Min);
                extension[13] = { target: "6" };
                return { ...infoBase, extension };
    
            case ChordShape.Min7:
                return {
                    shape,
                    baseIntervals: [0, 3, 7, 10],
                    relativeTonicPositions: ["2", "3", "6"]
                };
    
            case ChordShape.Min9: 
                infoBase = Chord.shapeToInfo(ChordShape.Min7);
                extension[9] = { target: "2" };
                return { ...infoBase, extension };
    
            case ChordShape.Min11: 
                infoBase = Chord.shapeToInfo(ChordShape.Min7);
                extension[11] = { target: "4" };
                return { ...infoBase, extension };
    
            case ChordShape.Min$5: 
                infoBase = Chord.shapeToInfo(ChordShape.Min);
                extension[5] = { target: "U", origin: "5" };
                return { ...infoBase, extension };
    
            case ChordShape.Min7b5: 
                infoBase = Chord.shapeToInfo(ChordShape.Min7);
                extension[5] = { target: "T", origin: "5" };
                return { ...infoBase, extension };
    
            case ChordShape.Min7$5: 
                infoBase = Chord.shapeToInfo(ChordShape.Min7);
                extension[5] = { target: "U", origin: "5" };
                return { ...infoBase, extension };
    
            case ChordShape.Min7b9: 
                infoBase = Chord.shapeToInfo(ChordShape.Min7);
                extension[9] = { target: "H", origin: "2" };
                return { ...infoBase, extension };   
                
            case ChordShape.Min7$11: 
                infoBase = Chord.shapeToInfo(ChordShape.Min7);
                extension[11] = { target: "T", origin: "4"};
                return { ...infoBase, extension };
    
            case ChordShape.MinMaj7:
                infoBase = Chord.shapeToInfo(ChordShape.Min7);
                extension[7] = { target: "7", origin: "J" };
                return { ...infoBase, extension };
    
            /**
             * DOMINANT
             */
            
            case ChordShape.Dom7:
                return {
                    shape,
                    baseIntervals: [0, 4, 7, 10],
                    relativeTonicPositions: ["5"]
                };
    
            case ChordShape.Dom9:
                infoBase = Chord.shapeToInfo(ChordShape.Dom7);
                extension[9] = { target: "2" };
                return { ...infoBase, extension };
    
            case ChordShape.Dom11:
                infoBase = Chord.shapeToInfo(ChordShape.Dom7);
                extension[11] = { target: "4" };
                return { ...infoBase, extension };
            
            case ChordShape.Dom7b5:
                infoBase = Chord.shapeToInfo(ChordShape.Dom7);
                extension[5] = { target: "T", origin: "5" };
                return { ...infoBase, extension };
    
            case ChordShape.Dom7$5:
                infoBase = Chord.shapeToInfo(ChordShape.Dom7);
                extension[5] = { target: "U", origin: "5" };
                return { ...infoBase, extension };
    
            case ChordShape.Dom7b9:
                infoBase = Chord.shapeToInfo(ChordShape.Dom7);
                extension[9] = { target: "H", origin: "2" };
                return { ...infoBase, extension };
            
            case ChordShape.Dom7$9:
                infoBase = Chord.shapeToInfo(ChordShape.Dom7);
                extension[9] = { target: "N", origin: "2" };
                return { ...infoBase, extension };
    
            case ChordShape.Dom7$11:
                infoBase = Chord.shapeToInfo(ChordShape.Dom7);
                extension[11] = { target: "T", origin: "4" };
                return { ...infoBase, extension };

            case ChordShape.Dom7$5$9:
                infoBase = Chord.shapeToInfo(ChordShape.Dom7);
                extension[5] = { target: "U", origin: "5" };
                extension[9] = { target: "N", origin: "2" };
                return { ...infoBase, extension };

            case ChordShape.Dom713:
                infoBase = Chord.shapeToInfo(ChordShape.Dom7);
                extension[13] = { target: "6" };
                return { ...infoBase, extension };
    
            case ChordShape.Dom9b5:
                infoBase = Chord.shapeToInfo(ChordShape.Dom7);
                extension[9] = { target: "2" };
                extension[5] = { target: "T", origin: "5" };
                return { ...infoBase, extension };
    
            case ChordShape.Dom9$5:
                infoBase = Chord.shapeToInfo(ChordShape.Dom7);
                extension[9] = { target: "2" };
                extension[5] = { target: "U", origin: "5"};
                return { ...infoBase, extension };
    
            /**
             * AUGMENTED
             */
    
            case ChordShape.Aug:
                infoBase = Chord.shapeToInfo(ChordShape.Maj);
                extension[5] = { target: "U", origin: "5"};
                return { ...infoBase, extension };
            
            case ChordShape.Aug7:
                infoBase = Chord.shapeToInfo(ChordShape.Maj);
                extension[5] = { target: "U", origin: "5" };
                extension[7] = { target: "J", origin: "7" };
                return { ...infoBase, extension };
    
            case ChordShape.Aug7$9:
                infoBase = Chord.shapeToInfo(ChordShape.Maj);
                extension[5] = { target: "U", origin: "5" };
                extension[7] = { target: "J", origin: "7" };
                extension[9] = { target: "N", origin: "2" };
                return { ...infoBase, extension };
    
            /**
             * DIMINISHED
             */
    
            case ChordShape.Dim:
                return {
                    shape,
                    baseIntervals: [0, 3, 6],
                    relativeTonicPositions: ["7"]
                };
    
            case ChordShape.Dim7:
                infoBase = Chord.shapeToInfo(ChordShape.Dim);
                extension[7] = { target: "6", origin: "J" };
                return { ...infoBase, extension };
            
            /**
             * SUSPENDED
             */
    
            case ChordShape.Sus2:
                return {
                    shape,
                    baseIntervals: [0, 2, 7],
                    relativeTonicPositions: ["1", "2", "4", "5", "6"]
                };
    
            case ChordShape.Sus4:
                return {
                    shape,
                    baseIntervals: [0, 5, 7],
                    relativeTonicPositions: ["1", "2", "3", "5", "6"]
                };

            case ChordShape.Sus27:
                infoBase = Chord.shapeToInfo(ChordShape.Sus2);
                extension[7] = { target: "J", origin: "7" };
                return { ...infoBase, extension };

            case ChordShape.Sus47:
                infoBase = Chord.shapeToInfo(ChordShape.Sus4);
                extension[7] = { target: "J", origin: "7" };
                return { ...infoBase, extension };

            case ChordShape.Sus29:
                infoBase = Chord.shapeToInfo(ChordShape.Sus2);
                extension[7] = { target: "J", origin: "7" };
                extension[9] = { target: "2" };
                return { ...infoBase, extension };

            case ChordShape.Sus49:
                infoBase = Chord.shapeToInfo(ChordShape.Sus4);
                extension[7] = { target: "J", origin: "7" };
                extension[9] = { target: "2" };
                return { ...infoBase, extension };
    
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

    public static chordNamesAreEqual = (cn1?: ChordName, cn2?: ChordName) => {
        if (!cn1 && !cn2) return true;
        if (!cn1 && cn2) return false;
        if (cn1 && !cn2) return false;
        return (cn1 as ChordName)[0] === (cn2 as ChordName)[0] && (cn1 as ChordName)[1] === (cn2 as ChordName)[1];
    }

    public static canAddWithoutCluster = (notes: Note[], newNote: Note) => {
        let newNotes = [ ...notes, newNote ];
        newNotes.sort((a, b) => a.pitch - b.pitch);

        return voicingContainsNoClusters(newNotes.map(n => n.pitch));
    }

    private _chordName: ChordName;
    private _suitableKeys: NoteName[]; 
    private _order: number;
    private _extension?: INoteChange[];
    private _clusterIndexOrder: [number, number, number];    

    constructor(chordName: ChordName) {
        let [ baseNoteName, shape ] = chordName;

        let { baseIntervals, extension } = Chord.shapeToInfo(shape);

        let lowestPitch = Domain.getLowestPitch((baseNoteName as NoteName));

        let pos = 1;

        let baseNotes = baseIntervals.map((pitchDiff, i) => { 
            pos = 2 * i + 1;
            let pitch = lowestPitch + pitchDiff;
            let required = false;

            if (pos === 3 || pos === 7 || shape === ChordShape.Dim && pos === 5) {
                required = true;
            }

            if (baseIntervals.length < 4 && pos === 1) {
                required = true;
            }

            return new Note(pitch, pos, required);
        });

        let contextualizedExtension: INoteChange[] | undefined = (
            extension
                ? extension.map(change => ({ 
                    target: contextualize(change.target as RelativeNoteName, baseNoteName as NoteName),
                    origin: change.origin ? contextualize(change.origin as RelativeNoteName, baseNoteName as NoteName) : undefined
                }))
                : undefined
        );

        let noteClasses =  Domain.applyExtension(baseNotes, contextualizedExtension);
        super(noteClasses);

        this._chordName = chordName;
        this._extension = contextualizedExtension;
        this._suitableKeys = Chord.getSuitableKeys(chordName) as NoteName[];
        this._order = this.noteClasses.reduce((highest, note) => note.position > highest ? note.position : highest, 0);

        // Set the order in which cluster notes should be dealt with
        this._clusterIndexOrder = [1, 2, 0];
    }

    /**
     * PUBLIC
     */

    public get order() {
        return this._order;
    }

    public get suitableKeys() {
        return this._suitableKeys;
    }

    public get chordName() {
        return this._chordName;
    }

    public applyExtensionToScale(scale: Scale) {

        if (!this._extension) {
            return scale;
        }

        let chordTonic = this.getTonicPitch();
        let scaleTonic = scale.getTonicPitch();
        let posDiff = scale.getPitchPositionDiff(chordTonic, scaleTonic);

        if (!Number.isInteger(posDiff)) {
            return scale;
        }

        let scaleExtension: INoteChange[] = [];      

        this._extension.forEach((change, pos) => {

            // When scaleExtension is passed to scale.mutate,
            // if scaleExtension contains a note name that is already in scale, but the 
            // position of the note name in scaleExtension is different to the position 
            // of the same note in scale, then the position in scale for that note will 
            // be changed in favor of scale extension. SO, if the scale does contain the
            // target name, but does not contain the origin name, ignore the change.
            if (!(scale.hasNote(change.target as NoteName) && !!change.origin && !scale.hasNote(change.origin as NoteName))) {
                let chordPosDiff = pos > 7 ? Util.mod(pos, 8) : (pos - 1);
                let scaleChangePos = 1 + posDiff + chordPosDiff;

                if (scaleChangePos > 7 || scaleChangePos < 1) {
                    scaleChangePos = Util.mod(scaleChangePos, 7);
                } 

                scaleExtension[scaleChangePos] = change;
            }
        });

        scale.mutate(scaleExtension);

        return scale;
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

    /**
     * PRIVATE
     */

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
        let currClusterDisolved: boolean;
        let cluster = this._findLowestNoteCluster(firstCandidate);

        while (cluster) {
            currClusterDisolved = false;
            let topCandidateClusterIdx = firstCandidate.indexOf((cluster as [Note, Note, Note])[2]);

            // Look for a replacement among the candidate notes
            for (let idx of this._clusterIndexOrder) {
                let clusterNote = (cluster as [Note, Note, Note])[idx];
                let candidateClusterNoteIdx = firstCandidate.findIndex(n => n.pitch === clusterNote.pitch);
                
                let replacement = this._findOtherInstance(firstCandidate, clusterNote);
                if (replacement) {
                    firstCandidate.splice(candidateClusterNoteIdx, 1);
                    currClusterDisolved = true;
                    break;
                }
            }

            // Look for a replacement among the other required notes in the range
            if (!currClusterDisolved) {
                for (let idx of this._clusterIndexOrder) {
                    let clusterNote = (cluster as [Note, Note, Note])[idx];
                    let candidateClusterNoteIdx = firstCandidate.findIndex(n => n.pitch === clusterNote.pitch);
    
                    let replacement = this._findOtherInstance(requiredNotesInRange, clusterNote);
                    if (replacement && Chord.canAddWithoutCluster(firstCandidate.filter(n => n.pitch !== clusterNote.pitch), replacement)) {
                        firstCandidate.splice(candidateClusterNoteIdx, 1);
                        firstCandidate.push(replacement.clone());
                        firstCandidate.sort(this._compareNotes);
                        currClusterDisolved = true;
                        break;
                    }
                }
            }

            if (!currClusterDisolved) {
                let choices = [ [0, 1], [1, 1], [2, 1] ] as [ number, number ][];
                let randVar = Util.generateCustomRandomVariable(choices);

                let clusterIdx = topCandidateClusterIdx - randVar();
                firstCandidate.splice(clusterIdx, 1);                
            }

            cluster = this._findLowestNoteCluster(firstCandidate);
        }

        // STEP 4: Remove multiple instances
        let secondCandidate: Note[] = [];
        firstCandidate.forEach(note => {
            let other = this._findOtherInstance(firstCandidate, note);
            if (other) {
                if (
                    !secondCandidate.some(n => n.pitch === note.pitch) && 
                    !secondCandidate.some(n => n.pitch === (other as Note).pitch)
                ) {
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

                if (!this._findOtherInstance(secondCandidate, note) && Chord.canAddWithoutCluster(secondCandidate, note)) {
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
            let note2 = notes[idx + 1];

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
                return note.clone();
            }
        }
        return null;
    }
}