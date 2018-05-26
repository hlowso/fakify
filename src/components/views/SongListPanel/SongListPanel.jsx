import React, { Component } from "react";
import Cx from "classnames";

import * as Util from "../../../shared/Util";

import "./SongListPanel.css";

class SongListPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {
        let { songTitles } = this.props; 
        let songTitlesLoaded = !Util.objectIsEmpty(songTitles); 

        return (
            <div id="song-list-panel">
                {songTitlesLoaded ? this.renderSongList() : <p>loading songlist...</p>}
            </div>
        );
    }

    renderSongList() {
        let { 
            songTitles, 
            selectedSongId,
            onSongListItemClick 
        } = this.props;

        let listItems = [];

        for (let songId in songTitles) {
            let title = songTitles[songId];
            
            let classes = Cx({
                "song-list-panel-item": true,
                "selected": songId === selectedSongId
            });

            listItems.push(
                <div 
                    key={title} 
                    className={classes}
                    onClick={() => onSongListItemClick(songId)} >
                    <span>{title}</span>
                </div>
            );
        }        
        return listItems;
    }
};

export default SongListPanel;