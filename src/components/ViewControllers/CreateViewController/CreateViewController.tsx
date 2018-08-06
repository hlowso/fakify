import React, { Component } from "react";
import ChartViewer from "../../views/ChartViewer/ChartViewer";
import { BarEditingModal } from "../../views/BarEditingModal/BarEditingModal";
import * as Util from "../../../shared/Util";
import * as Api from "../../../shared/Api";
import { ISong, IChartBar } from "../../../shared/types";
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
                    this._editingChart = new Chart(
                        this.forceUpdate.bind(this)
                    );
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
            editBar 
        } = this.state;

        let content: JSX.Element | JSX.Element[] = (
            <div>loading songs...</div>
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

        if (!loadingSongTitles) {
            if (!this._editingChart) {
                content = (userSongTitles as string[]).map(title => (
                        <span>{title}</span>
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
                    />
                );
            }
        }

        return (
            <div className="central-container" >
                {content}
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
                    chordSegments: []
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
}

export default CreateViewController;

