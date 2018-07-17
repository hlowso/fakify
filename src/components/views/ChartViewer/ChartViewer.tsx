import React, { Component } from "react";
import * as Cx from "classnames";
import * as Util from "../../../shared/Util";
import * as MusicHelper from "../../../shared/music/MusicHelper";
import Chart from "../../../shared/music/Chart";
import { ISong, IMusicIdx, NoteName, Tempo } from "../../../shared/types";
import "./ChartViewer.css";

export interface IChartViewerProps {
    song: ISong;
    chart: Chart;
    sessionIdx: IMusicIdx;
    onBarClick: (barIdx: number) => void;
    recontextualize: (noteName: NoteName) => void;
    resetTempo: (tempo: Tempo) => void;
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
        let { song, chart } = this.props;
        let loading = !Util.objectIsEmpty(song) &&
                        !Util.objectIsEmpty(chart);

        return loading 
            ? (
                <div id="chart-viewer">
                    <header className="chart-header">
                        {this.renderLeftHandSettings()}
                        <h1 className="song-title">{song.title}</h1>
                        <div />
                    </header>
                    <section className="chart-body">
                        {this.renderProgression()}
                    </section>
                </div>
            )
            : <h2>No Song Selected</h2>;
    }

    public renderProgression = (): JSX.Element[] => {
        let { chart, sessionIdx } = this.props;
        let { bars, rangeStartIdx, rangeEndIdx } = chart;
        let baseKey = bars[0].chordSegments[0].key;
        sessionIdx = sessionIdx || {};

        return bars.map((bar, i) => {
            let chordNames = [];
            let beats = [];
            let isCurrentlyPlayingBar = sessionIdx.barIdx === i;
            let isWithinRange = rangeStartIdx <= i &&
                                i <= rangeEndIdx;

            let barClasses = Cx({ 
                "bar-container": true, 
                "within-range": isWithinRange,
                "current-bar": isCurrentlyPlayingBar
            });

            console.log(bar.chordSegments);

            for (let beatIdx = 0; beatIdx < bar.timeSignature[1]; beatIdx ++) {
                let segmentIdx;
                let chordSegment = bar.chordSegments.find((segment, idx) => { 
                    segmentIdx = idx;
                    return segment.beatIdx === beatIdx;
                });

                let isCurrentChord = isCurrentlyPlayingBar && 
                                    sessionIdx.segmentIdx === segmentIdx;

                let chordNameClasses = Cx({
                    "chord-name": true,
                    "current-chord": isCurrentChord
                });

                chordNames.push(
                    <span className={chordNameClasses} key={beatIdx}>
                        {chordSegment && MusicHelper.getPresentableChord(chordSegment.chord, baseKey)}
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
                    onClick={() => this.props.onBarClick(i)} 
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
        let { context } = this.props.chart;
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
                    onChange={event => this.props.recontextualize((event.target.value as NoteName))}
                >
                    {options}
                </select> 
            </div>
        );

    }

    /**
     * TEMPO SELECT
     */

    public renderTempoSelect = (): JSX.Element => {
        let { tempo } = this.props.chart;
        let bpms = tempo[0];
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
                    onChange={event => this.props.resetTempo([Number(event.target.value), 4])}
                >
                    {options}
                </select> 
            </div>
        );
    }
};

export default ChartViewer;