import React, { Component } from "react";
import { PlayMode, IImprovScore, IListeningScore } from "../../../shared/types";
import "./TrainingWindow.css";

export interface ITrainingWindowProps {
    startSession: () => void;
    stopSession: () => void;
    playMode: PlayMode;
    setPlayMode: (playMode: PlayMode) => void;
    report?: IImprovScore | IListeningScore;
    userShouldPlay?: boolean;
}

export interface ITrainingWindowState {

}

class TrainingWindow extends Component<ITrainingWindowProps, ITrainingWindowState> {
    constructor(props: ITrainingWindowProps) {
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
                onChange={event => this.props.setPlayMode(event.target.value as PlayMode)} >
                {options}
            </select>
        );
    }

    public renderFeedback = (): JSX.Element => {
        let feedbackSpans: JSX.Element[];
        
        switch (this.props.playMode) {
            case PlayMode.Improv:
                feedbackSpans = this.renderImprovFeedback();
                break;
            case PlayMode.Listening: 
                feedbackSpans = this.renderListeningFeedback();
                break;
            default:
                return <div />
        }

        return (
            <div className="feedback">
                {feedbackSpans}
            </div>
        );
    }

    public renderImprovFeedback = (): JSX.Element[] => {
        let { notesInKey, notesInTime, notesPlayed } = this.props.report as IImprovScore;
        return [
            <span key={0}>In Key: {notesInKey} / {notesPlayed}</span>,
            <span key={1}>In Time: {notesInTime} / {notesPlayed}</span>
        ];
    }

    public renderListeningFeedback = (): JSX.Element[] => {
        let { userShouldPlay, report } = this.props;
        let { percentCorrect } = report as IListeningScore;

        if (!userShouldPlay) {
            return [
                <span key={0}>Listen...</span>
            ];
        }

        let displayPercentage: string = (
            isNaN(percentCorrect) 
                ? "--" 
                : String(percentCorrect)
        );

        return [ 
            <span key={0}>Repeat</span>,
            <span key={1}>score: {displayPercentage}%</span> 
        ];
    }
};

export default TrainingWindow;