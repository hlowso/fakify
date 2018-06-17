import React, { Component } from "react";

import { PlayMode } from "../../../shared/types";
import * as Util from "../../../shared/Util";

import "./TrainingWindow.css";

class TrainingWindow extends Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {

        };
    }

    public render() {
        let { trainingFeedback } = this.props;
        return (
            <div id="training-window">
                <button onClick={this.props.startSession} >
                    Play
                </button>
                <button onClick={this.props.stopSession} >
                    Stop
                </button>
                {this.renderPlayModeSelect()}
                {!Util.objectIsEmpty(trainingFeedback) && [
                    <div style={{color: "white"}} key={0}>{`Notes Out Of Time: ${trainingFeedback.notesOutOfTime}`}</div>,
                    <div style={{color: "white"}} key={1}>{`Notes In Key: ${trainingFeedback.notesInKeyAndInTime}`}</div>,
                    <div style={{color: "white"}} key={2}>{`Total in Time: ${trainingFeedback.notesInTime}`}</div>
                ]}
            </div>
        );
    }

    private renderPlayModeSelect = () => {
        let options = Object.keys(PlayMode).map(key => (
            <option key={PlayMode[key]} value={PlayMode[key]}>
                {PlayMode[key]}
            </option>
        ));
        return (
            <select
                value={this.props.playMode} 
                onChange={event => this.props.setPlayMode(event.target.value)} >
                {options}
            </select>
        );
    }
};

export default TrainingWindow;