import React, { Component } from "react";

import "./TrainingWindow.css";

class TrainingWindow extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {
        return (
            <div id="training-window">
                <button onClick={this.props.startSession} >
                    Play
                </button>
                <button onClick={this.props.stopSession} >
                    Stop
                </button>
            </div>
        );
    }
};

export default TrainingWindow;