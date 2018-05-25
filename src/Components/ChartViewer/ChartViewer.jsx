import React, { Component } from "react";

import * as Util from "../../shared/Util";

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
        let { progression } = song.chart;

        let barElements = [];
        for (let barNumber in progression) {
            let bar = progression[barNumber];
            let chordNames = [];
            let beats = [];

            // TODO: the following logic doesn't cover all timeSignature cases
            for (let beat = 1; beat <= song.timeSignature[1]; beat ++) {
                chordNames.push(<span className="chord-name" key={beat}>{bar[beat]}</span>);
                beats.push(<span className="beat" key={beat}>{beat}</span>);
            }
            barElements.push(
                <div className="bar-container" key={barNumber}>
                    <div className="bar-chord-group">
                        {chordNames}
                    </div>
                    <div className="bar-beat-group">
                        {beats}
                    </div>
                </div>
            );
        };

        return barElements;
    }
};

export default ChartViewer;