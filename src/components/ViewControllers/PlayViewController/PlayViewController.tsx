import React, { Component } from "react";

import MenuBar from "../../views/MenuBar/MenuBar";
import ChartViewer from "../../views/ChartViewer/ChartViewer";
import Keyboard from "../../views/Keyboard/Keyboard";
import SettingsModal from "../../views/SettingsModal/SettingsModal";

import * as Api from "../../../shared/Api";
import * as MusicHelper from "../../../shared/music/MusicHelper";
import { StorageHelper } from "../../../shared/StorageHelper";
import { SessionManager, ImprovSessionManager, ListeningSessionManager } from "../../../shared/music/SessionManager";
import Chart from "../../../shared/music/Chart";

import "./PlayViewControllerMobile.css";
import "./PlayViewController.css";
import { ISong, NoteName, PlayMode, Tempo, IMusicIdx, IChartBar } from "../../../shared/types";
import { Dashboard } from "../../views/Dashboard/Dashboard";
import $ from "jquery";

export interface IPlayVCProps {
    // TODO: get proper types for all this
    isMobile: boolean;
    SoundActions: any;
    StateHelper: any;
    sessionManager: SessionManager | ImprovSessionManager | ListeningSessionManager;
}

export interface IPlayVCState {
    loadingSelectedSong?: boolean;
    songTitles?: { [songId: string]: string }
    selectedSong?: ISong | {};
    settingsModalOpen?: boolean;
    playMode?: PlayMode;
    spaceClickDone?: boolean;
    hideKeyboard?: boolean;
    selectAllBarsHovered?: boolean;
}

class PlayViewController extends Component<IPlayVCProps, IPlayVCState> {
    private _chart: Chart;
    private _firstNoteColor = "mediumslateblue";

    constructor(props: IPlayVCProps) {
        super(props);
        this.state = {
            loadingSelectedSong: false,
            songTitles: {},
            selectedSong: {},
            settingsModalOpen: false,
            playMode: PlayMode.None,
            spaceClickDone: true, 
            hideKeyboard: false,
            selectAllBarsHovered: false     
        };
    }

    /*****************
        LIFE CYCLE  
    ******************/

    public componentDidMount() {
        let { SoundActions } = this.props;
        let midiInputId = StorageHelper.getMidiInputId();
        let selectedSongId = StorageHelper.getSelectedSongId();
        let hideKeyboard = StorageHelper.getHideKeyboard();

        if (hideKeyboard !== this.state.hideKeyboard) {
            this.setState({ hideKeyboard });
        }

        if (midiInputId) {
            let connectionSuccessful = SoundActions.connectToMidiInput(midiInputId);
            if (!connectionSuccessful) {
                StorageHelper.setMidiInputId("");
            }
            this.setState({ settingsModalOpen: !connectionSuccessful });
        }

        this.loadSongTitlesAsync(selectedSongId);

        window.addEventListener("keydown", this._onKeyDown);
        window.addEventListener("keyup", this._onKeyUp);
    }

    public componentWillUnmount() {
        this._stopSession();

        window.removeEventListener("keydown", this._onKeyDown);
        window.removeEventListener("keyup", this._onKeyUp);
    }

    public componentDidUpdate() {
        this._setScrollToPutCurrentBarInView();
    }

    private _setScrollToPutCurrentBarInView = () => {

        let { sessionManager } = this.props;

        if (!sessionManager || !sessionManager.inSession || !sessionManager.sessionIdx) {
            return;
        }

        let { sessionIdx } = sessionManager;

        let $chart = $("#chart-viewer") as any;
        let $currBar: any;

        $(".bar-container").each(function(barIdx) {
            if (barIdx === sessionIdx.barIdx ) {
                $currBar = $( this );
            }
        });

        if (!$currBar) {
            return;
        }

        let doUpdate = false;
        let currBarY = $currBar.offset().top;
        let chartUpperLimit = $chart.offset().top + 100;
        let chartLowerLimit = $chart.offset().top + $chart.height() - 100;

        let chartScrollTop = $chart[0].scrollTop;
        let chartScrollBottom = $chart[0].scrollHeight - $chart.height();

        if (currBarY < chartUpperLimit && chartScrollTop !== 0) {
            $chart[0].scrollTop -= 100;
            doUpdate = true;
        } else if (currBarY > chartLowerLimit && chartScrollTop !== chartScrollBottom) {
            $chart[0].scrollTop += 100;
            doUpdate = true;
        }

        if (doUpdate) {
            this.forceUpdate();
        }
    }

    /**************
        RENDERS  
    **************/

    public render() {
        let { sessionManager, isMobile } = this.props;
        let { 
            songTitles, 
            selectedSong, 
            settingsModalOpen, 
            loadingSelectedSong,
            hideKeyboard,
            selectAllBarsHovered
        } = this.state;

        // let selectedSongId = selectedSong ? (selectedSong as ISong)._id: null;
        let inSession = sessionManager && sessionManager.inSession;
        let sessionFailed = sessionManager && sessionManager.failure;
        let chartIsLoaded = !!this._chart && !sessionFailed;
        let sessionIdx = inSession ? sessionManager.sessionIdx : null;
        let currNoteClasses = inSession ? sessionManager.currKeyNoteClasses : [];
        let firstNote = inSession ? (sessionManager as ListeningSessionManager).firstNote : NaN;
        let rangeStartNote = inSession ? (sessionManager as ListeningSessionManager).rangeStartNote : MusicHelper.LOWEST_A;
        let rangeEndNote = inSession ? (sessionManager as ListeningSessionManager).rangeEndNote : MusicHelper.HIGHEST_C;
        let showKeyChanges = true;
        let lowestKey = isMobile ? 45 : MusicHelper.LOWEST_A;
        let highestKey = isMobile ? 72 : MusicHelper.LOWEST_A + 88;

        return (
            <div id="play-view" className={isMobile ? "mobile" : undefined}>
                <div>
                    <MenuBar
                        isMobile={isMobile} 
                        openMIDISettingsModal={() => this.setState({ settingsModalOpen: true })} 
                        songTitles={songTitles as { [chartId: string]: string }} 
                        onSongTitleClick={this.onSongListItemClick} />
                </div>
                <div className="chart-container" >
                    <ChartViewer
                        isMobile={isMobile}
                        editingMode={false}
                        hiddenKeyboard={hideKeyboard}
                        song={selectedSong as ISong}
                        chart={this._chart as Chart} 
                        sessionIdx={sessionIdx as IMusicIdx} 
                        recontextualize={this._recontextualize} 
                        resetTempo={this._resetTempo} 
                        onBarClick={this._onBarClick} 
                        sessionFailed={sessionFailed} 
                        resetChart={this._resetChart} 
                        loadingChart={loadingSelectedSong}
                        highlightAllOutOfRange={selectAllBarsHovered} />
                    <Dashboard 
                        isMobile={isMobile}
                        inSession={inSession}
                        chartIsLoaded={chartIsLoaded}
                        context={chartIsLoaded ? this._chart.context : undefined}
                        hiddenKeyboard={hideKeyboard}
                        onKeyChange={this._recontextualize}
                        tempo={chartIsLoaded ? this._chart.tempo : undefined}
                        onTempoChange={this._resetTempo}
                        start={this._startSession}
                        stop={this._stopSession} 
                        onSelectAllBars={this._onSelectAllBars}
                        onSelectAllBarsHoverChange={this._onToggleSelectAllBarsHover} />
                </div>
                
                    {/* <TrainingWindow  
                        startSession={this._startSession} 
                        stopSession={this._stopSession} 
                        setPlayMode={this._setPlayMode} 
                        playMode={playMode} 
                        report={report} 
                        userShouldPlay={userShouldPlay}
                        firstNoteColor={this._firstNoteColor} /> */}
                {!hideKeyboard && <Keyboard
                    isMobile={isMobile}
                    lowestKey={lowestKey}
                    highestKey={highestKey}
                    showKeyChanges={showKeyChanges} 
                    depressedKeys={this.props.StateHelper.getCurrentUserKeysDepressed()} 
                    currentKeyBasePitches={currNoteClasses.map(n => n.basePitch)} 
                    playUserMidiMessage={this.props.SoundActions.playUserMidiMessage} 
                    takeIsPlaying={inSession} 
                    firstNote={firstNote || NaN} 
                    rangeStartNote={rangeStartNote || MusicHelper.LOWEST_A}
                    rangeEndNote={rangeEndNote || MusicHelper.HIGHEST_C} 
                    firstNoteColor={this._firstNoteColor} />}

                <SettingsModal 
                    SoundActions={this.props.SoundActions} 
                    StateHelper={this.props.StateHelper} 
                    isOpen={!!settingsModalOpen} 
                    close={()=> this.setState({ settingsModalOpen: false })} 
                    hiddenKeyboard={!!hideKeyboard}
                    onToggleHideKeyboard={() => this.setState({ hideKeyboard: !hideKeyboard })} />
            </div>
        ); 
    }

    /****************
        DASHBOARD
    ****************/

    private _startSession = () => {
        if (!this._chart) {
            return;
        }
        let { playMode } = this.state;
        this.props.SoundActions.playRangeLoop(this._chart, playMode);
    }

    private _stopSession = () => {
        if (!this._chart) {
            return;
        }    
        this.props.SoundActions.killTake();
    }

    private _recontextualize = (newKeyContext: NoteName) => {
        this._stopSession();
        let { selectedSong } = this.state;

        (this._chart as Chart).context = newKeyContext;
        
        StorageHelper.updateChartSettings((selectedSong as ISong)._id as string, {
            context: newKeyContext
        });
    }

    private _resetTempo = (newTempo: Tempo) => {
        this._stopSession();
        let { selectedSong } = this.state;

        (this._chart as Chart).tempo = newTempo;

        StorageHelper.updateChartSettings((selectedSong as ISong)._id as string, {
            tempo: newTempo
        });
    }

    private _onSelectAllBars = () => {
        if (!this._chart) {
            return;
        }

        this._updateChartRange(0, this._chart.bars.length - 1);
    }

    private _onToggleSelectAllBarsHover = (hovering: boolean) => {
        if (!this._chart) {
            return;
        }

        this.setState({ selectAllBarsHovered: hovering });        
    }

    // private _setPlayMode = (playMode: PlayMode) => {
    //     this.setState({ playMode });
    // }

    /************
        MUSIC
    ************/

    private _resetChart = () => {
        this._stopSession();
        let { _id, barsBase, originalTempo, originalContext } = this.state.selectedSong as ISong;

        let chartSettings = StorageHelper.getChartSettings(_id as string);
        let playMode = StorageHelper.getPlayMode();

        let { tempo, context, feel, rangeStartIdx, rangeEndIdx } = chartSettings;
        if (!tempo) {
            tempo = originalTempo;
        }
        if (!context) {
            context = originalContext;
        }
        if (!Number.isInteger(rangeStartIdx as number)) {
            rangeStartIdx = 0;
        }
        if (!Number.isInteger(rangeEndIdx as number)) {
            rangeEndIdx = (
                (playMode === "listening")
                        ? 1
                        : (barsBase as IChartBar[]).length - 1
            );
        }

        this._chart = new Chart(
            this.forceUpdate.bind(this), 
            barsBase, 
            context, 
            tempo, 
            feel,
            rangeStartIdx, 
            rangeEndIdx,
            _id
        ); 
    }

    /*******************
        CHART VIEWER 
    *******************/

    private _onBarClick = (i: number) => {
        let { rangeEndIdx, rangeStartIdx } = this._chart as Chart;
        let withinRange = rangeStartIdx <= i && 
                          i <= rangeEndIdx;

        let rangeStartIdxUpdate = (
            withinRange
                ? i
                : i < rangeStartIdx
                    ? i
                    : rangeStartIdx
        );
        let rangeEndIdxUpdate = (
            withinRange
                ? i
                : rangeEndIdx < i
                    ? i
                    : rangeEndIdx
        );

        this._updateChartRange(rangeStartIdxUpdate, rangeEndIdxUpdate)
    }

    private _updateChartRange = (start: number, end: number) => {

        if (!this._chart) {
            return;
        }

        this._stopSession();

        let { selectedSong } = this.state;

        this._chart.rangeStartIdx = start;
        this._chart.rangeEndIdx = end;

        StorageHelper.updateChartSettings((selectedSong as ISong)._id as string, {
            rangeStartIdx: start,
            rangeEndIdx: end
        });
    }

    /**********************
        SONG LIST PANEL   
    **********************/

    public onSongListItemClick = (selectedSongId: string) => {
        StorageHelper.setSelectedSongId(selectedSongId);
        this.loadSongAsync(selectedSongId);
    }

    /**
     * GENERAL HANDLERS
     */

    private _onKeyDown: EventListenerOrEventListenerObject = (evt: KeyboardEvent) => {

        if((evt.target as Element).tagName === "INPUT") {
            return;
        }

        switch((evt.code)) {
            case "Space":
                evt.preventDefault();
                this._onSpace();
                break;

            default:
                break;
        }
    }

    private _onKeyUp: EventListenerOrEventListenerObject = (evt: KeyboardEvent) => {

        if((evt.target as Element).tagName === "INPUT") {
            return;
        }

        this.setState({ 
            spaceClickDone: true 
        });
    }

    private _onSpace = () => {
        let { sessionManager } = this.props;

        if (!this.state.spaceClickDone) {
            return;
        }

        sessionManager && sessionManager.inSession 
            ? this._stopSession() 
            : this._startSession();

        this.setState({ spaceClickDone: false });
    }

    /**
     * HELPERS
     */

    public async loadSongTitlesAsync(selectedSongId?: string) {
        let songTitles = await Api.getSongTitlesAsync();

        if (!songTitles) {
            return;
        } 

        this.setState({ songTitles });
        
        if (typeof selectedSongId === "string" && selectedSongId in songTitles) {
            this.loadSongAsync(selectedSongId);
        } 
    }

    public async loadSongAsync(chartId: string) {
        if (typeof chartId !== "string") {
            return;
        }

        this.setState({ loadingSelectedSong: true });

        let stateUpdate: IPlayVCState = { loadingSelectedSong: false };
        let stateCallback = () => {};

        let selectedSong = await Api.getSongAsync(chartId);

        if (selectedSong) {
            stateUpdate.selectedSong = selectedSong;
            stateCallback = this._resetChart;
        }

        this.setState(stateUpdate, stateCallback)
    }
    
}

export default PlayViewController;