import React, { Component } from "react";
import ChartViewer from "../../views/ChartViewer/ChartViewer";
import { BarEditingModal } from "../../views/BarEditingModal/BarEditingModal";
import { MAX_TITLE_LENGTH } from '../../../shared/Constants';
import * as Util from "../../../shared/Util";
import * as Api from "../../../shared/Api";
import { ISong, IChartBar, ChordShape, Tabs, NoteName, TimeSignature } from "../../../shared/types";
import Chart from "../../../shared/music/Chart";
import $ from "jquery";
import "./CreateViewController.css";
import { Button, ButtonGroup, Glyphicon } from "react-bootstrap";

export interface ICreateVCProps {
    StateHelper: any;
    redirect: (tab: Tabs) => void;
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
    editingTitle?: string;
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
        this._refreshSongTitlesAsync().then(() => this.setState(stateUpdate));
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
        } = this.state;

        let content: JSX.Element | JSX.Element[] = (
            <div>loading songs...</div>
        );

        if (!loadingSongTitles) {
            content = (
                !this._editingChart
                    ? this.renderSongList()
                    : this.renderEditingChart()
            );
        }

        let dynamicStyles = {} as any;
        let $nav = $(".nav-container");
        let navHeight = $nav.outerHeight();

        if (Number.isFinite(navHeight as number)) {
            dynamicStyles.height = window.innerHeight - (navHeight as number);
        }

        return (
            <div className="central-container" style={dynamicStyles} >
                {content}
                {this.renderFooterButtons()}
                {this.renderBarEditingModal()}
            </div>
        );
    }

    public renderSongList() {
        let buttonSection = (
            <div id="song-list-header" >
                <Button 
                    bsStyle="success" 
                    bsSize="large"
                    onClick={this._onNewSong} >
                    New Song
                </Button>
            </div>
        );

        let list = (
            <div id="song-list">
                {this.renderSongListItems()}
            </div>
        );

        return (
            <div id="song-list-container" >
                {buttonSection}
                {list}
            </div>
        );
    }

    public renderSongListItems() {
        let { userSongTitles } = this.state;
        userSongTitles = userSongTitles as { [chartId: string]: string };

        let listItems = [];

        for (let chartId in userSongTitles) {
            listItems.push({
                chartId,
                title: userSongTitles[chartId]
            });
        }

        listItems.sort((a, b) => a.title < b.title ? -1 : 1);

        return listItems.map(titleItem => (
            <div className="user-title" >
                <ButtonGroup style={{ width: "100%", height: "100%"  }}>
                    <Button 
                        onClick={() => this._onChooseEditSongAsync(titleItem.chartId)}
                        style={{ width: "95%", fontSize: "130%", height: "100%" }}
                    >
                        {titleItem.title}
                    </Button>
                    <Button 
                        onClick={() => this._onDeleteSongAsync(titleItem.chartId)}
                        bsStyle="danger" style={{ width: "5%", height: "100%" }}
                    >
                        <Glyphicon glyph="trash"/>
                    </Button>
                </ButtonGroup>
            </div>
        ));
    }

    public renderEditingChart() {
        let { editingSong } = this.state;
        return (
            <ChartViewer
                editingMode={true}
                song={editingSong}
                chart={this._editingChart}
                editingTitle={this.state.editingTitle}
                chartTitleError={this.state.errorMessage === "Song title already exists"} 
                onEditBar={this._onEditBar}
                onAddBar={this._onAddBar}
                onDeleteBar={this._onDeleteBar}
                onEditTitle={title => this._onEditingTitleChange(title)}
                onSongTitleChange={() => this._onSongTitleChangeAsync()}
            />
        );
    }

    public renderFooterButtons() {

        let { errorMessage, editingSong, editingTitle } = this.state;

        let disableSave = typeof editingTitle === "string" || 
                            !editingSong || 
                            !editingSong.title || 
                            !editingSong.title.trim() || 
                            editingSong.title.trim().length > MAX_TITLE_LENGTH ||
                            errorMessage === "Song title already exists";

        return this._editingChart && (
            <div className="footer-section" >
                <ButtonGroup bsSize="large" >
                    <Button onClick={this._onSaveChart} disabled={disableSave} >Save</Button>
                    <Button onClick={this._onCancel}>Cancel</Button>                
                    <Button onClick={this._onStartOver}>Start Over</Button>
                </ButtonGroup>
                {errorMessage && <span style={{ color: "red" }}>{errorMessage}</span>}
            </div>
        );
    }

    public renderBarEditingModal() {
        let { isUpdatingBar, isAddingBar, editBar} = this.state;
        if (!this._editingChart) {
            return;
        }

        return (isUpdatingBar || isAddingBar) && (
            <BarEditingModal 
                isOpen={true}
                close={() => this.setState({ isAddingBar: false, isUpdatingBar: false })}
                editingBar={editBar as IChartBar}
                onEdit={updatedEditingBar => this.setState({ editBar: updatedEditingBar })}
                onSave={this._onSaveBar}
                currentContext={this._editingChart.context}
            />
        );
    }

    private _onNewSong = () => {
        this.setState({ 
            editingSong: {},
            errorMessage: undefined,
            editingTitle: ""
        }, () => this._resetChart(true));
    }

    private _onAddBar = (barIdx: number) => {

        if (!this._editingChart) {
            return;
        }

        if (barIdx === 0) {
            this.setState({
                isAddingBar: true,
                editBar: this._getInitialBar(
                    this._editingChart.context, 
                    this._editingChart.bars[0].timeSignature
                )
            });
        } else {
            this._editingChart.addBar(barIdx);
        }
    }

    private _onEditBar = (barIdx: number) => {
        let stateUpdate: ICreateVCState = { 
            isUpdatingBar: true,
            editBar: Util.copyObject((this._editingChart as Chart).bars[barIdx]) 
        };
        this.setState(stateUpdate);
    }

    private _onDeleteBar = (barIdx: number) => {
        (this._editingChart as Chart).deleteBar(barIdx);
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
            originalTempo: [120, 4],
            barsBase: (this._editingChart as Chart).barsBase
        };
    }

    private _onSaveChart = () => {
        let { redirect } = this.props;
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
                        redirect(Tabs.Create);
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
        this.setState({ updatingChartId: "", editingSong: undefined, errorMessage: undefined, editingTitle: undefined });
        this.forceUpdate();
    }

    private _onStartOver = () => {
        let { updatingChartId } = this.state;
        if (!updatingChartId) {
            return;
        }

        this._onChooseEditSongAsync(updatingChartId)
    }

    private _resetChart = (newSong?: boolean) => {

        let { editingSong } = this.state;

        this._editingChart = new Chart(
            this.forceUpdate.bind(this),
            editingSong ? editingSong.barsBase : undefined,
            editingSong ? editingSong.originalContext : undefined,
            editingSong ? editingSong.originalTempo : [ 120, 4 ]
        );

        if (newSong) {
            this._editingChart.addBar(0, this._getInitialBar())
        }
    }

    private _onSongTitleChangeAsync = async () => {
        let { editingTitle, updatingChartId } = this.state;

        if (!editingTitle || !editingTitle.trim() || editingTitle.trim().length > MAX_TITLE_LENGTH) {
            return;
        }

        let existingSong = await Api.getSongByTitleAsync(editingTitle);

        if (existingSong && existingSong.chartId !== updatingChartId) {
            this.setState({ errorMessage: "Song title already exists" });
            return;
        }

        this._updateSongTitle(editingTitle);        
    }

    private _onEditingTitleChange = (editingTitle?: string) => {

        let { editingSong } = this.state;

        if (!editingSong) {
            return;
        }

        if (typeof editingTitle !== "string") {
            editingTitle = editingSong.title;
        }

        if (typeof editingTitle !== "string" || editingTitle.length > MAX_TITLE_LENGTH) {
            return;
        }

        this.setState({ editingTitle, errorMessage: undefined })
    }   

    private _updateSongTitle = (title?: string) => {
        let songUpdate = Util.copyObject(this.state.editingSong) as ISong;

        if (!songUpdate) {
            return;
        }

        songUpdate.title = title;
        this.setState({ 
            editingSong: songUpdate,
            editingTitle: undefined, 
            errorMessage: ""
        });
    }

    private _onChooseEditSongAsync = async (chartId: string) => {
        let editingSong = await Api.getSongAsync(chartId)
            
        if (editingSong) {
            this.setState({ 
                editingSong, 
                updatingChartId: chartId 
            }, this._resetChart);
        }
    }

    private _onDeleteSongAsync = async (chartId: string) => {
        await Api.deleteSongAsync(chartId);
        await this._refreshSongTitlesAsync();
    }

    private _refreshSongTitlesAsync = async() => {
        let titles = await Api.getUserSongTitles();

        if (Util.length(titles) === 0) {
            this._onNewSong();
        } else {
            this.setState({ userSongTitles: titles });
        }
    }

    private _getInitialBar = (context?: NoteName, timeSignature?: TimeSignature): IChartBar => {
        return {
            barIdx: 0,
            timeSignature: timeSignature || [4, 4],
            chordSegments: [{
                beatIdx: 0,
                chordName: [
                    context || "C", 
                    ChordShape.Maj
                ]
            }]
        }
    }
}

export default CreateViewController;

