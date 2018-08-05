import React, { Component } from "react";
import * as Cx from "classnames";
import * as Util from "../../../shared/Util";
import * as MusicHelper from "../../../shared/music/MusicHelper";
import Chart from "../../../shared/music/Chart";
import { ISong, IMusicIdx, NoteName, Tempo } from "../../../shared/types";
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
}

export interface IChartViewerState {

}

class ChartViewer extends Component<IChartViewerProps, IChartViewerState> {
    constructor(props: IChartViewerProps) {
        super(props);
        this.state = {

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
                    <h1 className="song-title">{(song as ISong).title}</h1>
                </header>
                <section className="chart-body">
                    {this.renderProgression()}
                </section>
            </div>
        );
    }

    public renderProgression = (): JSX.Element[] => {
        let { chart, sessionIdx, editingMode } = this.props;
        let { bars, rangeStartIdx, rangeEndIdx } = chart as Chart;
        let renderBars: JSX.Element[] = [];

        if (bars && bars.length > 0) {
            let baseKey = bars[0].chordSegments[0].key;

            renderBars = bars.map((bar, i) => {
                let chordNames = [];
                let beats = [];
                let isCurrentlyPlayingBar = sessionIdx && sessionIdx.barIdx === i;
                let isWithinRange = rangeStartIdx <= i &&
                                    i <= rangeEndIdx;

                let barClasses = Cx({ 
                    "bar-container": true, 
                    "within-range": isWithinRange,
                    "current-bar": isCurrentlyPlayingBar
                });

                for (let beatIdx = 0; beatIdx < bar.timeSignature[1]; beatIdx ++) {
                    let segmentIdx;
                    let chordSegment = bar.chordSegments.find((segment, idx) => { 
                        segmentIdx = idx;
                        return segment.beatIdx === beatIdx;
                    });

                    let isCurrentChord = isCurrentlyPlayingBar &&
                                        sessionIdx && 
                                        sessionIdx.segmentIdx === segmentIdx;

                    let chordNameClasses = Cx({
                        "chord-name": true,
                        "current-chord": isCurrentChord
                    });

                    let chordName = chordSegment ? chordSegment.chordName : null; 

                    chordNames.push(
                        <span className={chordNameClasses} key={beatIdx}>
                            {chordName && `${MusicHelper.getPresentableNoteName(chordName[0] as NoteName, baseKey)}${chordName[1]}`}
                        </span>
                    );
                    
                    beats.push(
                        <span className="beat" key={beatIdx}>
                            {beatIdx + 1}
                        </span>
                    );
                }

                return (
                    <div 
                        key={i}
                        className={barClasses}
                        onClick={() => this._onBarClick(i)} 
                    >
                        <div className="bar-chord-group">
                            {chordNames}
                        </div>
                        <div className="bar-beat-group">
                            {beats}
                        </div>
                    </div>
                );
            });
        }

        if (editingMode) {
            renderBars.push(
                <div 
                    key={bars.length}
                    className="bar-container"
                    onClick={() => this._onAddBar(bars.length)} 
                >
                    <span>+</span>
                </div>

            );
        }
        

        return renderBars
        
    }

    public renderLeftHandSettings = (): JSX.Element => {
        return (
            <div className="left-hand-settings">
                {this.renderKeyContextSelect()}
                {this.renderTempoSelect()}
            </div>
        );
    }

    private _onBarClick = (barIdx: number) => {
        let { onBarClick } = this.props;
        if (onBarClick) {
            onBarClick(barIdx);
        }
    }

    private _onAddBar = (barIdx: number) => {
        let { onAddBar } = this.props;
        if (onAddBar) {
            onAddBar(barIdx);
        }
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