import React, { Component } from "react";
import { Button } from "react-bootstrap";
import "./MenuBar.css";

export interface IMenuBarProps {
    openMIDISettingsModal: () => void;
}

export interface IMenuBarState {

}

class MenuBar extends Component<IMenuBarProps, IMenuBarState> {
    constructor(props: IMenuBarProps) {
        super(props);
        this.state = {

        };
    }

    render() {
        let { openMIDISettingsModal } = this.props;
        return (
            <div id="menu-bar">
                <Button onClick={openMIDISettingsModal} >Midi Settings</Button>
            </div>
        );
    }
};

export default MenuBar;