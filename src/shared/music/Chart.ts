import * as Mongo from "mongodb";
import * as Util from "../Util";
import * as MusicHelper from "../music/MusicHelper";
import { IChartBar, Feel, NoteName, Tempo, IMusicIdx, IChordStretch, IChordSegment, ChordName, ChordShape, RelativeNoteName, TimeSignature, ISong } from "../types";
import { Domain } from "./domain/Domain";
import { Chord } from "./domain/ChordClass";
import { BAR_LIMIT, MAX_TITLE_LENGTH, MAX_BPM, MIN_BPM } from "../Constants";

interface IKeyCount {
    key: NoteName | RelativeNoteName;
    count: number;
    asMajorCount: number;
    asRelativeMajorCount: number;
    asTonicFirstChord: "Major" | "Minor" | undefined;
    asTonicLastChord: "Major" | "Minor" | undefined;
};

class Chart {
    public static barsAreEqual = (b1: IChartBar, b2: IChartBar, ignoreKeysAndSubbeats = true) => {
        let s = JSON.stringify;

        if (!ignoreKeysAndSubbeats) {
            return s(b1) === s(b2);
        }

        if (b1.barIdx !== b2.barIdx) {
            return false;
        }

        if (s(b1.timeSignature) !== s(b2.timeSignature)) {
            return false;
        }

        if (b1.chordSegments.length !== b2.chordSegments.length) {
            return false;
        }

        for (let i = 0; i < b1.chordSegments.length; i ++) {
            if (b1.chordSegments[i].beatIdx !== b2.chordSegments[i].beatIdx) {
                return false;
            }
            
            if (s(b1.chordSegments[i].chordName) !== s(b2.chordSegments[i].chordName)) {
                return false;
            }
        }

        return true;
    }

    public static validTempo = (tempo: Tempo) => {
        if (!Array.isArray(tempo) || tempo.length !== 2) {
            return false;
        }

        if (tempo[0] < MIN_BPM) {
            return false;
        }

        if (tempo[0] > MAX_BPM) {
            return false;
        }

        if (tempo[1] !== 4) {
            return false;
        }

        return true;
    }

    public static validTimeSignature = (timeSignature: TimeSignature) => {
        if (!Array.isArray(timeSignature) || timeSignature.length !== 2) {
            return false;
        }

        if ([3, 4, 5, 6, 7].indexOf(timeSignature[0]) === -1) {
            return false;
        }

        if (timeSignature[1] !== 4) {
            return false;
        }

        return true;
    }

    public static validRelativeNoteName = (noteName: RelativeNoteName) => {
        return Domain.RELATIVE_NOTE_NAMES.indexOf(noteName) !== -1;
    }

    public static validNoteName = (noteName: NoteName) => {
        return Domain.NOTE_NAMES.indexOf(noteName) !== -1;
    }

    public static validChordShape = (shape: ChordShape) => {
        for (let shapeKey in ChordShape) {
            if (shape === ChordShape[shapeKey]) {
                return true;
            }
        }

        return false;
    }

    public static validRelativeChordName = (chordName: ChordName) => {
        if (!Array.isArray(chordName) || chordName.length !== 2) {
            return false;
        }

        if (!Chart.validRelativeNoteName(chordName[0] as RelativeNoteName)) {
            return false;
        }

        if (!Chart.validChordShape(chordName[1])) {
            return false;
        }

        return true;
    }

    public static validChordSegments = (chordSegments: IChordSegment[], timeSignature: TimeSignature) => {
        if (!Array.isArray(chordSegments) || chordSegments.length === 0 || chordSegments.length > timeSignature[0]) {
            return false;
        }

        let prevBeatIdx = -1;

        for (let i = 0; i < chordSegments.length; i ++) {
            let segment = chordSegments[i];

            if (typeof segment !== "object") {
                return false;
            }

            for (let prop in segment) {
                if (prop !== "beatIdx" && prop !== "chordName") {
                    return false;
                }
            }

            let { beatIdx, chordName } = segment;
            beatIdx = beatIdx as number;
            chordName = chordName as ChordName;

            if (!Number.isInteger(beatIdx)) {
                return false;
            }

            if (i === 0 && beatIdx !== 0) {
                return false;
            } else if (beatIdx <= prevBeatIdx || beatIdx >= timeSignature[0]) {
                return false;
            }

            prevBeatIdx = beatIdx;

            if (!Chart.validRelativeChordName(chordName)) {
                return false;
            }
        }

        return true;
    }

    public static validBaseBars = (baseBars: IChartBar[]) => {
        if (!Array.isArray(baseBars) || baseBars.length === 0 || baseBars.length > BAR_LIMIT) {
            return false;
        }

        for (let i = 0; i < baseBars.length; i ++) {
            let bar = baseBars[i];

            if (typeof bar !== "object") {
                return false;
            }

            for (let prop in bar) {
                if (prop !== "timeSignature" && prop !== "chordSegments") {
                    return false;
                }
            }

            let { timeSignature, chordSegments } = bar;

            if (!Chart.validTimeSignature(timeSignature)) {
                return false;
            }

            if (!Chart.validChordSegments(chordSegments, timeSignature)) {
                return false;
            }
        }

        return true;
    }

    public static validChart = (chart: ISong) => {
        if (typeof chart !== "object") {
            return false;
        }

        for (let prop in chart) {
            if ([ "title", "originalContext", "originalTempo", "barsBase", "_id", "userId" ].indexOf(prop) === -1) {
                return false;
            }
        }

        let { title, originalContext, originalTempo, barsBase } = chart;

        if (typeof title !== "string" || title.length > MAX_TITLE_LENGTH) {
            return false;
        }

        if (!Chart.validNoteName(originalContext as NoteName)) {
            return false;
        }

        if (!Chart.validTempo(originalTempo as Tempo)) {
            return false;
        }

        if (!Chart.validBaseBars(barsBase as IChartBar[])) {
            return false;
        }

        return true;
    }
    
    public static addKeysToBars = (bars: IChartBar[], contextualized = false, topKey = Chart.getMostCommonSuitableKey(bars).key) => {
        if (!Array.isArray(bars) || bars.length === 0) {
            return;
        }

        let noteSet: (RelativeNoteName | NoteName)[] = Domain.RELATIVE_NOTE_NAMES;
        if (contextualized) {
            noteSet = Domain.NOTE_NAMES;
        }

        interface IStretchKeyPossibilities {
            keys: (RelativeNoteName | NoteName)[];
            segmentCount: number;
        }

        let keyStretches: IStretchKeyPossibilities[] = [];        
        let possibleChordKeys: Array<(RelativeNoteName | NoteName)[]> = [];
        let keyStretchPossibilities: IStretchKeyPossibilities[] = [];
        let currentStretchPossibility: IStretchKeyPossibilities;

        // Get the possible keys per chord segment
        bars.forEach(barBase => {
            barBase.chordSegments.forEach(segment => { 
                possibleChordKeys = [ 
                    ...possibleChordKeys, 
                    Chord.getSuitableKeys(segment.chordName as ChordName) as (RelativeNoteName | NoteName)[] 
                ]; 
            }); 
        }); 

        // Get the possible keys per key stretch
        currentStretchPossibility = { 
            keys: possibleChordKeys[0].indexOf(topKey) !== -1 ? [topKey] : possibleChordKeys[0], 
            segmentCount: 1 
        };

        for (let i = 1; i < possibleChordKeys.length; i ++) {
            let chordKeys = possibleChordKeys[i];
            let keyOverlap = currentStretchPossibility.keys.filter(key => chordKeys.indexOf(key) !== -1);

            if (keyOverlap.length === 0) {
                keyStretchPossibilities.push(currentStretchPossibility);
                currentStretchPossibility = { 
                    keys: chordKeys.indexOf(topKey) !== -1 ? [ topKey ] : chordKeys, 
                    segmentCount: 1 
                };
            } else {
                currentStretchPossibility.keys = keyOverlap;
                currentStretchPossibility.segmentCount ++;
            }
        }

        keyStretchPossibilities.push(currentStretchPossibility);

        // Now pick the best key possibility per key stretch
        currentStretchPossibility = keyStretchPossibilities[0];
        let stretchIdx = 0;
        let segmentCount = 0;
        let tonicFound: RelativeNoteName | NoteName | undefined;
        let tonicFoundForSixth: RelativeNoteName | NoteName | undefined;
        
        bars.forEach(barBase => {
            barBase.chordSegments.forEach(segment => { 
                let { chordName } = segment;
                let base = (chordName as ChordName)[0] as RelativeNoteName | NoteName;
                let minorThirdAboveBase = noteSet[Util.mod(noteSet.indexOf(base) + 4, 12)];

                if (currentStretchPossibility.keys.indexOf(base) !== -1) {
                    tonicFound = base;
                }

                if (currentStretchPossibility.keys.indexOf(minorThirdAboveBase) !== -1) {
                    tonicFoundForSixth = minorThirdAboveBase;
                }

                segmentCount ++;

                if (segmentCount === currentStretchPossibility.segmentCount) {
                    if (tonicFound) {
                        keyStretches.push({ keys: [tonicFound], segmentCount });
                    } else if (tonicFoundForSixth) {
                        keyStretches.push({ keys: [tonicFoundForSixth], segmentCount })
                    } else {

                        let chosenKey: NoteName | RelativeNoteName;
                        if (keyStretches.length > 0) {
                            let prevKey = keyStretches[keyStretches.length - 1].keys[0];
                            chosenKey = MusicHelper.pickClosestKey(prevKey, currentStretchPossibility.keys) as NoteName | RelativeNoteName;
                        } else {
                            chosenKey = currentStretchPossibility.keys[0];
                        }
                        keyStretches.push({ keys: [chosenKey], segmentCount });
                    }

                    stretchIdx ++;
                    currentStretchPossibility = keyStretchPossibilities[stretchIdx];
                    segmentCount = 0;
                    tonicFound = undefined;
                    tonicFoundForSixth = undefined;
                }
            }); 
        });

        // Add the key attribute to each segment
        stretchIdx = 0;
        segmentCount = 0;
        bars.forEach(barBase => {
            barBase.chordSegments.forEach(segment => {
                segment.key = keyStretches[stretchIdx].keys[0];
                segmentCount ++;

                if (segmentCount === keyStretches[stretchIdx].segmentCount) {
                    stretchIdx ++;
                    segmentCount = 0;
                }
            });
        });
    }

    public static getMostCommonSuitableKey(bars: IChartBar[]) {
        let barIdx = 0;
        let keyCounts = bars.reduce((keyCountsAcc, currBar) => {
            for (let segIdx = 0; segIdx < currBar.chordSegments.length; segIdx ++) {
                let seg = currBar.chordSegments[segIdx];
                for (let key of Chord.getSuitableKeys(seg.chordName as ChordName)) {
                    let keyCountIdx = keyCountsAcc.findIndex(k => k.key === key);
                    let isMajor = (seg.chordName as ChordName)[0] === key;
                    let isMinor = (seg.chordName as ChordName)[0] === Domain.getRelativeMinor(key as NoteName | RelativeNoteName);
                    let asTonicFirstChord = barIdx === 0 && segIdx === 0 ? (isMajor ? "Major" : (isMinor ? "Minor" : undefined)) : undefined as "Major" | "Minor" | undefined;;
                    let asTonicLastChord = barIdx === bars.length - 1 && segIdx === currBar.chordSegments.length - 1 ? (isMajor ? "Major" : (isMinor ? "Minor" : undefined)) : undefined as "Major" | "Minor" | undefined;

                    if (keyCountIdx === -1) {
                        keyCountsAcc.push({ 
                            key, 
                            count: 1, 
                            asMajorCount: isMajor ? 1 : 0, 
                            asRelativeMajorCount: isMinor ? 1 : 0,
                            asTonicFirstChord,
                            asTonicLastChord
                        }) 
                    } else {
                        keyCountsAcc[keyCountIdx].count ++;
                        keyCountsAcc[keyCountIdx].asMajorCount += isMajor ? 1 : 0;
                        keyCountsAcc[keyCountIdx].asRelativeMajorCount += isMinor ? 1 : 0;
                        if (asTonicFirstChord) keyCountsAcc[keyCountIdx].asTonicFirstChord = asTonicFirstChord;
                        if (asTonicLastChord) keyCountsAcc[keyCountIdx].asTonicLastChord = asTonicLastChord;
                    }
                }
            }

            barIdx ++;

            return keyCountsAcc;
        }, [] as IKeyCount[]);

        keyCounts.forEach(count => {
            let asMajor = count.asMajorCount;
            let asMinor = count.asRelativeMajorCount;

            switch (count.asTonicFirstChord) {
                default:
                    break;

                case "Major":
                    count.asMajorCount += asMajor;
                    break;
                
                case "Minor":
                    count.asRelativeMajorCount += asMinor;
                    break;
            }

            switch (count.asTonicLastChord) {
                default:
                    break;

                case "Major":
                    count.asMajorCount += asMajor;
                    break;
                
                case "Minor":
                    count.asRelativeMajorCount += asMinor;
                    break;
            }
        });

        keyCounts.sort((a, b) => { 
            let bAsTonic = Math.max(b.asMajorCount, b.asRelativeMajorCount);
            let aAsTonic = Math.max(a.asMajorCount, a.asRelativeMajorCount);
            return ((b.count + bAsTonic) - (a.count + aAsTonic)) || bAsTonic - aAsTonic;
        });

        return keyCounts[0];
    }

    private _songId?: Mongo.ObjectId | string;
    private _barsBase: IChartBar[];
    private _bars: IChartBar[];
    private _chordStretches?: IChordStretch[];
    private _chordStretchesInRange?: IChordStretch[];
    private _context: NoteName;
    private _contextQuality: "Major" | "Minor";
    private _tempo?: Tempo;
    private _feel?: Feel;
    private _externalUpdate?: () => void;
    private _rangeStartIdx: number;
    private _rangeEndIdx: number;
    private _durationInSubbeats: number;
    private _rangeDurationInSubbeats: number;

    constructor(
        externalUpdate?: () => void, 
        barsBase: IChartBar[] = [], 
        context?: NoteName, 
        tempo?: Tempo,
        feel?: Feel,
        rangeStartIdx = 0, 
        rangeEndIdx = barsBase.length - 1,
        id?: Mongo.ObjectId | string
    ) {

        this._songId = id;
        this._tempo = tempo;
        this._externalUpdate = externalUpdate;
        this._rangeStartIdx = rangeStartIdx;
        this._rangeEndIdx = rangeEndIdx;

        if (barsBase.length > 0) {
            let topKeyCount = Chart.getMostCommonSuitableKey(barsBase);
            this._contextQuality = topKeyCount.asMajorCount >= topKeyCount.asRelativeMajorCount ? "Major" : "Minor";
            Chart.addKeysToBars(barsBase, !context, topKeyCount.key);
        }

        // If a context has been provided, assume that this Chart is being
        // used in play mode
        if (context) {
            this._barsBase = barsBase;
            this._context = context;

        // Otherwise, assume this Chart is being used in create mode
        } else {
            this._bars = barsBase;
            this._setContextAndBaseBarsFromBars();
        }

        this._feel = feel || this.suitableFeels[0];
        
        // Build the contextualized, time adjusted bars
        this._resetBarsAndChordStretches();

        if (externalUpdate) {
            externalUpdate();
        }
    }

    /**
     * GETTERS
     */

    get songId() {
        return this._songId;
    }

    get bars(): IChartBar[] {
        return this._bars;
    }

    get barsInRange(): IChartBar[] {
        return this._bars.filter(
            (bar: IChartBar, idx: number) => this.barIdxIsInRange(idx)
        );
    }

    get chordStretches() {
        return this._chordStretches;
    }

    get chordStretchesInRange() {
        return this._chordStretchesInRange;
    }

    get context(): NoteName {
        return this._context;
    }

    get tempo() {
        return this._tempo;
    }

    get feel() {
        return this._feel;
    }

    get rangeStartIdx(): number {
        return this._rangeStartIdx;
    }

    get rangeEndIdx(): number {
        return this._rangeEndIdx;
    }

    get firstBarInRange(): IChartBar {
        return this._bars[this._rangeStartIdx];
    }

    get lastBarInRange(): IChartBar {
        return this._bars[this._rangeEndIdx];
    }

    get durationInSubbeats() {
        return this._durationInSubbeats;
    }

    get suitableFeels() {
        if (!this._barsBase) {
            return [];
        }

        let swingIsSuitableReduction = (suitableSoFar: boolean, bar: IChartBar) => { 
            return (
                suitableSoFar && 
                (bar.timeSignature[1] === 4 || (bar.timeSignature[1] === 8 && bar.timeSignature[0] % 2) === 0)
            );
        };

        let swingIsSuitable = this._barsBase.reduce(swingIsSuitableReduction, true);

        return (
            swingIsSuitable
                ? [Feel.Swing]
                : []
        );
    }

    get barsBase() {
        this._stripBarsBase();
        return this._barsBase;
    }

    get contextQuality(): "Major" | "Minor" {
        return this._contextQuality;
    }

    /**
     * SETTERS
     */

    set context(newContext: NoteName) {
        this._context = newContext;
        this._resetBarsAndChordStretches();
        this._runExternalUpdate();
    }

    set tempo(newTempo: Tempo | undefined) {
        this._tempo = newTempo;
        this._runExternalUpdate();
    }

    set feel(newFeel: Feel | undefined) {
        this._feel = newFeel;
        this._resetBarsAndChordStretches();
        this._runExternalUpdate();
    }

    set rangeStartIdx(newIdx: number) {
        this._rangeStartIdx = newIdx;
        this._buildChordStretches();
        this._runExternalUpdate();
    }

    set rangeEndIdx(newIdx: number) {
        this._rangeEndIdx = newIdx;
        this._buildChordStretches();
        this._runExternalUpdate();
    }

    public forEachBarInRange = (callback: (bar: IChartBar, idx: number) => void) => {
        for (let barIdx = this._rangeStartIdx; barIdx <= this._rangeEndIdx; barIdx ++) {
            callback(this._bars[barIdx], barIdx);
        }
    }

    public barIdxIsInRange = (idx: number): boolean => (
        this._rangeStartIdx <= idx &&
        idx <= this._rangeEndIdx
    )

    public segmentAtIdx = (idx: IMusicIdx) => {
        let { barIdx, segmentIdx } = this._completeMusicIdx(idx);
        return this._bars[barIdx].chordSegments[segmentIdx as number];
    }

    public nextSegmentAtIdx = (idx: IMusicIdx) => {
        let { barIdx, segmentIdx } = this._completeMusicIdx(idx);
        segmentIdx = segmentIdx as number;

        let bar = this._bars[barIdx];
        if (segmentIdx < bar.chordSegments.length - 1) {
            return bar.chordSegments[segmentIdx + 1];
        }
        if (barIdx < this._bars.length - 1) {
            return this._bars[barIdx + 1].chordSegments[0];
        }
        return;
    }

    public keyAtIdx = (idx: IMusicIdx) => {
        return this.segmentAtIdx(idx).key;
    }

    public absSubbeatIdxToMusicIdx = (absIdx: number): IMusicIdx | null => {

        if (!Number.isInteger(absIdx)) {
            return null;
        }

        let totalSubbeatCount = 0;

        for (let barIdx = 0; barIdx < this._bars.length; barIdx ++) {
            let bar = this._bars[barIdx];
            let barSubbeatCount = 0;
            
            for (let segmentIdx = 0; segmentIdx < bar.chordSegments.length; segmentIdx ++) {
                let segment = bar.chordSegments[segmentIdx];
                let segmentDuration = segment.durationInSubbeats as number;

                totalSubbeatCount += segmentDuration; 

                if (totalSubbeatCount > absIdx) {
                    return {
                        barIdx,
                        segmentIdx,
                        subbeatIdx: barSubbeatCount + segmentDuration - (totalSubbeatCount - absIdx) 
                    }
                }     
                
                barSubbeatCount += segmentDuration;   
            }
        }

        return null;
    }

    public musicIdxToAbsSubbeatIdx = (musicIdx: IMusicIdx): number | null => {

        if (!musicIdx || !Number.isInteger(musicIdx.barIdx) || !Number.isInteger(musicIdx.subbeatIdx as number)) {
            return null;
        }

        musicIdx.subbeatIdx = musicIdx.subbeatIdx as number;

        if (musicIdx.barIdx < 0 || musicIdx.barIdx >= this._bars.length) {
            return null;
        }

        let currBar = this._bars[musicIdx.barIdx];

        if (musicIdx.subbeatIdx < 0 || musicIdx.subbeatIdx >= (currBar.durationInSubbeats as number)) {
            return null;
        }

        let absSubbeatIdx = musicIdx.subbeatIdx;

        for (let barIdx = 0; barIdx < musicIdx.barIdx; barIdx ++) {
            absSubbeatIdx += this._bars[barIdx].durationInSubbeats as number;
        }

        return absSubbeatIdx;
    }

    public addBar = (idx: number, bar?: IChartBar) => {
        if (!Number.isInteger(idx) || idx < 0 || idx > this._bars.length) {
            return;
        }

        if (!bar) {
            bar = this._getExtendedBar(idx);
        }

        if (!bar) {
            return;
        }

        if (idx === this._bars.length) {
            this._bars.push(bar);
        } else {
            this._bars.splice(idx, 0, bar);
        }   

        this._onDirectBarsChange();
    }

    public updateBar = (idx: number, bar: IChartBar) => {
        if (!Number.isInteger(idx) || idx < 0 || idx >= this._bars.length) {
            return;
        }

        this._bars[idx] = bar;
        this._onDirectBarsChange();
    }

    public deleteBar = (idx: number) => {
        if (!Number.isInteger(idx) || idx < 0 || idx >= this._bars.length) {
            return;
        }

        this._bars.splice(idx, 1);
        this._onDirectBarsChange();
    }

    public resetBarsBaseFromBars = () => {
        this._onDirectBarsChange();
    }

    /**
     * PRIVATE
     */

    private _getExtendedBar = (idx: number) => {
        if (idx <= 0 || idx > this._bars.length) {
            return;
        }

        let barToExtend = this._bars[idx - 1];
        let segmentToExtend = barToExtend.chordSegments[barToExtend.chordSegments.length - 1];

        let newBar: IChartBar = {
            barIdx: idx,
            timeSignature: barToExtend.timeSignature,
            chordSegments: [],
        }

        newBar.chordSegments.push({
            beatIdx: 0,
            chordName: segmentToExtend.chordName,
            key: segmentToExtend.key
        });

        return newBar;
    }

    private _resetBarsAndChordStretches = () => {
        this._resetBars();
        this._buildChordStretches();
    }

    private _resetBars = () => {
        if (this._barsBase) {
            this._bars = MusicHelper.contextualizeOrDecontextualizeBars(
                this._barsBase,
                this._context
            );
    
            if (this._feel) {
                this._bars = MusicHelper.adjustBarTimes(
                    this._bars,
                    this._feel
                );
                this._calculateChartDuration();
            }

            this._updateBarIndices();
        }
    }

    private _calculateChartDuration = () => {
        if (this._feel) {
            this._durationInSubbeats = 0;
            this._rangeDurationInSubbeats = 0;
            this._bars.forEach((bar, barIdx) => { 
                let barDuration = bar.durationInSubbeats as number;
                this._durationInSubbeats += barDuration;

                if (this.barIdxIsInRange(barIdx)) {
                    this._rangeDurationInSubbeats += barDuration;
                }
            });
        }   
    }

    private _buildChordStretches = () => {
        this._chordStretches = [];
        this._chordStretchesInRange = [];
        let subbeatsBeforeChange = 0;
        let subbeatsBeforeChangeInRange = 0;

        // TODO: shouldn't depend on bars having subbeat to get chord stretches
        if (this._feel && this._bars.length > 0) {
            this._bars.forEach(bar => {
                bar.chordSegments.forEach((segment, segIdx) => {

                    let segSubbeatsBeforeChange = segment.subbeatsBeforeChange as number;
                    let segDuration = segment.durationInSubbeats as number;

                    // Chord Stretches
                    
                    if (subbeatsBeforeChange === 0) {
                        subbeatsBeforeChange = segSubbeatsBeforeChange;
                        (this._chordStretches as IChordStretch[]).push({
                            chordName: segment.chordName,
                            key: segment.key,
                            durationInSubbeats: subbeatsBeforeChange
                        });
                    }
                    subbeatsBeforeChange -= segDuration;

                    // Chord Stretches In Range

                    if (this.barIdxIsInRange(bar.barIdx)){

                        // Make sure to cut the last stretch off if necessary
                        let rangeStretches = this._chordStretchesInRange as IChordStretch[];

                        if (
                            bar.barIdx === this.rangeEndIdx && 
                            segIdx === bar.chordSegments.length - 1 &&
                            rangeStretches.length > 0 &&
                            !Chord.chordNamesAreEqual(segment.chordName as ChordName, rangeStretches[rangeStretches.length - 1].chordName as ChordName)
                        ) {
                            (this._chordStretchesInRange as IChordStretch[]).push({
                                chordName: segment.chordName,
                                key: segment.key,
                                durationInSubbeats: segment.durationInSubbeats
                            });

                        } else if (subbeatsBeforeChangeInRange === 0) {
                            subbeatsBeforeChangeInRange = segSubbeatsBeforeChange;
                            (this._chordStretchesInRange as IChordStretch[]).push({
                                chordName: segment.chordName,
                                key: segment.key,
                                durationInSubbeats: subbeatsBeforeChangeInRange
                            });
                        }

                        subbeatsBeforeChangeInRange -= segDuration;
                    } 
                });
            });
        }

        this._calculateChartDuration();

        // There may be only one chord stretch, in which case its 
        // durationInSubbeats property should be the same as that 
        // on the whole chart
        if (this._chordStretches.length === 1) {
            this._chordStretches[0].durationInSubbeats = this._durationInSubbeats;
        }

        if (this._chordStretchesInRange.length === 1) {
            this._chordStretchesInRange[0].durationInSubbeats = this._rangeDurationInSubbeats;
        }
    }

    private _onDirectBarsChange = () => {
        if (this._bars.length > 0) {
            this._updateBarIndices();
            Chart.addKeysToBars(this._bars, true);
            this._setContextAndBaseBarsFromBars();
            this._resetBarsAndChordStretches();
            this._runExternalUpdate();
        }
    }

    private _updateBarIndices = () => {
        this._bars.forEach((bar, barIdx) => bar.barIdx = barIdx);
    }

    // This can be used when the _bars attribute is already contextualized and its keys
    // have already been determined using _addKeysToBars
    private _setContextAndBaseBarsFromBars = () => {
        if (!Array.isArray(this._bars) || this._bars.length === 0) {
            return;
        }

        let topKeyCount = Chart.getMostCommonSuitableKey(this._bars);

        this._context = (
            topKeyCount.asMajorCount >= topKeyCount.asRelativeMajorCount 
                ? topKeyCount.key
                : Domain.getRelativeMinor(topKeyCount.key)
        ) as NoteName;

        this._barsBase = MusicHelper.contextualizeOrDecontextualizeBars(this._bars, this._context, true);
        this._stripBarsBase();
    }

    // Prepares barsBase to be sent to server by stripping it of all 
    // superfluous properties
    private _stripBarsBase = () => {
        if (!Array.isArray(this._barsBase)) {
            return;
        }

        for (let barIdx = 0; barIdx < this._barsBase.length; barIdx ++) {
            delete this._barsBase[barIdx]["barIdx"];
            delete this._barsBase[barIdx]["durationInSubbeats"];

            for (let segIdx = 0; segIdx < this._barsBase[barIdx].chordSegments.length; segIdx ++) {
                delete this._barsBase[barIdx].chordSegments[segIdx]["key"];
                delete this._barsBase[barIdx].chordSegments[segIdx]["subbeatIdx"];
                delete this._barsBase[barIdx].chordSegments[segIdx]["durationInSubbeats"];
                delete this._barsBase[barIdx].chordSegments[segIdx]["subbeatsBeforeChange"];
                delete this._barsBase[barIdx].chordSegments[segIdx]["durationInBeats"];
            }
        }
    }
    
    private _completeMusicIdx = (idx: IMusicIdx) => {
        if (idx.segmentIdx || !this._feel) {
            return idx;
        }

        let bar = this._bars[idx.barIdx];
        let subbeatCount = bar.chordSegments[0].durationInSubbeats as number;
        let segmentIdx = 0; 

        while (subbeatCount <= (idx.subbeatIdx as number)) {
            segmentIdx ++;
            subbeatCount += bar.chordSegments[segmentIdx].durationInSubbeats as number; 
        }

        return { ...idx, segmentIdx };
    }

    private _runExternalUpdate = () => {
        if (this._externalUpdate) {
            this._externalUpdate();
        }
    }
}

export default Chart;