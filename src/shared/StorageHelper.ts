import { IChartSettings, PlayMode } from "./types";

let STORAGE_UUID = "0b48c2d5-4583-4d17-8cc7-2b3a74a43d08"; 

export class StorageHelper {
    private _getStorageKey = (key: string): string => {
        return `${STORAGE_UUID}#${key}`;
    }
    
    private _get = (keySuffix: string): string => {
        return window.localStorage[this._getStorageKey(keySuffix)];
    }
    
    private _set = (keySuffix: string, value: string) => {
        window.localStorage[this._getStorageKey(keySuffix)] = value;
    }
    
    private _keys = {
        MIDI_INPUT_ID: "MIDI_INPUT_ID",
        SELECTED_SONG_ID: "SELECTED_SONG_ID",
        CHART_SETTINGS_PREFIX: "CHART_SETTINGS_",
        PLAY_MODE: "PLAY_MODE"
    }
    
    public getMidiInputId = (): string => {
        return this._get(this._keys.MIDI_INPUT_ID);
    }
    
    public setMidiInputId = (midiInputId: string) => {
        this._set(this._keys.MIDI_INPUT_ID, midiInputId);
    }
    
    public getSelectedSongId = (): string => {
        return this._get(this._keys.SELECTED_SONG_ID);
    }
    
    public setSelectedSongId = (selectedSongId: string) => {
        this._set(this._keys.SELECTED_SONG_ID, selectedSongId);
    }
    
    public getChartSettings = (songId: string): IChartSettings => {
        let settingsString = this._get(`${this._keys.CHART_SETTINGS_PREFIX}${songId}`);
        try {
            let settings = JSON.parse(settingsString);
            return settings;
        } catch (error) {
            console.log("PRECOMP - cannot parse string:", settingsString);
        }
        return {};
    }
    
    public updateChartSettings = (songId: string, settingsUpdate: IChartSettings) => {
        let settings = this.getChartSettings(songId);
        this._set(`${this._keys.CHART_SETTINGS_PREFIX}${songId}`, JSON.stringify({ 
            ...settings,
            ...settingsUpdate 
        }));
    }
    
    public getPlayMode = (): PlayMode => {
        return this._get(this._keys.PLAY_MODE) as PlayMode;
    }
    
    public setPlayMode = (playMode: PlayMode) => {
        this._set(this._keys.PLAY_MODE, playMode);
    }
}    