import React, { Component } from "react";

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
        let { song } = this.props;
        let { barsV1 } = song.chart;

        return barsV1.map(bar => {
            let chordNames = [];
            let beats = [];

            for (let beat = 1; beat <= bar.timeSignature[1]; beat ++) {
                let chordEnvelope = bar.chordEnvelopes.find(envelope => Number(envelope.beat) === beat);

                chordNames.push(<span className="chord-name" key={beat}>{chordEnvelope && chordEnvelope.chord}</span>);
                beats.push(<span className="beat" key={beat}>{beat}</span>);
            }

            return (
                <div className="bar-container" key={bar.barIndex}>
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