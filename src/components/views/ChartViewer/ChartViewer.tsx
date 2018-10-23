import React, { Component } from "react";
import * as Cx from "classnames";
import { Button, Glyphicon, FormControl } from "react-bootstrap";
import * as Util from "../../../shared/Util";
import * as MusicHelper from "../../../shared/music/MusicHelper";
import { Chord } from "../../../shared/music/domain/ChordClass";
import Chart from "../../../shared/music/Chart";
import { ISong, IMusicIdx, NoteName, Tempo, ChordName, PresentableChordShape, IChartBar, IChordSegment } from "../../../shared/types";
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
    onEditBar?: (barIdx: number) => void;
    onDeleteBar?: (barIdx: number) => void;
    recontextualize?: (noteName: NoteName) => void;
    resetTempo?: (tempo: Tempo) => void;
    onSongTitleChange?: (updatedTitle: string) => void;
    resetChart?: () => void;
}

export interface IChartViewerState {
    editingTitle?: boolean;
    hoveredBarIdx?: number;
    lastInLineIndices?: number[];
    linesAreGrouped?: boolean;
}

class ChartViewer extends Component<IChartViewerProps, IChartViewerState> {
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
                    {this.renderLeftHandSettings()}
                    {this.renderTitle()}
                    <div />
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

        if (!song) {
            return;
        }
        
        return (
            editingTitle 
            ? (
                <FormControl 
                    autoFocus={true}
                    onBlur={this._onSubmitSongTitleForm}
                    onSubmit={this._onSubmitSongTitleForm}
                    onFocus={(event: React.SyntheticEvent<any>) => (event.target as any).select()}
                    onChange={(event: React.SyntheticEvent<any>) => this._onSongTitleChange((event.target as any).value)} 
                    onKeyDown={this._onTitleEnter}
                    value={song.title}
                />
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

    private _onTitleEnter = (evt: React.KeyboardEvent<FormControl>) => {
        if (evt.nativeEvent.code === "Enter") {
            this._onSubmitSongTitleForm(evt);
        }
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
        let { chart } = this.props;
        let { bars } = chart as Chart;
        let { lastInLineIndices } = this.state;
        let lastBarsInLines = lastInLineIndices ? Util.copyObject(lastInLineIndices) : null;
        let lines: JSX.Element[] = [];
        let lineBars: JSX.Element[] = [];
        let lineCount = 0;

        if (bars && bars.length > 0) {
            let prevBar: IChartBar | undefined;
            let currLineHas2Bars = Array.isArray(lastBarsInLines) ? lastBarsInLines[0] === 1 : false;

            bars.forEach((bar, i) => {
                let isLastInLine = lineCount === 3;

                if (Array.isArray(lastBarsInLines) && lastBarsInLines.length && lastBarsInLines[0] === i) {
                    isLastInLine = true;
                    lastBarsInLines.shift();
                }

                lineBars.push(this.renderBar(bar, prevBar, isLastInLine, currLineHas2Bars));

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

        if (lineBars.length > 0) {
            lines.push(this.renderProgressionLine(lineBars));
        }

        return lines;
    }

    public renderBar(bar: IChartBar, prevBar: IChartBar | undefined, isLastInLine: boolean, currLineHas2Bars: boolean) {

        let { editingMode, chart, sessionIdx } = this.props;
        let { linesAreGrouped, hoveredBarIdx } = this.state;
        let { bars, rangeStartIdx, rangeEndIdx } = chart as Chart;
        let i = bar.barIdx;
        let prevChordName = prevBar ? prevBar.chordSegments[prevBar.chordSegments.length - 1].chordName : undefined;
        let isCurrentlyPlayingBar = sessionIdx && sessionIdx.barIdx === i;
        let isWithinRange = rangeStartIdx <= i &&
                                i <= rangeEndIdx;
        let baseKey = bars[0].chordSegments[0].key; 

        return (
            <div 
                key={i}
                className={this._getBarContainerClasses(i, rangeStartIdx, rangeEndIdx, !!isCurrentlyPlayingBar)}
                onMouseEnter={() => this._onBarEnter(i)}
                onMouseLeave={this._onBarLeave}
                style={{ 
                    opacity: editingMode ? 1 : (isWithinRange ? 1 : 0.2),
                    width: linesAreGrouped ? `${this._getCurrRenderBarWidthPercent(i, currLineHas2Bars)}%` : undefined,
                    minWidth: linesAreGrouped ? undefined : "25%",
                    borderRight: isLastInLine || i === rangeStartIdx - 1 ? undefined : "solid black 1px",
                    borderLeft: i === rangeStartIdx && i !== 0 ? "solid black 1px" : undefined,
                    backgroundColor: editingMode && hoveredBarIdx === i ? "#ddd" : undefined
                }}
            >
                {this.renderDoubleLine(i, true)}
                {this.renderTimeSignature(prevBar, bar)}
                {this.renderBarContent(i, this.renderBarChordElements(bar, !!isCurrentlyPlayingBar, baseKey as string, prevChordName))}
                {this.renderDoubleLine(i, false)}
            </div>
        );
    }

    public renderBarChordElements(bar: IChartBar, isCurrentlyPlayingBar: boolean, baseKey: string, prevChordName?: ChordName) {
        let { sessionIdx } = this.props;
        let chordName: ChordName | undefined;
        let chordElements: JSX.Element[] = [];
        let useDivisionSign = true;

        for (let beatIdx = 0; beatIdx < bar.timeSignature[0]; beatIdx ++) {
            let [chordSegment, segmentIdx] = this._getSegment(bar, beatIdx);
            let isCurrentChord = isCurrentlyPlayingBar &&
                                sessionIdx && 
                                sessionIdx.segmentIdx === segmentIdx;

            let displayedChordBase: string | undefined;
            let displayedChordShape: JSX.Element | undefined;
            let chordPlaceholder: string | undefined;
            
            if (chordSegment) {
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

                prevChordName = chordName;

            } 
            
            if (!displayedChordBase && bar.timeSignature[0] >= 5 && bar.chordSegments.length > 1) {
                chordPlaceholder = "%";
            }

            chordElements.push(
                <span className={this._getChordElementClasses(!!isCurrentChord)} key={beatIdx}>
                    {displayedChordBase}{displayedChordShape}{chordPlaceholder}
                </span>
            );
        }

        if (useDivisionSign) {
            return undefined;
        }

        return chordElements;
    }

    public renderBarContent(i: number, chordNameElements?: JSX.Element[]) {
        let { editingMode } = this.props;
        let { hoveredBarIdx } = this.state;
        let useDivisionSign = !Array.isArray(chordNameElements);

        return (
            editingMode && hoveredBarIdx === i
                ? this.renderBarButtonContent(i)
                : (
                    <div 
                        className="bar bar-chord-group" 
                        style={{ justifyContent: useDivisionSign ? "center" : "space-between" }} 
                        key={0} >
                        {useDivisionSign
                            ? (
                                <div className="bar division-sign">
                                    %
                                </div>
                            )
                            : chordNameElements
                        }
                    </div>
                )
        );
    }

    public renderBarButtonContent(i: number) {
        return (
            <div className="bar-buttons" >
                <Button style={{ width: "10%", padding: 0 }} onClick={() => this._onAddBar(i)} > 
                    <Glyphicon glyph="plus" style={{ margin: "auto" }} />
                </Button>
                <div style={{ width: "70%", display: "flex", flexDirection: "column" }} >
                    <Button style={{ padding: 0 }} onClick={() => this._onEditBar(i)}>Edit</Button>
                    <Button style={{ padding: 0 }} bsStyle="danger" onClick={() => this._onDeleteBar(i)}>Delete</Button>
                </div>
                <Button style={{ width: "10%", padding: 0 }} onClick={() => this._onAddBar(i + 1)}>
                    <Glyphicon glyph="plus" />
                </Button>
            </div>
        );
    }

    public renderDoubleLine(barIdx: number, start: boolean) {
        let { chart, editingMode } = this.props;
        let { hoveredBarIdx } = this.state;

        if (!chart || (editingMode && barIdx === hoveredBarIdx)) {
            return;
        }

        let { bars } = chart;

        if (start) {
            if (barIdx !== 0) {
                return;
            }
        } else {
            if (barIdx !== bars.length - 1) {
                return;
            }
        }

        return <div style={{ 
            height: "100%", 
            left: 0, 
            width: 5, 
            borderRight: `solid black ${start ? 2 : 1}px`, 
            borderLeft: `solid black ${start ? 1 : 2}px` }} />;

    }

    public renderTimeSignature(prevBar?: IChartBar, bar?: IChartBar) {
        let { editingMode } = this.props;
        let { hoveredBarIdx } = this.state;

        if (!bar || (editingMode && bar.barIdx === hoveredBarIdx)) {
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

    private _onBarEnter = (barIdx: number) => {
        this.setState({ hoveredBarIdx: barIdx });
    }

    private _onBarLeave = (event: React.SyntheticEvent<any>) => {
        this.setState({ hoveredBarIdx: undefined });
    }

    private _onAddBar = (barIdx: number) => {
        let { onAddBar } = this.props;
        if (onAddBar) {
            onAddBar(barIdx);
        }
    }


    private _onEditBar = (barIdx: number) => {
        let { onEditBar } = this.props;
        if (onEditBar) {
            onEditBar(barIdx);
        }
    }

    private _onDeleteBar = (barIdx: number) => {
        let { onDeleteBar } = this.props;
        if (onDeleteBar) {
            onDeleteBar(barIdx);
        }
    }

    public renderLeftHandSettings = () => {
        if (!this.props.chart) {
            return;
        }
        return (
            <div className="left-hand-settings">
                {this.renderTempoSelect()}
            </div>
        );
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

    private _getSegment = (bar: IChartBar, beatIdx: number): [ IChordSegment | undefined, number | undefined ] => {

        if (!bar) {
            return [ undefined, undefined ];
        }

        let segmentIdx: number | undefined;

        let segment = bar.chordSegments.find((seg, idx) => { 
            segmentIdx = idx;
            return seg.beatIdx === beatIdx;
        });

        return [ segment, segment ? segmentIdx : undefined ]
    }

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

    private _getChordElementClasses = (isCurrentChord: boolean) => {
        let { editingMode } = this.props;

        return Cx({
            "bar": true,
            "chord-name": true,
            "current-chord": isCurrentChord && !editingMode
        });
    }

    private _getCurrRenderBarWidthPercent = (i: number, currLineHas2Bars: boolean) => {
        let { linesAreGrouped } = this.state;

        if (!linesAreGrouped) {
            return NaN;
        }

        return currLineHas2Bars ? 50 : 25;
    }

    /**
     * LIFE CYCLE
     */

    public componentDidMount() {
        this._initializeBarLines();
    }

    public componentDidUpdate(prevProps: IChartViewerProps, prevState: IChartViewerState) {
        let { chart } = this.props;

        if (chart && prevProps.chart) {
            if (
                chart.songId !== prevProps.chart.songId ||
                JSON.stringify(chart.bars) !== JSON.stringify(prevProps.chart.bars)
            ) {
                this._resetLineGroups();
            }
        }

        this._initializeBarLines();
    }

    private _resetLineGroups = () => {
        this.setState({ linesAreGrouped: false, lastInLineIndices: undefined });
    }

    private _initializeBarLines = () => {
        let { chart } = this.props;

        if (chart && chart.bars) {
            if (!this.state.lastInLineIndices) {

                let lastInLineIndices = chart.bars.map((b, i) => i);
                this.setState({ lastInLineIndices });

            } else if (!this.state.linesAreGrouped) {
                this._groupBarsIntoLines();
            }
        }
    }

    private _groupBarsIntoLines = () => {
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