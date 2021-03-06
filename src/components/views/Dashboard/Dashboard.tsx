import React, { Component } from "react";
import { Button, Glyphicon } from "react-bootstrap";
import "./Dashboard.css";
import * as MusicHelper from "../../../shared/music/MusicHelper";
import { NoteName, Tempo } from "../../../shared/types";
import { MAX_BPM, MIN_BPM } from "src/shared/Constants";

/**
 * COMPONENT
 */

export interface IDashboardProps {
    isMobile?: boolean;
    inSession?: boolean;
    chartIsLoaded?: boolean;
    context?: NoteName;
    contextQuality?: "Major" | "Minor" | null;
    hiddenKeyboard?: boolean;
    onKeyChange?: (context: NoteName) => void;
    tempo?: Tempo;
    onTempoChange?: (tempo: Tempo) => void;
    onSelectAllBars?: () => void;
    onSelectAllBarsHoverChange?: (hovering: boolean) => void;
}

export interface IDashboardState {

}

export class Dashboard extends Component<IDashboardProps, IDashboardState> {
    constructor(props: IDashboardProps) {
        super(props);
        this.state = {

        };
    }

    public render() {
        let { chartIsLoaded, hiddenKeyboard, isMobile } = this.props;

        let dynamicStyle = {
            minWidth: isMobile ? undefined : 760,
            width: isMobile ? "100%" : undefined,
            height: chartIsLoaded ? 40 : 20,
            bottom: hiddenKeyboard ? 0 : isMobile ? 100 : 160
        };

        return (
            <div id="dashboard" style={dynamicStyle}>
                {this.renderTempoSelect()}
                {this.renderSelectAllBars()}
                {this.renderPlayButton()}
                {this.renderLegend()}
                {this.renderKeySelect()}
            </div>
        );
    }

    public renderTempoSelect() {
        let { chartIsLoaded, tempo } = this.props;

        if (!chartIsLoaded) {
            return;
        }

        let bpms = (tempo as Tempo)[0];

        return (
            <div style={{ display: "flex", alignSelf: "center" }} >
                <div>
                    &#9833;&nbsp;=&nbsp;   
                </div>
                <select 
                    value={bpms}
                    onChange={event => this._resetTempo([Number(event.target.value), 4])}
                    style={{ height: 20 }}
                >
                    {this.renderTempoOptions()}
                </select> 
            </div>
        );
    }

    public renderTempoOptions() {
        let options = [];
        for (let t = MIN_BPM; t <= MAX_BPM; t ++) {
            options.push(
                <option key={t} value={t} >
                    {t}
                </option>
            );
        }

        return options;
    }

    public renderSelectAllBars() {
        let { chartIsLoaded, onSelectAllBars, onSelectAllBarsHoverChange } = this.props;

        if (!chartIsLoaded || !onSelectAllBars || !onSelectAllBarsHoverChange) {
            return;
        }

        return (
            <Button 
                title="Select all bars" 
                className="select-all-bars" 
                onClick={() => (onSelectAllBars as () => void)()}
                onMouseEnter={() => (onSelectAllBarsHoverChange as (hovering: boolean) => void)(true) } 
                onMouseLeave={() => (onSelectAllBarsHoverChange as (hovering: boolean) => void)(false) } >
                <Glyphicon glyph={"sort"} />
            </Button>
        );
    }

    public renderPlayButton() {
        let { chartIsLoaded, inSession } = this.props;

        if (!chartIsLoaded) {
            return;
        }

        return (
            <Button 
                className="play-button"  >
                <Glyphicon glyph={inSession ? "stop" : "play"} />
            </Button>
        );
    }

    public renderLegend() {
        let { chartIsLoaded, hiddenKeyboard, isMobile } = this.props;

        if (isMobile) {
            return;
        }

        let dynamicStyle = hiddenKeyboard ? { width: 20, height: 20 } : undefined; 
        let content = !hiddenKeyboard && (
            <span style={{ display: "flex" }}>
                <div style={{ width: 10, height: 10, backgroundColor: "coral", margin: 0, alignSelf: "center" }} />&nbsp;= In Key
            </span>
        );

        return chartIsLoaded && (
            <div className="legend" style={dynamicStyle}>
                {content}
            </div>
        );
    }

    public renderKeySelect() {
        let { chartIsLoaded, context, contextQuality } = this.props;

        if (!chartIsLoaded) {
            return;
        }
        
        return (
            <div style={{ display: "flex", alignSelf: "center" }} >
                <select 
                    value={context}
                    onChange={event => this._resetKey((event.target.value as NoteName))}
                    style={{ height: 20 }}
                >
                    {this.renderKeyOptions()}
                </select> 
                <div>
                    &nbsp;{contextQuality || ""}
                </div>
            </div>
        );
    }

    public renderKeyOptions() {
        return MusicHelper.NOTE_NAMES.map(
            k => (
                <option key={k} value={k} >
                    {k}
                </option>
            )
        );
    }

    /**
     * HANDLERS
     */

    private _resetTempo = (tempo: Tempo) => {
        let { onTempoChange, chartIsLoaded } = this.props;
        if (chartIsLoaded && onTempoChange) {
            onTempoChange(tempo);
        }
    }

    private _resetKey = (key: NoteName) => {
        let { onKeyChange, chartIsLoaded } = this.props;
        if (chartIsLoaded && onKeyChange) {
            onKeyChange(key);
        }
    }
}