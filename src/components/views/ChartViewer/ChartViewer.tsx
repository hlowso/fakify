import React, { Component, CSSProperties } from "react";
import * as Cx from "classnames";
import { Button, Glyphicon, FormControl, FormGroup } from "react-bootstrap";
import * as Util from "../../../shared/Util";
import * as MusicHelper from "../../../shared/music/MusicHelper";
import { Chord } from "../../../shared/music/domain/ChordClass";
import { MAX_TITLE_LENGTH } from '../../../shared/Constants';
import Chart from "../../../shared/music/Chart";
import { ISong, IMusicIdx, NoteName, Tempo, ChordName, PresentableChordShape, IChartBar, IChordSegment } from "../../../shared/types";
import { BAR_LIMIT } from "../../../shared/Constants";
import "./ChartViewer.css";
import "./ChartViewerMobile.css";
import $ from "jquery";

export interface IChartViewerProps {
    isMobile?: boolean;
    editingMode?: boolean;
    editingTitle?: string;
    song?: ISong;
    chart?: Chart;
    sessionIdx?: IMusicIdx;
    sessionFailed?: boolean;
    loadingChart?: boolean;
    chartTitleError?: boolean;
    isEditingBars?: boolean;
    hiddenKeyboard?: boolean;
    highlightAllOutOfRange?: boolean;
    onBarClick?: (barIdx: number) => void;
    onAddBar?: (barIdx: number) => void;
    onEditBar?: (barIdx: number) => void;
    onDeleteBar?: (barIdx: number) => void;
    recontextualize?: (noteName: NoteName) => void;
    resetTempo?: (tempo: Tempo) => void;
    onSongTitleChange?: () => void;
    resetChart?: () => void;
    onEditTitle?: (title: string) => void;
}

export interface IChartViewerState {
    hoveredBarIdx?: number;
    lastInLineIndices?: number[];
    linesAreGrouped?: boolean;
}

class ChartViewer extends Component<IChartViewerProps, IChartViewerState> {
    constructor(props: IChartViewerProps) {
        super(props);
        this.state = {
            linesAreGrouped: false
        };
    }

    public render(): JSX.Element {
        let { isMobile, song, chart, sessionFailed, loadingChart, editingMode } = this.props;

        let noChartData = Util.objectIsEmpty(chart) || (!editingMode && Util.objectIsEmpty(song));
        let content: JSX.Element[] | JSX.Element;
        let dynamicStyle = {} as any;

        if (loadingChart) {
            content = this.renderLoadingChartMessage();
        } else if (noChartData) {
            content = this.renderNoChartDataMessage();
        } else if (sessionFailed) {
            content = this.renderSessionFailedMessage();
        } else {
            content = this.renderChartComponents(dynamicStyle);
        }

        return (
            <div id="chart-viewer" className={isMobile ? "mobile" : undefined} style={dynamicStyle} >
                {content}
            </div>
        );
    }

    public renderChartComponents(dynamicStyle: CSSProperties) {
        let { hiddenKeyboard } = this.props;

        let $playView = $("#play-view");
        let $menuBar = $("#menu-bar");
        let $keyboard = $("#keyboard");

        let keyboardHeight = hiddenKeyboard ? 0 : ($keyboard ? $keyboard.height() : 0);

        if ($playView && $menuBar) {
            dynamicStyle.height = ($playView.height() as number) - ($menuBar.height() as number) - (keyboardHeight as number); 
        }

        return [
            <header className="chart-header" key={0} onMouseEnter={this._onBarLeave} >
                {this.renderTitle()}
            </header>,
            <section className="chart-body" key={1} onMouseEnter={this._onBarLeave} >
                {this.renderProgressionLines()}
            </section>
        ];
    }

    public renderSessionFailedMessage() {
        return (
            <div style={{ textAlign: "center" }}>
                <h2  key={1} >
                    An error occured while playing your chart :(
                </h2>
                <a onClick={this._resetChart} key={2} style={{ fontSize: "150%" }} >Reset Chart</a>
            </div>
        );
    }

    public renderNoChartDataMessage() {
        return (
            <div>
                <h2 style={{ textAlign: "center" }} >No chart loaded.</h2>
                <p style={{ textAlign: "center", fontSize: "130%" }} >Search for a chart or click the browse icon to get started.</p>
            </div>
        );
    }

    public renderLoadingChartMessage() {
        return (
            <h2 style={{ textAlign: "center" }} >loading chart...</h2>
        );
    }

    public renderTitle = () => {
        let { isMobile, editingMode, song, chartTitleError, editingTitle, onEditTitle } = this.props;

        let isEditingTitle = typeof editingTitle === "string" && editingMode && onEditTitle;
        let editingTitleLength = isEditingTitle ? (editingTitle as string).length : 0;

        if (!song) {
            return;
        }
        
        return (
            isEditingTitle 
            ? (
                <FormGroup validationState={!(editingTitle as string).trim() || chartTitleError ? "error" : undefined} >
                    <FormControl 
                        autoFocus={true}
                        onBlur={() => this._onSongTitleChange()}
                        onSubmit={() => this._onSongTitleChange()}
                        onFocus={(event: React.SyntheticEvent<any>) => (event.target as any).select()}
                        onChange={(event: React.SyntheticEvent<any>) => (onEditTitle as (title: string) => void)((event.target as any).value)} 
                        onKeyDown={this._onTitleEnter}
                        value={editingTitle}
                        placeholder="Enter a title"
                        style={{
                            marginTop: 25, 
                            width: editingTitleLength === 0 ? 300 : Math.max(editingTitleLength * (editingTitleLength >= 30 ? 15 : 30), 100),
                            fontSize: editingTitleLength >= 30 ? "200%" : "300%",
                            textAlign: "center"
                        }}
                    />
                </FormGroup>
                
            )
            : (
                <span 
                    className="song-title"
                    onClick={editingMode && onEditTitle ? () => (onEditTitle as () => void)() : undefined}
                    style={{ cursor: editingMode ? "pointer" : undefined, fontSize: isMobile ? "160%" : "300%" }}
                    onMouseEnter={this._onBarLeave}
                >
                    {song.title}
                </span>
            )
        );
    }

    private _onTitleEnter = (evt: React.KeyboardEvent<FormControl>) => {
        if (evt.nativeEvent.code === "Enter") {
            this._onSongTitleChange();
        }
    }

    private _onSongTitleChange = () => {
        let { onSongTitleChange, chartTitleError, editingTitle } = this.props;

        if (!chartTitleError && onSongTitleChange && editingTitle && editingTitle.trim() && editingTitle.length <= MAX_TITLE_LENGTH) {
            onSongTitleChange();
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
            let barCountInLine = Array.isArray(lastBarsInLines) ? lastBarsInLines[0] + 1 : 4;

            bars.forEach((bar, i) => {
                let isLastInLine = lineCount === 3;

                if (Array.isArray(lastBarsInLines) && lastBarsInLines.length && lastBarsInLines[0] === i) {
                    isLastInLine = true;
                    lastBarsInLines.shift();
                }

                lineBars.push(this.renderBar(bar, prevBar, isLastInLine, barCountInLine));

                if (isLastInLine) {
                    lines.push(this.renderProgressionLine(lineBars));
                    lineBars = [];
                    lineCount = 0;
                } else {
                    lineCount ++;
                }

                prevBar = bar;
                barCountInLine = Array.isArray(lastBarsInLines) && 
                                    lastBarsInLines.length > 0 && 
                                    isLastInLine 
                                        ? lastBarsInLines[0] - i 
                                        : barCountInLine;

            });
        }

        if (lineBars.length > 0) {
            lines.push(this.renderProgressionLine(lineBars));
        }

        return lines;
    }

    public renderBar(bar: IChartBar, prevBar: IChartBar | undefined, isLastInLine: boolean, barCountInLine: number) {

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
                onClick={() => this._onBarClick(i)}
                onMouseEnter={() => this._onBarEnter(i)}
                onMouseLeave={this._onBarLeave}
                style={{ 
                    opacity: editingMode ? 1 : (isWithinRange ? 1 : 0.2),
                    width: linesAreGrouped ? `${this._getCurrRenderBarWidthPercent(i, barCountInLine)}%` : undefined,
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
        let { editingMode, chart } = this.props;

        if (!chart) {
            return;
        }

        let { bars } = chart;
        let hideDelete = bars.length <= 1;
        let { hoveredBarIdx } = this.state;
        let useDivisionSign = !Array.isArray(chordNameElements);

        return (
            editingMode && hoveredBarIdx === i
                ? this.renderBarButtonContent(i, hideDelete)
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

    public renderBarButtonContent(i: number, hideDelete = false) { 
        let precedingAddButton = !this._atBarLimit && (
            <Button style={{ width: "10%", padding: 0 }} onClick={() => this._onAddBar(i)} > 
                <Glyphicon glyph="plus" style={{ margin: "auto" }} />
            </Button>
        );

        let followingAddButton = !this._atBarLimit && (
            <Button style={{ width: "10%", padding: 0 }} onClick={() => this._onAddBar(i + 1)}>
                <Glyphicon glyph="plus" />
            </Button>
        );

        let lowerButton = !hideDelete && (
            <Button style={{ padding: 0 }} bsStyle="danger" onClick={() => this._onDeleteBar(i)}>Delete</Button>
        );

        return (
            <div className="bar-buttons" style={{ justifyContent: this._atBarLimit ? "space-around" : "space-between" }} >
                {precedingAddButton}
                <div style={{ width: "70%", display: "flex", flexDirection: "column" }} >
                    <Button style={{ padding: 0 }} onClick={() => this._onEditBar(i)}>Edit</Button>
                    {lowerButton}
                </div>
                {followingAddButton}
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

    private _onBarClick = (barIdx: number) => {
        let { onBarClick, isMobile, editingMode } = this.props;

        if (isMobile) {
            if (editingMode) {
                this._onEditBar(barIdx);
            }
        } else {
            if (!editingMode && onBarClick) {
                onBarClick(barIdx);
            }
        }
    }

    private _onBarEnter = (barIdx: number) => {
        let { isMobile } = this.props;
        if (isMobile) {
            return;
        }
        this.setState({ hoveredBarIdx: barIdx });
    }

    private _onBarLeave = (event: React.SyntheticEvent<any>) => {
        let { isMobile } = this.props;
        if (isMobile) {
            return;
        }
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
            this.setState({ hoveredBarIdx: undefined });
            onEditBar(barIdx);
        }
    }

    private _onDeleteBar = (barIdx: number) => {
        let { onDeleteBar } = this.props;
        if (onDeleteBar) {
            onDeleteBar(barIdx);
        }
    }

    /**
     * TEMPO SELECT
     */

    // public renderTempoSelect = (): JSX.Element => {
    //     let { tempo } = this.props.chart as Chart;
    //     let bpms = (tempo as Tempo)[0];
    //     let options = [];
    //     for (
    //             let t = MusicHelper.LOWER_TEMPO_LIMIT; 
    //             t <= MusicHelper.UPPER_TEMPO_LIMIT; 
    //             t ++
    //     ) {
    //         options.push(
    //             <option key={t} value={t} >
    //                 {t}
    //             </option>
    //         );
    //     }

    //     return (
    //         <div className="left-hand-settings-row">
    //             <div>
    //                 Tempo:
    //             </div>
    //             <select 
    //                 className="left-hand-settings-right" 
    //                 value={bpms}
    //                 onChange={event => this._resetTempo([Number(event.target.value), 4])}
    //             >
    //                 {options}
    //             </select> 
    //         </div>
    //     );
    // }

    // private _resetTempo = (tempo: Tempo) => {
    //     let { resetTempo } = this.props;
    //     if (resetTempo) {
    //         resetTempo(tempo);
    //     }
    // }

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

    private get _atBarLimit() {
        let { chart } = this.props;

        if (!chart) {
            return false;
        }

        return chart.bars.length >= BAR_LIMIT;
    }

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

        let { editingMode, highlightAllOutOfRange } = this.props;
        let { hoveredBarIdx } = this.state;
        let hoveredBarIsInRange = Number.isInteger(hoveredBarIdx as number) && (hoveredBarIdx as number) >= rangeStartIdx && (hoveredBarIdx as number) <= rangeEndIdx;
        let isWithinRange = rangeStartIdx <= i &&
                                    i <= rangeEndIdx;
        let willBeWithinRange = (
            (!isWithinRange && highlightAllOutOfRange) ||
            (
                !editingMode && Number.isInteger(hoveredBarIdx as number) && (
                    hoveredBarIsInRange 
                        ? hoveredBarIdx === i
                        : (Math.min(hoveredBarIdx as number, rangeStartIdx) <= i && i <= Math.max(hoveredBarIdx as number, rangeEndIdx))
                )
            )
        );

        return Cx({ 
            "bar": true,
            "bar-container": true, 
            "within-range": isWithinRange && !editingMode,
            "current-bar": isCurrentlyPlayingBar && !editingMode,
            "will-be-within-range": willBeWithinRange
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

    private _getCurrRenderBarWidthPercent = (i: number, barCountInLine: number) => {
        let { linesAreGrouped } = this.state;

        if (!linesAreGrouped) {
            return 0;
        }

        return 100 / barCountInLine;
    }

    /**
     * LIFE CYCLE
     */

    public componentDidMount() {
        this._updateBarLines();
    }

    public componentDidUpdate(prevProps: IChartViewerProps, prevState: IChartViewerState) {
        let { chart, isEditingBars } = this.props;

        if (chart && prevProps.chart) {
            if (
                chart.songId !== prevProps.chart.songId ||
                JSON.stringify(chart.bars) !== JSON.stringify(prevProps.chart.bars) ||
                isEditingBars !== prevProps.isEditingBars
            ) {
                this._resetLineGroups();
            }
        }

        this._updateBarLines();
    }

    private _resetLineGroups = () => {
        this.setState({ linesAreGrouped: false, lastInLineIndices: undefined });
    }

    private _updateBarLines = () => {
        let { chart } = this.props;

        if (chart && chart.bars) {
            if (!this.state.lastInLineIndices) {

                let lastInLineIndices = chart.bars.map((b, i) => i);
                this.setState({ lastInLineIndices });

            } else if (!this.state.linesAreGrouped) {
                this._groupBarsIntoLines();
            } else {
                this._shrinkChordsIfNecessary()
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

            if (barWidth > chartWidth / 2) {

                if (currGroup.length > 0) {
                    lastInLineIndices.push(currGroup[currGroup.length - 1]);
                }

                lastInLineIndices.push(barIdx);
                currGroup = [];
                return;

            } else if (barWidth > chartWidth / 4) {

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

    private _shrinkChordsIfNecessary = () => {
        let updateMade = false;

        $(".bar-container").each(function(barIdx) {

            let $bar = $(this) as JQuery<HTMLElement>;
            let currInnerWidth = 0;

            $bar.children().each(function() {
                currInnerWidth += $(this).width() as number;
            });

            if (currInnerWidth > ($bar.width() as number)) {
                let $chords = $bar.find(".bar-chord-group");
                let currFontSize = parseFloat($chords.css("font-size"));

                $chords.css("font-size", `${currFontSize - 0.5}px`);
                updateMade = true;
            }
        });

        if (updateMade) {
            this.forceUpdate();
        }
    }
};

export default ChartViewer;