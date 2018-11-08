import React, { Component } from "react";
import { Button, Glyphicon, InputGroup, FormControl } from "react-bootstrap";
import { ISongTitle } from "../../../shared/types";
import "./Search.css";

export interface ISearchProps {
    isMobile: boolean;
    songTitles: { [songId: string]: string };
    onSongTitleClick: (songId?: string) => void;
}

export interface ISearchState {
    query: string;
    showAll: boolean;
    ignoreBlur: boolean;
}

export class Search extends Component<ISearchProps, ISearchState> {

    private _matchHeight = 25;

    constructor(props: ISearchProps) {
        super(props);
        this.state = {
            query: "",
            showAll: false,
            ignoreBlur: false
        };
    }

    public render() {

        let { isMobile } = this.props;
        let { query } = this.state;
        let matchElems = this.renderMatchElements();
        let matchElemsMinHeight = (
            Array.isArray(matchElems) 
                ? (
                    isMobile
                        ? Math.min(275, matchElems.length * this._matchHeight)
                        : Math.min(400, matchElems.length * this._matchHeight)
                )
                : 0
        );

        return (
            <div id="search" style={{ display: "flex", flexDirection: "column", width: "40%", minWidth: 250 }} >
                <InputGroup style={{ width: "100%" }} >
                    <FormControl 
                        placeholder="Search for a chart" 
                        onChange={this._onChange} 
                        onKeyDown={this._onSearchBarKeyDown}
                        value={query}
                    />
                    <InputGroup.Button>
                        <Button title="Search" onClick={this._onSearchButtonClick} >
                            <Glyphicon glyph="search" />
                        </Button>
                    </InputGroup.Button>
                    <InputGroup.Button>
                        <Button title="Browse" onClick={this._onBrowse} onBlur={this._onLeaveBrowse} >
                            <Glyphicon glyph="align-justify" />
                        </Button>
                    </InputGroup.Button>
                    
                </InputGroup>
                <div className="matches" style={{ minHeight: matchElemsMinHeight }} >
                    {matchElems}
                </div>
            </div>
        );
    }

    public renderMatchElements() {
        return this._getCurrentMatches().map(match => (
                <div
                    className="match"
                    style={{ height: this._matchHeight }}
                    onClick={() => this._onSongTitleClick(match.chartId as string)}
                    onMouseEnter={this._onMatchEnter}
                    onMouseLeave={this._onMatchLeave}
                >
                    {match.title}
                </div>
            )
        );
    }

    /**
     * HANDLERS
     */

    private _onChange = (evt: React.SyntheticEvent<any>) => {
        this.setState({ query: (evt.target as any).value, showAll: false });
    }

    private _onSongTitleClick = (songId?: string) => {
        this.props.onSongTitleClick(songId);
        this.setState({ query: "", showAll: false });
    }

    private _onSearchButtonClick = (evt: React.SyntheticEvent<any>) => {
        this._loadTopMatch();
    }

    private _onSearchBarKeyDown = (evt: React.SyntheticEvent<any>) => {
        let key = (evt.nativeEvent as any).key;

        if (key === "Enter") {
            this._loadTopMatch();
        }
    }

    private _onBrowse = () => {
        this.setState({ query: "", showAll: true });
    }

    private _onLeaveBrowse = (evt: React.FocusEvent<Button>) => {
        if (this.state.ignoreBlur) {
            return;
        }
        this.setState({ showAll: false });
    }

    private _onMatchEnter = (evt: React.MouseEvent<Element>) => {
        this.setState({ ignoreBlur: true });
    }

    private _onMatchLeave = (evt: React.MouseEvent<Element>) => {
        let { toElement } = evt.nativeEvent;
        if (toElement && toElement.className.split(" ").indexOf("match") === -1) {
            this.setState({ ignoreBlur: false });
        }
    }

    /**
     * HELPERS
     */

    private _getCurrentMatches = (): ISongTitle[] => {
        let { songTitles } = this.props;
        let { query, showAll } = this.state;

        if (!songTitles) {
            return [];
        }

        let matchingTitles: ISongTitle[] = [];

        for (let chartId in songTitles) {
            let title = songTitles[chartId];
            let matchCondition = (
                title && 
                query &&
                typeof title === "string" && 
                typeof query === "string" && 
                query.trim() &&
                title.toLowerCase().startsWith(query.trim().toLowerCase())
            );

            if (showAll || matchCondition) {
                matchingTitles.push({ chartId, title });
            }
        }

        matchingTitles.sort((a, b) => (a.title < b.title) ? -1 : 1);

        return matchingTitles;
    }

    private _loadTopMatch = () => {
        let matches = this._getCurrentMatches();
        if (Array.isArray(matches) && matches.length > 0) {
            this._onSongTitleClick(matches[0].chartId as string);
        } else {
            this._onSongTitleClick();
        }
    }

    private _makeMatchesVisible = () => {
        let { query, showAll } = this.state;
        let zIndex = "";

        if (query || showAll) {
            zIndex = "-1";
        } 

        (document.querySelector(".chart-container") as any).style.zIndex = zIndex;
    }

    /**
     * LIFE CYCLE
     */

    public componentDidUpdate() {
        this._makeMatchesVisible();
    }
}