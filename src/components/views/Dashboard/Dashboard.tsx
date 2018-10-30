import React, { Component } from "react";
import { Button, Glyphicon } from "react-bootstrap";
import "./Dashboard.css";
import * as MusicHelper from "../../../shared/music/MusicHelper";
import { NoteName, Tempo } from "../../../shared/types";

/**
 * NO SLEEP
 */

const NoSleep = require("nosleep.js");
let noSleep = new NoSleep();
let noSleepEnabled = false;

// Courtesy of https://stackoverflow.com/questions/16863917/check-if-class-exists-somewhere-in-parent-vanilla-js
// returns true if the element or one of its parents has the class classname
function ancestorHasClass(element: Element, classname: string): boolean {
    if (element.className.split(' ').indexOf(classname)>=0) return true;
    return !!element.parentElement && ancestorHasClass((element as Element).parentElement as Element, classname);
}

function enableNoSleep(evt: Event) {
    let toggleCondition = (
        evt instanceof KeyboardEvent && evt.code === "Space" || 
        (
            evt instanceof MouseEvent && 
            !!evt.target && ancestorHasClass(evt.target as Element, "play-button")
        )
    );

    if (toggleCondition) {
        noSleepEnabled ? noSleep.disable() : noSleep.enable();
        noSleepEnabled = !noSleepEnabled;
    }
}

/**
 * COMPONENT
 */

export interface IDashboardProps {
    isMobile?: boolean;
    inSession?: boolean;
    chartIsLoaded?: boolean;
    context?: NoteName;
    hiddenKeyboard?: boolean;
    onKeyChange?: (context: NoteName) => void;
    tempo?: Tempo;
    onTempoChange?: (tempo: Tempo) => void;
    start?: () => void;
    stop?: () => void;
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
        for (
                let t = MusicHelper.LOWER_TEMPO_LIMIT; 
                t <= MusicHelper.UPPER_TEMPO_LIMIT; 
                t ++
        ) {
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
                className="play-button" 
                onClick={inSession ? this._onStop : this._onPlay } >
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
        let { chartIsLoaded, context } = this.props;

        if (!chartIsLoaded) {
            return;
        }
        
        return (
            <div style={{ display: "flex", alignSelf: "center" }} >
                <div>
                    Key:&nbsp;
                </div>
                <select 
                    value={context}
                    onChange={event => this._resetKey((event.target.value as NoteName))}
                    style={{ height: 20 }}
                >
                    {this.renderKeyOptions()}
                </select> 
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

    private _onPlay = () => {
        let { start, chartIsLoaded } = this.props;
        if (chartIsLoaded && start) {
            start();
        }
    }

    private _onStop = () => {
        let { stop, chartIsLoaded } = this.props;
        if (chartIsLoaded && stop) {
            stop();
        }
    }

    /**
     * LIFE CYCLE
     */

    public componentDidMount() {
        window.addEventListener("click", enableNoSleep, false);
        window.addEventListener("keyup", enableNoSleep, false);
    }

    public componentWillUnmount() {
        window.removeEventListener("click", enableNoSleep, false);
        window.removeEventListener("keyup", enableNoSleep, false);
        noSleep.disable();
    }
}