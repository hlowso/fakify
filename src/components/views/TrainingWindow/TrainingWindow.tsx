import React, { Component } from "react";
import { PlayMode } from "../../../shared/types";
import "./TrainingWindow.css";

class TrainingWindow extends Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {

        };
    }

    public render(): JSX.Element {
        let { startSession, stopSession } = this.props;
        return (
            <div id="training-window">
                <div className="menu-bar">
                    <button onClick={startSession} >
                        Play
                    </button>
                    <button onClick={stopSession} >
                        Stop
                    </button>
                    {this.renderPlayModeSelect()}
                </div>
                <div className="feedback-window">
                    {this.renderFeedback()}
                </div>
            </div>
        );
    }

    public renderPlayModeSelect = (): JSX.Element => {
        let options = Object.keys(PlayMode).map(key => (
            <option key={PlayMode[key]} value={PlayMode[key]}>
                {PlayMode[key]}
            </option>
        ));
        return (
            <select
                className="play-mode-select"
                value={this.props.playMode} 
                onChange={event => this.props.setPlayMode(event.target.value)} >
                {options}
            </select>
        );
    }

    public renderFeedback = (): JSX.Element => {
        if (!this.props.score) {
            return <div />;
        }
        switch (this.props.playMode) {
            case PlayMode.Improv:
                return this.renderImprovFeedback();
            default:
                return <div />
        }
    }

    public renderImprovFeedback = (): JSX.Element => {
        let { notesInKey, notesInTime, notesPlayed } = this.props.score;
        return (
            <div className="feedback">
                <span>In Key: {notesInKey} / {notesPlayed}</span>
                <span>In Time: {notesInTime} / {notesPlayed}</span>
            </div>
        );
    }
};

export default TrainingWindow;