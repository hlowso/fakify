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
    userSongTitles?: string[];
    editingSong?: ISong;
    isUpdatingBar?: boolean;
    isAddingBar?: boolean;
    editBar?: IChartBar;
    errorMessage?: string;
}

class CreateViewController extends Component<ICreateVCProps, ICreateVCState> {
    private _editingChart: Chart;

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
                if (titles.length === 0) {
                    stateUpdate.editingSong = {
                        title: "Untitled"
                    };
                    this._resetChart();
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
                content = (userSongTitles as string[]).map(title => (
                        <span onClick={() => this._onChooseEditSong("")} >{title}</span>
                    )
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

        let footerButtons = (
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

    private _onBarClick = (barIdx: number) => {
        let stateUpdate: ICreateVCState = { 
            isUpdatingBar: true,
            editBar: Util.copyObject(this._editingChart.bars[barIdx]) 
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
            this._editingChart.addBar(barIdx);
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
                this._editingChart.addBar(editBar.barIdx, editBar);
            }
            if (isUpdatingBar) {
                this._editingChart.updateBar(editBar.barIdx, editBar);
            }   
        }

        this.setState(stateUpdate);
    }

    private _consolidateSong = (): ISong => {
        let { editingSong } = this.state;
        return {
            title: (editingSong as ISong).title,
            originalContext: this._editingChart.context,
            barsBase: this._editingChart.barsBase
        };
    }

    private _onSaveChart = () => {
        let newSong = this._consolidateSong();
        Api.saveSongAsync(newSong)
            .then((result: string) => {
                switch (result) {
                    case Api.SaveSongResults.Ok:
                        Util.redirect("create");
                        break;
                    case Api.SaveSongResults.TitleExists:
                        this.setState({ errorMessage: "Song title exists" });
                        break;
                    case Api.SaveSongResults.InvalidSong:
                    default:
                        this.setState({ errorMessage: "There was an error saving your song" });
                        break;
                }
            });
    }

    private _onStartOver = () => {
        this._resetChart();
        this._onSongTitleChange("Untitled");
    }

    private _resetChart = () => {
        this._editingChart = new Chart(
            this.forceUpdate.bind(this)
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

    }
}

export default CreateViewController;

