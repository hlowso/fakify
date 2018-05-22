import React, { Component } from "react";
import { Button } from "react-bootstrap";

import "./MenuBar.css";

class MenuBar extends Component {
    constructor(props) {
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