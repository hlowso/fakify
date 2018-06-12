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
        let { song } = this.props;
        let songLoaded = !Util.objectIsEmpty(song);

        return songLoaded 
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
        let { song, chartIndex } = this.props;
        let { barsV1 } = song.chart;

        return barsV1.map((bar, i) => {
            let chordNames = [];
            let beats = [];
            let isCurrentBar = chartIndex.bar === i;

            let barClasses = Cx({ 
                "bar-container": true, 
                "current-bar": isCurrentBar
            });

            for (let beat = 1; beat <= bar.timeSignature[1]; beat ++) {
                let chordEnvelopeIndex;
                let chordEnvelope = bar.chordEnvelopes.find((envelope, i) => { 
                    if (Number(envelope.beat) === beat) {
                        chordEnvelopeIndex = i;
                        return true;
                    } 
                });

                let isCurrentChord = isCurrentBar && 
                                    chartIndex.chordEnvelope === chordEnvelopeIndex;

                let chordNameClasses = Cx({
                    "chord-name": true,
                    "current-chord": isCurrentChord
                });

                chordNames.push(<span className={chordNameClasses} key={beat}>{chordEnvelope && chordEnvelope.chord}</span>);
                beats.push(<span className="beat" key={beat}>{beat}</span>);
            }

            return (
                <div className={barClasses} key={bar.barIndex}>
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
                {this.renderKeySignatureSelect()}
                {this.renderTempoSelect()}
            </div>
        );
    }

    /**
     * KEY SIGNATURE SELECT
     */

    renderKeySignatureSelect = () => {
        let { keySignature } = this.props.song.chart;
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
                    value={keySignature}
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
        let { tempo } = this.props.song.chart;
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