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
import { ISong, NoteName, PlayMode, Tempo, IMusicIdx, IChartBar, ISoundActions, IStateHelper } from "../../../shared/types";
import { Dashboard } from "../../views/Dashboard/Dashboard";
import $ from "jquery";

export interface IPlayVCProps {
    isMobile: boolean;
    SoundActions: ISoundActions;
    StateHelper: IStateHelper;
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
    private _chart?: Chart;
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

        this.onClickPlayButton = this.onClickPlayButton.bind(this);
    }

    /*****************
        LIFE CYCLE  
    ******************/

    public componentDidMount() {
        let selectedSongId = StorageHelper.getSelectedSongId();
        let hideKeyboard = StorageHelper.getHideKeyboard();

        if (hideKeyboard !== this.state.hideKeyboard) {
            this.setState({ hideKeyboard });
        }

        this.loadSongTitlesAsync(selectedSongId);

        window.addEventListener("keydown", this._onKeyDown);
        window.addEventListener("keyup", this._onKeyUp);

        window.addEventListener("click", this.onClickPlayButton, false);

        window.addEventListener("blur", this._stopSession);
    }

    public componentWillUnmount() {
        this._stopSession();

        window.removeEventListener("keydown", this._onKeyDown);
        window.removeEventListener("keyup", this._onKeyUp);

        window.removeEventListener("click", this.onClickPlayButton, false);

        window.removeEventListener("blur", this._stopSession);
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

        if (!$currBar || !$chart) {
            return;
        }

        let currBarY = $currBar.offset().top;
        let chartUpperLimit = $chart.offset().top + 150;
        let chartLowerLimit = $chart.offset().top + $chart.height() - 150;

        if (chartUpperLimit >= chartLowerLimit) {
            return;
        }

        let chartScrollTop = $chart[0].scrollTop;
        let chartScrollBottom = $chart[0].scrollHeight - $chart.height();
        let distanceFromLimitToSweetSpot = (chartLowerLimit - chartUpperLimit) / 2;

        if (currBarY < chartUpperLimit && chartScrollTop !== 0) {
            $chart[0].scrollTop -= (chartUpperLimit - currBarY) + distanceFromLimitToSweetSpot;
            this.forceUpdate();
        } else if (currBarY > chartLowerLimit && chartScrollTop !== chartScrollBottom) {
            $chart[0].scrollTop += (currBarY - chartLowerLimit) + distanceFromLimitToSweetSpot;
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

        let inSession = sessionManager && sessionManager.inSession;
        let sessionFailed = sessionManager && sessionManager.failure;
        let chartIsLoaded = !!this._chart && !sessionFailed;
        let sessionIdx = inSession ? sessionManager.sessionIdx : null;
        let currNoteClasses = inSession ? sessionManager.currKeyNoteClasses : [];
        let firstNote = inSession ? (sessionManager as ListeningSessionManager).firstNote : NaN;
        let rangeStartNote = inSession ? (sessionManager as ListeningSessionManager).rangeStartNote : MusicHelper.LOWEST_A;
        let rangeEndNote = inSession ? (sessionManager as ListeningSessionManager).rangeEndNote : MusicHelper.HIGHEST_C;
        let showKeyChanges = true;
        let lowestKey = isMobile ? (window.innerWidth > 700 ? 33 : 45) : MusicHelper.LOWEST_A;
        let highestKey = isMobile ? (window.innerWidth > 550 ? 84 : 72) : MusicHelper.LOWEST_A + 87;

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
                        context={chartIsLoaded ? (this._chart as Chart).context : undefined}
                        hiddenKeyboard={hideKeyboard}
                        onKeyChange={this._recontextualize}
                        tempo={chartIsLoaded ? (this._chart as Chart).tempo : undefined}
                        onTempoChange={this._resetTempo}
                        onSelectAllBars={this._onSelectAllBars}
                        onSelectAllBarsHoverChange={this._onToggleSelectAllBarsHover} />
                </div>
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

        noSleep.disable();
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

    /************
        MUSIC
    ************/

    private _resetChart = () => {
        this._stopSession();

        let { selectedSong } = this.state;

        if (!selectedSong) {
            return;
        }

        let { _id, barsBase, originalTempo, originalContext } = selectedSong as ISong;

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

        console.log(JSON.stringify(this._chart.barsBase, null, 2));
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

    public onSongListItemClick = (selectedSongId?: string) => {
        StorageHelper.setSelectedSongId(selectedSongId);

        if (!selectedSongId) {
            this._chart = undefined;
            return this.setState({ selectedSong: undefined });
        }

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

        if (!noSleepEnabled()) {
            noSleep.enable();
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

        if (sessionManager && sessionManager.inSession) {
            this._stopSession(); 
        } else {
            this._startSession();
        }

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

    // It seems that the window itself needs to subscribe to the function that calls noSleep.enable(),
    // so I've added the on play button click handler here
    private onClickPlayButton(evt: Event) {
        if(!evt.target || !ancestorHasClass(evt.target as Element, "play-button")) {
            return;
        }
    
        if (!!this.props.sessionManager && this.props.sessionManager.inSession) {
            noSleep.disable();
            this._stopSession();
        } else {
            noSleep.enable();
            this._startSession();
        }
    }
    
}

export default PlayViewController;

/**
 * NO SLEEP
 */

const NoSleep = require("nosleep.js");
let noSleep = new NoSleep();

// Courtesy of https://stackoverflow.com/questions/16863917/check-if-class-exists-somewhere-in-parent-vanilla-js
// returns true if the element or one of its parents has the class classname
function ancestorHasClass(element: Element, classname: string): boolean {
    if (element.className.split(' ').indexOf(classname)>=0) return true;
    return !!element.parentElement && ancestorHasClass((element as Element).parentElement as Element, classname);
}

function noSleepEnabled() {
    return !!noSleep.noSleepTimer || (noSleep.noSleepVideo && !noSleep.noSleepVideo.paused);
}
