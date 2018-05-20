import React, { Component } from "react";

import "./ChartViewer.css";

class ChartViewer extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {
        let { song } = this.props;
        return (
            <div id="chart-viewer">
                <h1>{song.title}</h1>
                <div>{this.renderProgression()}</div>
            </div>
        );
    }

    renderProgression() {
        let { song } = this.props;
        let { progression } = song.chart;

        let barElements = [];
        for (let barNumber in progression) {
            let bar = progression[barNumber];
            // console.log("bar", bar);
            let beats = [];
            for (let beat in bar) {
                beats.push(<span key={beat}>{bar[beat]}</span>);
            }
            barElements.push(<div className="bar" key={barNumber}>{beats}</div>);
        };

        return barElements;
    }
};

export default ChartViewer;