import React, { Component } from "react";
import * as Cx from "classnames";
import * as Util from "../../../shared/Util";
import * as MusicHelper from "../../../shared/music/MusicHelper";
import { Chord } from "../../../shared/music/domain/ChordClass";
import Chart from "../../../shared/music/Chart";
import { ISong, IMusicIdx, NoteName, Tempo, ChordName, PresentableChordShape, IChartBar } from "../../../shared/types";
import "./ChartViewer.css";
import $ from "jquery";

export interface IChartViewerProps {
    editingMode?: boolean;
    song?: ISong;
    chart?: Chart;
    sessionIdx?: IMusicIdx;
    sessionFailed?: boolean;
    loadingChart?: boolean;
    onBarClick?: (barIdx: number) => void;
    onAddBar?: (barIdx: number) => void;
    recontextualize?: (noteName: NoteName) => void;
    resetTempo?: (tempo: Tempo) => void;
    onSongTitleChange?: (updatedTitle: string) => void;
    resetChart?: () => void;
}

export interface IChartViewerState {
    editingTitle?: boolean;
    hoveredBarIdx?: number;
    precedingInsertBarIdx?: number; 
    followingInsertBarIdx?: number;
    lastInLineIndices?: number[];
    linesAreGrouped?: boolean;
}

class ChartViewer extends Component<IChartViewerProps, IChartViewerState> {
    private _addBoxHalfWidthPercent = 3;

    constructor(props: IChartViewerProps) {
        super(props);
        this.state = {
            editingTitle: false,
            linesAreGrouped: false
        };
    }

    public render(): JSX.Element {
        let { song, chart, editingMode, sessionFailed, loadingChart } = this.props;
        let noChartData = Util.objectIsEmpty(song) ||
                        Util.objectIsEmpty(chart);

        let content: JSX.Element[] | JSX.Element;
        let dynamicStyle = {} as any;

        if (loadingChart) {

            content = <h2 style={{ textAlign: "center" }} >loading chart...</h2>;

        } else if (noChartData) {

            content = <h2 style={{ textAlign: "center" }}>No chart loaded.</h2>;

        } else if (sessionFailed) {

            content = (
                <div style={{ textAlign: "center" }}>
                    <h2  key={1} >
                        An error occured while playing your chart :(
                    </h2>
                    <a onClick={this._resetChart} key={2} style={{ fontSize: "150%" }} >Reset Chart</a>
                </div>
            );
                
        } else {

            let $playView = $("#play-view");
            let $menuBar = $("#menu-bar");
            let $keyboard = $("#keyboard");

            if ($playView && $menuBar && $keyboard) {
                dynamicStyle.height = ($playView.height() as number) - ($menuBar.height() as number) - ($keyboard.height() as number); 
            }

            content = [
                <header className="chart-header" style={{ justifyContent: editingMode ? "space-between" : "center" }} key={0} >
                    {false && this.renderLeftHandSettings()}
                    {this.renderTitle()}
                </header>,
                <section className="chart-body" key={1} >
                    {this.renderProgressionLines()}
                </section>
            ];
        }

        return (
            <div id="chart-viewer" style={dynamicStyle} >
                {content}
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
                <span 
                    className="song-title"
                    onClick={editingMode ? () => this.setState({ editingTitle: true }) : undefined}
                >
                    {(song as ISong).title}
                </span>
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

    public renderProgressionLines = (): JSX.Element[] => {
        let { chart, sessionIdx, editingMode } = this.props;
        let { bars, rangeStartIdx, rangeEndIdx } = chart as Chart;
        let { lastInLineIndices, linesAreGrouped } = this.state;
        let lastBarsInLines = lastInLineIndices ? Util.copyObject(lastInLineIndices) : null;
        let lines: JSX.Element[] = [];
        let lineBars: JSX.Element[] = [];
        let lineCount = 0;

        if (bars && bars.length > 0) {
            let baseKey = bars[0].chordSegments[0].key;
            let prevBar: IChartBar | undefined;
            let currLineHas2Bars = Array.isArray(lastBarsInLines) ? lastBarsInLines[0] === 1 : false;

            bars.forEach((bar, i) => {
                let isCurrentlyPlayingBar = sessionIdx && sessionIdx.barIdx === i;
                let isWithinRange = rangeStartIdx <= i &&
                                    i <= rangeEndIdx;

                let isLastInLine = lineCount === 3;
                let isFirstInLine = lineCount === 0;

                if (Array.isArray(lastBarsInLines) && lastBarsInLines.length && lastBarsInLines[0] === i) {
                    isLastInLine = true;
                    lastBarsInLines.shift();
                }

                let barElement = (
                    <div 
                        key={i}
                        className={this._getBarContainerClasses(i, rangeStartIdx, rangeEndIdx, !!isCurrentlyPlayingBar)}
                        onClick={() => this._onBarClick(i)}
                        onMouseEnter={() => this._onBarEnter(i)}
                        onMouseLeave={this._onBarLeave}
                        style={{ 
                            opacity: editingMode ? 1 : (isWithinRange ? 1 : 0.2),
                            width: linesAreGrouped ? `${this._getCurrRenderBarWidthPercent(i, isFirstInLine, isLastInLine, currLineHas2Bars)}%` : undefined,
                            minWidth: linesAreGrouped ? undefined : "25%",
                            borderRight: isLastInLine || i === rangeStartIdx - 1 ? undefined : "solid black 1px",
                            borderLeft: i === rangeStartIdx && i !== 0 ? "solid black 1px" : undefined 
                        }}
                    >
                        {i === 0 && this.renderDoubleLine(true)}
                        {this.renderTimeSignature(prevBar, bar)}
                        {this.renderBarContent(i, this.renderBarChordElements(bar, !!isCurrentlyPlayingBar, baseKey as string))}
                        {i === bars.length - 1 && this.renderDoubleLine(false)}
                    </div>
                );
                

                let precedingAddBarBox = this.renderAddBarBox(i, true);
                if (precedingAddBarBox) {
                    lineBars.push(precedingAddBarBox);
                }

                lineBars.push(barElement);

                let followingAddBarBox = this.renderAddBarBox(i + 1, false);
                if (followingAddBarBox) {
                    lineBars.push(followingAddBarBox)
                }

                if (isLastInLine) {
                    lines.push(this.renderProgressionLine(lineBars));
                    lineBars = [];
                    lineCount = 0;
                } else {
                    lineCount ++;
                }

                prevBar = bar;
                currLineHas2Bars = Array.isArray(lastBarsInLines) && 
                                    lastBarsInLines.length > 0 && 
                                    isLastInLine 
                                        ? i + 2 === lastBarsInLines[0] 
                                        : currLineHas2Bars;

            });
        }

        if (editingMode && linesAreGrouped) {
            lineBars.push(this.renderAddBarBox(bars.length) as JSX.Element);
        }

        if (lineBars.length > 0) {
            lines.push(this.renderProgressionLine(lineBars));
        }

        return lines;
    }

    public renderBarChordElements(bar: IChartBar, isCurrentlyPlayingBar: boolean, baseKey: string) {
        let { editingMode, sessionIdx } = this.props;
        let chordName: ChordName | undefined;
        let prevChordName: ChordName | undefined;
        let chordElements: JSX.Element[] = [];
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

            let displayedChordBase: string | undefined;
            let displayedChordShape: JSX.Element | undefined;
            let chordPlaceholder: string | undefined;
            
            if (chordSegment) {
                prevChordName = chordName;
                chordName = chordSegment.chordName as ChordName;

                if (!Chord.chordNamesAreEqual(chordName, prevChordName)) {
                    useDivisionSign = false;
                    displayedChordBase = `${MusicHelper.getPresentableNoteName(chordName[0] as NoteName, baseKey)}`;

                    let presentableShape = PresentableChordShape[chordName[1]];
                    displayedChordShape = (
                        <sup className="chord-shape" >
                            {presentableShape}
                        </sup>
                    );
                } 

            } else if (bar.timeSignature[0] >= 5 && bar.chordSegments.length > 1) {
                chordPlaceholder = "%";
            }

            chordElements.push(
                <span className={chordNameClasses} key={beatIdx}>
                    {displayedChordBase}{displayedChordShape}{chordPlaceholder}
                </span>
            );
        }

        if (useDivisionSign) {
            return [];
        }

        return chordElements;
    }

    public renderBarContent(i: number, chordNameElements?: JSX.Element[]) {

        if (!chordNameElements) {
            return;
        }

        let { editingMode } = this.props;
        let { hoveredBarIdx } = this.state;
        let useDivisionSign = chordNameElements.length === 0;

        return (
            editingMode && hoveredBarIdx === i
                ? (
                    <div style={{ backgroundColor: "#222", flexGrow: 20, color: "white", fontSize: "150%" }} >
                        Edit Bar
                    </div>
                )
                : 
                <div className="bar bar-chord-group" style={{ flexGrow: 20, justifyContent: useDivisionSign ? "center" : "space-between" }} key={0}>
                    {useDivisionSign
                        ? (
                            <div className="bar division-sign">
                                %
                            </div>
                        )
                        : chordNameElements
                    }
                </div>
        );
    }

    public renderDoubleLine(start: boolean) {
        return <div style={{ 
            flexGrow: 1, 
            height: "100%", 
            left: 0, 
            width: 5, 
            borderRight: `solid black ${start ? 2 : 1}px`, 
            borderLeft: `solid black ${start ? 1 : 2}px` }} />;

    }

    public renderTimeSignature(prevBar?: IChartBar, bar?: IChartBar) {
        if (!bar) {
            return;
        }

        return (!prevBar || !Util.shallowEqual(prevBar.timeSignature, bar.timeSignature)) && (
            <div className="time-signature" >
                <span>{bar.timeSignature[0]}</span>
                <span>{bar.timeSignature[1]}</span>
            </div>
        );
    }

    public renderProgressionLine(bars: JSX.Element[]) {
        return (
            <div className="line" >
                {bars}
            </div>
        );
    }

    public renderAddBarBox = (barIdx: number, preceding?: boolean) => {

        let { editingMode } = this.props;
        let { linesAreGrouped, precedingInsertBarIdx, followingInsertBarIdx } = this.state;

        if (!editingMode || !linesAreGrouped) {
            return;
        }

        if (preceding) {
            if (barIdx !== precedingInsertBarIdx) {
                return;
            }
        } else {
            if (barIdx !== followingInsertBarIdx) {
                return;
            }
        }

        return (
            <div 
                key={`add-${barIdx}`}
                style={{ width: `${2 * this._addBoxHalfWidthPercent}%` }}
                className="add-bar-box"
                onClick={() => this._onAddBar(barIdx)} 
                onMouseEnter={preceding !== undefined ? () => this._onEnterAddBarBox(barIdx, preceding) : () => this.setState({ precedingInsertBarIdx: undefined, followingInsertBarIdx: undefined }) }
                onMouseLeave={preceding !== undefined ? this._onBarLeave : undefined }
            >
                <span>+</span>
            </div>
        );
    }

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

    /**
     * RESET CHART
     */

    private _resetChart = () => {
        if (this.props.resetChart) {
            this.props.resetChart();
        }
    }

    /**
     * HELPERS
     */

    private _getBarContainerClasses = (i: number, rangeStartIdx: number, rangeEndIdx: number, isCurrentlyPlayingBar: boolean) => {

        let { editingMode } = this.props;
        let { hoveredBarIdx } = this.state;
        let hoveredBarIsInRange = Number.isInteger(hoveredBarIdx as number) && (hoveredBarIdx as number) >= rangeStartIdx && (hoveredBarIdx as number) <= rangeEndIdx;
        let isWithinRange = rangeStartIdx <= i &&
                                    i <= rangeEndIdx;

        return Cx({ 
            "bar": true,
            "bar-container": true, 
            "within-range": isWithinRange && !editingMode,
            "current-bar": isCurrentlyPlayingBar && !editingMode,
            "will-be-within-range": !editingMode && Number.isInteger(hoveredBarIdx as number) && (
                hoveredBarIsInRange 
                    ? hoveredBarIdx === i
                    : (Math.min(hoveredBarIdx as number, rangeStartIdx) <= i && i <= Math.max(hoveredBarIdx as number, rangeEndIdx))
            )
        });
    }

    private _getCurrRenderBarWidthPercent = (i: number, isFirstInLine: boolean, isLastInLine: boolean, currLineHas2Bars: boolean) => {
        let { editingMode } = this.props;
        let { linesAreGrouped, precedingInsertBarIdx, followingInsertBarIdx } = this.state;

        if (!linesAreGrouped) {
            return NaN;
        }

        // Calculate bar width
        let barWidthPercent = currLineHas2Bars ? 50 : 25;
        let addBoxPrecedesCurrentBar = precedingInsertBarIdx === i || followingInsertBarIdx === i;
        let addBoxFollowsCurrentBar = followingInsertBarIdx === i + 1 || precedingInsertBarIdx === i + 1;

        if (editingMode) {

            if (isFirstInLine) {

                if (precedingInsertBarIdx === i) {
                    barWidthPercent -= 2 * this._addBoxHalfWidthPercent;
                }

                if (addBoxFollowsCurrentBar) {
                    barWidthPercent -= this._addBoxHalfWidthPercent;
                }

            } else if (isLastInLine) {

                if (followingInsertBarIdx === i + 1) {
                    barWidthPercent -= 2 * this._addBoxHalfWidthPercent;
                }

                if (addBoxPrecedesCurrentBar) {
                    barWidthPercent -= this._addBoxHalfWidthPercent;
                }

            } else {

                if (addBoxPrecedesCurrentBar) {
                    barWidthPercent -= this._addBoxHalfWidthPercent;
                }

                if (addBoxFollowsCurrentBar) {
                    barWidthPercent -= this._addBoxHalfWidthPercent;
                }
            }
        }

        return barWidthPercent;
    }

    /**
     * LIFE CYCLE
     */

    public componentDidUpdate(prevProps: IChartViewerProps) {
        let { chart } = this.props;

        if (chart && prevProps.chart) {
            if (chart.songId !== prevProps.chart.songId) {
                this.setState({ linesAreGrouped: false, lastInLineIndices: undefined });
            }
        }

        if (chart && chart.bars) {

            if (!this.state.lastInLineIndices) {

                let lastInLineIndices = chart.bars.map((b, i) => i);
                this.setState({ lastInLineIndices });

            } else if (!this.state.linesAreGrouped) {
                this.groupBarsIntoLines();
            }
        }
    }

    private groupBarsIntoLines = () => {
        let { chart } = this.props;

        if (!chart || !chart.bars) {
            return;
        }

        let chartWidth = $("#chart-viewer").width() as number;
        let lastInLineIndices: number[] = [];
        let currGroup: number[] = [];
        let breakUpGroup = false;

        $(".bar-container").each(function(barIdx) {

            if (breakUpGroup) {
                lastInLineIndices.push(barIdx);
                currGroup = [];
                breakUpGroup = false;
                return;
            }

            let barWidth = $(this).width() as number;

            if (barWidth > chartWidth / 4) {

                switch(currGroup.length) {
                    case 0:
                        breakUpGroup = true;
                        return;
                    case 1:
                        lastInLineIndices.push(barIdx);
                        currGroup = [];
                        return;
                    case 2:
                        lastInLineIndices.push(currGroup[1]);
                        breakUpGroup = true;
                        return;
                    case 3:
                        lastInLineIndices.push(currGroup[1]);
                        lastInLineIndices.push(barIdx);
                        currGroup = [];
                        return;
                }

            }

            currGroup.push(barIdx);

            if (currGroup.length === 4) {
                lastInLineIndices.push(barIdx);
                currGroup = [];
            }
        });

        this.setState({ 
            lastInLineIndices,
            linesAreGrouped: true
        });
    }
};

export default ChartViewer;