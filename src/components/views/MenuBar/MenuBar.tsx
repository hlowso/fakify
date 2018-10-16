import React, { Component } from "react";
import { Button, Glyphicon } from "react-bootstrap";
import { Search } from "../Search/Search";
import "./MenuBar.css";

export interface IMenuBarProps {
    openMIDISettingsModal: () => void;
    songTitles: { [songId: string]: string };
    onSongTitleClick: (songId: string) => void;
}

export interface IMenuBarState {

}

class MenuBar extends Component<IMenuBarProps, IMenuBarState> {
    constructor(props: IMenuBarProps) {
        super(props);
        this.state = {

        };
    }

    public render() {
        let { openMIDISettingsModal } = this.props;
        return (
            <div id="menu-bar">
                <div style={{ height: 20, width: 28 }} />
                <Search songTitles={this.props.songTitles} onSongTitleClick={this.props.onSongTitleClick} />
                <Button style={{ padding: "3px 6px" }} onClick={openMIDISettingsModal} >
                    <Glyphicon glyph="cog"  />
                </Button>
            </div>
        );
    }
};

export default MenuBar;