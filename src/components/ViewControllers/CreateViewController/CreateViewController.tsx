import React, { Component } from "react";
import ChartViewer from "../../views/ChartViewer/ChartViewer";
import * as Api from "../../../shared/Api";
import { ISong } from "../../../shared/types";
import Chart from "../../../shared/music/Chart";
import "./CreateViewController.css";

export interface ICreateVCProps {
    StateHelper: any;
}

export interface ICreateVCState {
    loadingSongTitles: boolean;
    userSongTitles?: string[];
    editingSong?: ISong;
    editingChart?: Chart;
}

class CreateViewController extends Component<ICreateVCProps, ICreateVCState> {
    constructor(props: ICreateVCProps) {
        super(props);
        this.state = {
            loadingSongTitles: true
        };
    }

    public componentWillMount() {
        Api.getUserSongTitles()
            .then(titles => {
                this.setState({ 
                    loadingSongTitles: false,
                    userSongTitles: titles 
                });
            });
    }

    public render() {
        return (
            <div id="create-view">
                {this.renderCentralPanel()}
            </div>
        );
    }

    public renderCentralPanel() {
        let { loadingSongTitles, userSongTitles, editingChart } = this.state;

        let content: JSX.Element | JSX.Element[] = (
            <div>loading songs...</div>
        );

        if (!loadingSongTitles) {
            if (Array.isArray(userSongTitles) && userSongTitles.length > 0) {
                content = userSongTitles.map(title => (
                        <span>{title}</span>
                    )
                );
            } else {
                content = (
                    <ChartViewer
                        chart={editingChart} 
                    />
                );
            }
        }

        return (
            <div className="central-container" >
                {content}
            </div>
        );
    }
}

export default CreateViewController;

