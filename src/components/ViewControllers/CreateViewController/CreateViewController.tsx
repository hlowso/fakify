import React, { Component } from "react";
import ChartViewer from "../../views/ChartViewer/ChartViewer";
import { BarEditingModal } from "../../views/BarEditingModal/BarEditingModal";
import * as Util from "../../../shared/Util";
import * as Api from "../../../shared/Api";
import { ISong, IChartBar, ChordShape } from "../../../shared/types";
import Chart from "../../../shared/music/Chart";
import "./CreateViewController.css";

export interface ICreateVCProps {
    StateHelper: any;
}

export interface ICreateVCState {
    loadingSongTitles?: boolean;
    userSongTitles?: { [chartId: string]: string };
    editingSong?: ISong;
    isUpdatingBar?: boolean;
    isAddingBar?: boolean;
    editBar?: IChartBar;
    errorMessage?: string;
    updatingChartId?: string;
}

class CreateViewController extends Component<ICreateVCProps, ICreateVCState> {
    private _editingChart?: Chart;

    constructor(props: ICreateVCProps) {
        super(props);
        this.state = {
            loadingSongTitles: true,
            isUpdatingBar: false,
            isAddingBar: false,
        };
    }

    public componentWillMount() {
        let stateUpdate: ICreateVCState = { loadingSongTitles: false };
        Api.getUserSongTitles()
            .then(titles => {
                if (Util.length(titles) === 0) {
                    this._onNewSong();
                } else {
                    stateUpdate.userSongTitles = titles;
                }
                this.setState(stateUpdate);
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
        let { 
            loadingSongTitles, 
            userSongTitles, 
            editingSong, 
            isUpdatingBar,
            isAddingBar,
            editBar,
            errorMessage 
        } = this.state;

        let content: JSX.Element | JSX.Element[] = (
            <div>loading songs...</div>
        );

        if (!loadingSongTitles) {
            if (!this._editingChart) {
                content = [];
                userSongTitles = userSongTitles as { [chartId: string]: string };

                for (let chartId in userSongTitles) {
                    content.push(
                        <div className="user-title" onClick={() => this._onChooseEditSong(chartId)} >
                            {userSongTitles[chartId]}
                        </div>
                    );
                }

                content.push(
                    <button style={{ marginLeft: 20 }} onClick={ this._onNewSong }>
                        New Song
                    </button>
                );
            } else {
                content = (
                    <ChartViewer
                        editingMode={true}
                        song={editingSong}
                        chart={this._editingChart} 
                        onBarClick={this._onBarClick}
                        onAddBar={this._onAddBar}
                        onSongTitleChange={this._onSongTitleChange}
                    />
                );
            }
        }

        let buttonStyle = {
            width: 150,
            height: 30,
            fontSize: "150%"
        };

        let footerButtons = this._editingChart && (
            <div style={{ 
                position: "fixed", 
                display: "flex", 
                width: "800px", 
                height: "100px", 
                justifyContent: "space-around", 
                alignItems: "center", 
                bottom: 0, 
                backgroundColor: "#222"
            }}>
                <button style={buttonStyle} onClick={this._onSaveChart}>Save</button>
                <button style={buttonStyle} onClick={this._onCancel}>Cancel</button>                
                <button style={buttonStyle} onClick={this._onStartOver}>Start Over</button>
                {errorMessage && <span style={{ color: "red" }}>{errorMessage}</span>}
            </div>
        );

        let barEditingModal = (isUpdatingBar || isAddingBar) && (
            <BarEditingModal 
                isOpen={true}
                close={() => this.setState({ isAddingBar: false, isUpdatingBar: false })}
                editingBar={editBar as IChartBar}
                onEdit={updatedEditingBar => this.setState({ editBar: updatedEditingBar })}
                onSave={this._onSaveBar}
            />
        );

        return (
            <div className="central-container" >
                {content}
                {footerButtons}
                {barEditingModal}
            </div>
        );
    }

    private _onNewSong = () => {
        this.setState({ editingSong: {
            title: "Untitled"
        }});
        this._resetChart();
    }

    private _onBarClick = (barIdx: number) => {
        let stateUpdate: ICreateVCState = { 
            isUpdatingBar: true,
            editBar: Util.copyObject((this._editingChart as Chart).bars[barIdx]) 
        };
        this.setState(stateUpdate);
    }

    private _onAddBar = (barIdx: number) => {
        if (barIdx === 0) {
            this.setState({
                isAddingBar: true,
                editBar: {
                    barIdx: 0,
                    timeSignature: [4, 4],
                    chordSegments: [{
                        beatIdx: 0,
                        chordName: ["C", ChordShape.Maj]
                    }]
                }
            });
        } else {
            (this._editingChart as Chart).addBar(barIdx);
        }
    }

    private _onSaveBar = () => {
        let { editBar, isAddingBar, isUpdatingBar } = this.state;
        let stateUpdate: ICreateVCState = {
            isAddingBar: false,
            isUpdatingBar: false
        }

        if (editBar) {
            if (isAddingBar) {
                (this._editingChart as Chart).addBar(editBar.barIdx, editBar);
            }
            if (isUpdatingBar) {
                (this._editingChart as Chart).updateBar(editBar.barIdx, editBar);
            }   
        }

        this.setState(stateUpdate);
    }

    private _consolidateSong = (): ISong => {
        let { editingSong } = this.state;
        return {
            title: (editingSong as ISong).title,
            originalContext: (this._editingChart as Chart).context,
            barsBase: (this._editingChart as Chart).barsBase
        };
    }

    private _onSaveChart = () => {
        let { updatingChartId } = this.state;
        let newSong = this._consolidateSong();

        let promise = (
            updatingChartId 
                ? Api.updateSongAsync(updatingChartId, newSong) 
                : Api.saveSongAsync(newSong)
        ); 

        promise.then((result: string) => {
                switch (result) {
                    case Api.SaveSongResults.Ok:
                        Util.redirect("create");
                        break;
                    case Api.SaveSongResults.TitleExists:
                        this.setState({ errorMessage: "Song title exists" });
                        break;
                    case Api.SaveSongResults.InvalidSong:
                    case Api.SaveSongResults.Error:
                    default:
                        this.setState({ errorMessage: "There was an error saving your song" });
                        break;
                }
            });
    }

    private _onCancel = () => {
        this._editingChart = undefined;
        this.setState({ updatingChartId: "" });
        this.forceUpdate();
    }

    private _onStartOver = () => {
        this._resetChart();
        this._onSongTitleChange("Untitled");
    }

    private _resetChart = () => {
        let { editingSong } = this.state;
        this._editingChart = new Chart(
            this.forceUpdate.bind(this),
            editingSong ? editingSong.barsBase : undefined,
            editingSong ? editingSong.originalContext : undefined
        );
    }

    private _onSongTitleChange = (updatedTitle: string) => {
        let songUpdate = Util.copyObject(this.state.editingSong) as ISong;
        songUpdate.title = updatedTitle;
        this.setState({ 
            editingSong: songUpdate, 
            errorMessage: ""
        });
    }

    private _onChooseEditSong = (chartId: string) => {
        Api.getSongAsync(chartId)
            .then(editingSong => {
                if (editingSong) {
                    this.setState({ 
                        editingSong, 
                        updatingChartId: chartId 
                    }, this._resetChart);
                }
            });
    }
}

export default CreateViewController;

