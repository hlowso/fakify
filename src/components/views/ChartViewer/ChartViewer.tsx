import React, { Component } from "react";
import * as Cx from "classnames";
import * as Util from "../../../shared/Util";
import * as MusicHelper from "../../../shared/music/MusicHelper";
import { Chord } from "../../../shared/music/domain/ChordClass";
import Chart from "../../../shared/music/Chart";
import { ISong, IMusicIdx, NoteName, Tempo, ChordName } from "../../../shared/types";
import "./ChartViewer.css";

export interface IChartViewerProps {
    editingMode?: boolean;
    song?: ISong;
    chart?: Chart;
    sessionIdx?: IMusicIdx;
    onBarClick?: (barIdx: number) => void;
    onAddBar?: (barIdx: number) => void;
    recontextualize?: (noteName: NoteName) => void;
    resetTempo?: (tempo: Tempo) => void;
    onSongTitleChange?: (updatedTitle: string) => void;
}

export interface IChartViewerState {
    editingTitle?: boolean;
    hoveredBarIdx?: number;
    precedingInsertBarIdx?: number; 
    followingInsertBarIdx?: number;
}

class ChartViewer extends Component<IChartViewerProps, IChartViewerState> {
    constructor(props: IChartViewerProps) {
        super(props);
        this.state = {
            editingTitle: false
        };
    }

    public render(): JSX.Element {
        let { song, chart, editingMode } = this.props;
        let noChartData = Util.objectIsEmpty(song) ||
                        Util.objectIsEmpty(chart);

        if (noChartData) {
            return (<h2>No chart data</h2>);
        }

        return (
            <div id="chart-viewer">
                <header className="chart-header">
                    {!editingMode && this.renderLeftHandSettings()}
                    {this.renderTitle()}
                </header>
                <section className="chart-body">
                    {this.renderProgression()}
                </section>
            </div>
        );
    }

    public renderTitle = () => {
        let { editingMode, song } = this.props;
        let { editingTitle } = this.state;
        return (
            editingTitle 
            ? (
                <form onSubmit={this._onSubmitSongTitleForm} >
                    <input 
                        autoFocus={true}
                        onFocus={(event: React.SyntheticEvent<any>) => (event.target as any).select()}
                        onBlur={this._onSubmitSongTitleForm}
                        value={(song as ISong).title}
                        onChange={(event: React.SyntheticEvent<any>) => this._onSongTitleChange((event.target as any).value)} 
                    />
                </form>
            )
            : (
                <h1 
                    className="song-title"
                    onClick={editingMode ? () => this.setState({ editingTitle: true }) : undefined}
                >
                    {(song as ISong).title}
                </h1>
            )
        );
    }

    private _onSubmitSongTitleForm = (event: React.SyntheticEvent<any>) => {
        event.preventDefault();
        this.setState({ editingTitle: false });
    }

    private _onSongTitleChange = (updatedTitle: string) => {
        let { onSongTitleChange } = this.props;
        if (onSongTitleChange) {
            onSongTitleChange(updatedTitle);
        }
    }

    /**
     * PROGRESSION
     */

    public renderProgression = (): JSX.Element[] => {
        let { chart, sessionIdx, editingMode } = this.props;
        let { bars, rangeStartIdx, rangeEndIdx } = chart as Chart;
        let { hoveredBarIdx, precedingInsertBarIdx, followingInsertBarIdx } = this.state;
        let renderBars: JSX.Element[] = [];

        if (bars && bars.length > 0) {
            let baseKey = bars[0].chordSegments[0].key;
            let chordName: ChordName;
            let prevChordName: ChordName;

            bars.forEach((bar, i) => {
                let chordNameElements = [];
                let beatElements = [];
                let isCurrentlyPlayingBar = sessionIdx && sessionIdx.barIdx === i;
                let isWithinRange = rangeStartIdx <= i &&
                                    i <= rangeEndIdx;
                let useDivisionSign = true;

                for (let beatIdx = 0; beatIdx < bar.timeSignature[0]; beatIdx ++) {
                    let segmentIdx;
                    let chordSegment = bar.chordSegments.find((segment, idx) => { 
                        segmentIdx = idx;
                        return segment.beatIdx === beatIdx;
                    });

                    let isCurrentChord = isCurrentlyPlayingBar &&
                                        sessionIdx && 
                                        sessionIdx.segmentIdx === segmentIdx;

                    let chordNameClasses = Cx({
                        "bar": true,
                        "chord-name": true,
                        "current-chord": isCurrentChord && !editingMode
                    });

                    let displayedChordName;
                    
                    if (chordSegment) {
                        prevChordName = chordName;
                        chordName = chordSegment.chordName as ChordName;
                        if (!Chord.chordNamesAreEqual(chordName, prevChordName)) {
                            useDivisionSign = false;
                            displayedChordName = `${MusicHelper.getPresentableNoteName(chordName[0] as NoteName, baseKey)}${chordName[1]}`;
                        }
                    }

                    chordNameElements.push(
                        <span className={chordNameClasses} key={beatIdx}>
                            {displayedChordName}
                        </span>
                    );

                    beatElements.push(
                        <span className="bar beat" key={beatIdx}>
                            {beatIdx + 1}
                        </span>
                    );
                }

                let precedingAddBarBox = (
                    editingMode && precedingInsertBarIdx === i
                        ? this.renderAddBarBox(i, true)
                        : undefined
                );

                let followingAddBarBox = (
                    editingMode && followingInsertBarIdx === i + 1
                        ? this.renderAddBarBox(i + 1, false)
                        : undefined
                );

                let barClasses = Cx({ 
                    "bar": true,
                    "bar-container": true, 
                    "within-range": isWithinRange && !editingMode,
                    "current-bar": isCurrentlyPlayingBar && !editingMode,
                    "add-box-precedes": editingMode && Util.mod(i - 1, 4) !== 3 && (!!precedingAddBarBox || followingInsertBarIdx === i),
                    "add-box-follows": editingMode && (!!followingAddBarBox || precedingInsertBarIdx === i + 1),
                    "shortened": editingMode && Util.mod(i, 4) === 3
                });

                let barElementContent = (
                    editingMode && hoveredBarIdx === i
                        ? (
                            <div style={{ height: "100%", backgroundColor: "#222", color: "white", fontSize: "150%" }} >
                                Edit Bar
                            </div>
                        )
                        : [
                            <div className="bar bar-chord-group" key={0}>
                                {useDivisionSign
                                    ? (
                                        <div className="bar division-sign">
                                            %
                                        </div>
                                    )
                                    : chordNameElements
                                }
                            </div>,
                            <div className="bar bar-beat-group" key={1}>
                                {beatElements}
                            </div>
                        ]
                );  

                let barElement = (
                    <div 
                        key={i}
                        className={barClasses}
                        onClick={() => this._onBarClick(i)}
                        onMouseEnter={() => this._onBarEnter(i)}
                        onMouseLeave={this._onBarLeave}
                    >
                        {barElementContent}
                    </div>
                );
                

                if (precedingAddBarBox) {
                    renderBars.push(precedingAddBarBox);
                }

                renderBars.push(barElement);

                if (followingAddBarBox) {
                    renderBars.push(followingAddBarBox)
                }
            });
        }

        if (editingMode) {
            renderBars.push(this.renderAddBarBox(bars.length));
        }

        return renderBars
    }

    public renderAddBarBox = (barIdx: number, preceding?: boolean) => (
        <div 
            key={`add-${barIdx}`}
            className="add-bar-box"
            onClick={() => this._onAddBar(barIdx)} 
            onMouseEnter={preceding !== undefined ? () => this._onEnterAddBarBox(barIdx, preceding) : () => this.setState({ precedingInsertBarIdx: undefined, followingInsertBarIdx: undefined }) }
            onMouseLeave={preceding !== undefined ? this._onBarLeave : undefined }
        >
            <span>+</span>
        </div>
    )

    private _onEnterAddBarBox = (barIdx: number, preceding: boolean) => {
        this.setState({ 
            precedingInsertBarIdx: preceding ? barIdx : undefined,
            followingInsertBarIdx: preceding ? undefined : barIdx
        });
    }

    private _onBarClick = (barIdx: number) => {
        let { onBarClick } = this.props;
        if (onBarClick) {
            onBarClick(barIdx);
        }
    }

    private _onBarEnter = (barIdx: number) => {
        this.setState({ 
            hoveredBarIdx: barIdx,
            precedingInsertBarIdx: barIdx === 0 ? undefined : barIdx,
            followingInsertBarIdx: barIdx === (this.props.chart as Chart).bars.length - 1 ? undefined : barIdx + 1
        });
    }

    private _onBarLeave = (event: React.SyntheticEvent<any>) => {
        if (event && event.nativeEvent && (event.nativeEvent as MouseEvent).toElement) {
            let toElementClasses = (event.nativeEvent as MouseEvent).toElement.className.split(" ");
            let stateUpdate: IChartViewerState = {};

            if (toElementClasses.indexOf("bar") === -1) {
                stateUpdate.hoveredBarIdx = undefined;
                if (toElementClasses.indexOf("add-bar-box") === -1) {
                    stateUpdate = {
                        ...stateUpdate,
                        hoveredBarIdx: undefined,
                        precedingInsertBarIdx: undefined,
                        followingInsertBarIdx: undefined
                    }
                }
            }
                
            this.setState(stateUpdate);
        }   
    }

    private _onAddBar = (barIdx: number) => {
        let { onAddBar } = this.props;
        if (onAddBar) {
            onAddBar(barIdx);
        }
    }

    public renderLeftHandSettings = (): JSX.Element => {
        return (
            <div className="left-hand-settings">
                {this.renderKeyContextSelect()}
                {this.renderTempoSelect()}
            </div>
        );
    }

    /**
     * KEY SIGNATURE SELECT
     */

    public renderKeyContextSelect = (): JSX.Element => {
        let { context } = this.props.chart as Chart;
        let options = MusicHelper.NOTE_NAMES.map(
            key => (
                <option key={key} value={key} >
                    {key}
                </option>
            )
        );

        return (
            <div className="left-hand-settings-row">
                <div>
                    Key Context:
                </div>
                <select 
                    className="left-hand-settings-right" 
                    value={context}
                    onChange={event => this._recontextualize((event.target.value as NoteName))}
                >
                    {options}
                </select> 
            </div>
        );

    }

    private _recontextualize = (context: NoteName) => {
        let { recontextualize } = this.props;
        if (recontextualize) {
            recontextualize(context);
        }
    }

    /**
     * TEMPO SELECT
     */

    public renderTempoSelect = (): JSX.Element => {
        let { tempo } = this.props.chart as Chart;
        let bpms = (tempo as Tempo)[0];
        let options = [];
        for (
                let t = MusicHelper.LOWER_TEMPO_LIMIT; 
                t <= MusicHelper.UPPER_TEMPO_LIMIT; 
                t ++
        ) {
            options.push(
                <option key={t} value={t} >
                    {t}
                </option>
            );
        }

        return (
            <div className="left-hand-settings-row">
                <div>
                    Tempo:
                </div>
                <select 
                    className="left-hand-settings-right" 
                    value={bpms}
                    onChange={event => this._resetTempo([Number(event.target.value), 4])}
                >
                    {options}
                </select> 
            </div>
        );
    }

    private _resetTempo = (tempo: Tempo) => {
        let { resetTempo } = this.props;
        if (resetTempo) {
            resetTempo(tempo);
        }
    }
};

export default ChartViewer;