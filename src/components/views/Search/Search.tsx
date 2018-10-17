import React, { Component } from "react";
import { Button, Glyphicon, InputGroup, FormControl } from "react-bootstrap";
import { ISongTitle } from "../../../shared/types";
import "./Search.css";

export interface ISearchProps {
    songTitles: { [songId: string]: string };
    onSongTitleClick: (songId: string) => void;
}

export interface ISearchState {
    query: string;
}

export class Search extends Component<ISearchProps, ISearchState> {
    constructor(props: ISearchProps) {
        super(props);
        this.state = {
            query: ""
        };
    }

    public render() {

        let { query } = this.state;
        let matchElems: JSX.Element[] = [];
        
        this._getCurrentMatches().forEach(match => {
            matchElems.push(
                <div
                    className="match" 
                    onClick={() => this._onSongTitleClick(match.songId as string)}
                >
                    {match.title}
                </div>
            );
        });

        return (
            <div id="search" style={{ display: "flex", flexDirection: "column", width: "40%" }} >
                <InputGroup style={{ width: "100%" }} >
                    <FormControl 
                        placeholder="Search for a chart" 
                        onChange={this._onChange} 
                        onKeyDown={this._onSearchBarKeyDown}
                        value={query}
                    />
                    <InputGroup.Button>
                        <Button onClick={this._onSearchButtonClick} ><Glyphicon glyph="search" /></Button>
                    </InputGroup.Button>
                    
                </InputGroup>
                <div className="matches">
                    {matchElems}
                </div>
            </div>
        );
    }

    /**
     * HANDLERS
     */

    private _onChange = (evt: React.SyntheticEvent<any>) => {
        this.setState({ query: (evt.target as any).value });
    }

    private _onSongTitleClick = (songId: string) => {
        this.setState({ query: "" });
        this.props.onSongTitleClick(songId);
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

    /**
     * HELPERS
     */

    private _getCurrentMatches = (): ISongTitle[] => {
        let { songTitles } = this.props;
        let { query } = this.state;

        if (!query || !songTitles) {
            return [];
        }

        let matchingTitles: ISongTitle[] = [];

        for (let songId in songTitles) {
            let title = songTitles[songId];
            if (title.startsWith(query)) {
                matchingTitles.push({ songId, title });
            }
        }

        matchingTitles.sort((a, b) => (a.title < b.title) ? -1 : 1);

        return matchingTitles;
    }

    private _loadTopMatch = () => {
        let matches = this._getCurrentMatches();
        if (Array.isArray(matches) && matches.length > 0) {
            this._onSongTitleClick(matches[0].songId as string);
        }
    }
}