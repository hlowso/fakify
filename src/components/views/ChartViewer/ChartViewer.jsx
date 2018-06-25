import React, { Component } from "react";
import Cx from "classnames";

import * as Util from "../../../shared/Util";
import * as MusicHelper from "../../../shared/music/MusicHelper";

import "./ChartViewer.css";

class ChartViewer extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };

        this.LOWER_TEMPO_LIMIT = 60;
        this.UPPER_TEMPO_LIMIT = 180;
    }

    render() {
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
                    <section className="chart-body">{this.renderProgression()}</section>
                </div>
            )
            : <h2>No Song Selected</h2>;
    }

    renderProgression = () => {
        let { chart, currChartIdx } = this.props;
        let { bars, rangeStartIdx, rangeEndIdx } = chart;
        let baseKey = bars[0].chordSegments[0].key;
        currChartIdx = currChartIdx || {};

        return bars.map((bar, i) => {
            let chordNames = [];
            let beats = [];
            let isCurrentlyPlayingBar = currChartIdx.barIdx === i;
            let isWithinRange = rangeStartIdx <= i &&
                                i <= rangeEndIdx;

            let barClasses = Cx({ 
                "bar-container": true, 
                "within-range": isWithinRange,
                "current-bar": isCurrentlyPlayingBar
            });

            for (let beatIdx = 0; beatIdx < bar.timeSignature[1]; beatIdx ++) {
                let segmentIdx;
                let chordSegment = bar.chordSegments.find((segment, i) => { 
                    if (segment.beatIdx === beatIdx) {
                        segmentIdx = i;
                        return true;
                    } 
                });

                let isCurrentChord = isCurrentlyPlayingBar && 
                                    currChartIdx.segmentIdx === segmentIdx;

                let chordNameClasses = Cx({
                    "chord-name": true,
                    "current-chord": isCurrentChord
                });

                chordNames.push(
                    <span className={chordNameClasses} key={beatIdx}>
                        {chordSegment && MusicHelper.getPresentableChord(chordSegment.chord, baseKey)}
                    </span>
                );
                beats.push(<span className="beat" key={beatIdx}>{beatIdx + 1}</span>);
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

    renderLeftHandSettings = () => {
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

    renderKeyContextSelect = () => {
        let { keyContext } = this.props.chart;
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
                    value={keyContext}
                    onChange={event => this.props.recontextualize(event.target.value)}
                >
                    {options}
                </select> 
            </div>
        );

    }

    /**
     * TEMPO SELECT
     */

    renderTempoSelect = () => {
        let { tempo } = this.props.chart;
        let bpms = tempo[0];
        let options = [];
        for (
                let t = this.LOWER_TEMPO_LIMIT; 
                t <= this.UPPER_TEMPO_LIMIT; 
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