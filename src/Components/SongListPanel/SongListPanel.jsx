import React, { Component } from "react";
import Cx from "classnames";

import "./SongListPanel.css";

class SongListPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {
        return (
            <div id="song-list-panel">
                {this.renderSongList()}
            </div>
        );
    }

    renderSongList() {
        let { songTitles, selectedTitle } = this.props;
        let listItems = [];
        for (let title of songTitles) {
            let classes = Cx({
                "song-list-panel-item": true,
                "selected": title === selectedTitle
            });
            listItems.push(
                <div key={title} className={classes}>
                    <span>{title}</span>
                </div>
            );
        }        
        return listItems;
    }
};

export default SongListPanel;