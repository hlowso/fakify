import React, { Component } from "react";
import Cx from "classnames";

import * as Util from "../../../shared/Util";

import "./ChartViewer.css";

class ChartViewer extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {
        let { song } = this.props;
        let songLoaded = !Util.objectIsEmpty(song);

        return songLoaded 
            ? (
                <div id="chart-viewer">
                    <header className="chart-header">
                        <h1>{song.title}</h1>
                    </header>
                    <section className="chart-body">{this.renderProgression()}</section>
                </div>
            )
            : <h2>No Song Selected</h2>;
    }

    renderProgression() {
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
};

export default ChartViewer;