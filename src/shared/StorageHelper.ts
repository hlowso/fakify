import { IChartSettings, PlayMode } from "./types";

let STORAGE_UUID = "0b48c2d5-4583-4d17-8cc7-2b3a74a43d08"; 

export class StorageHelper {
    public static getMidiInputId = (): string => {
        return StorageHelper._get(StorageHelper._keys.MIDI_INPUT_ID);
    }
    
    public static setMidiInputId = (midiInputId: string) => {
        StorageHelper._set(StorageHelper._keys.MIDI_INPUT_ID, midiInputId);
    }
    
    public static getSelectedSongId = (): string => {
        return StorageHelper._get(StorageHelper._keys.SELECTED_SONG_ID);
    }
    
    public static setSelectedSongId = (selectedSongId: string) => {
        StorageHelper._set(StorageHelper._keys.SELECTED_SONG_ID, selectedSongId);
    }
    
    public static getChartSettings = (songId: string): IChartSettings => {
        let settingsString = StorageHelper._get(`${StorageHelper._keys.CHART_SETTINGS_PREFIX}${songId}`);
        try {
            let settings = JSON.parse(settingsString);
            return settings;
        } catch (error) {
            console.log("PRECOMP - cannot parse string:", settingsString);
        }
        return {};
    }
    
    public static updateChartSettings = (songId: string, settingsUpdate: IChartSettings) => {
        let settings = StorageHelper.getChartSettings(songId);
        StorageHelper._set(`${StorageHelper._keys.CHART_SETTINGS_PREFIX}${songId}`, JSON.stringify({ 
            ...settings,
            ...settingsUpdate 
        }));
    }
    
    public static getPlayMode = (): PlayMode => {
        return StorageHelper._get(StorageHelper._keys.PLAY_MODE) as PlayMode;
    }
    
    public static setPlayMode = (playMode: PlayMode) => {
        StorageHelper._set(StorageHelper._keys.PLAY_MODE, playMode);
    }

    private static _keys = {
        MIDI_INPUT_ID: "MIDI_INPUT_ID",
        SELECTED_SONG_ID: "SELECTED_SONG_ID",
        CHART_SETTINGS_PREFIX: "CHART_SETTINGS_",
        PLAY_MODE: "PLAY_MODE"
    }

    private static _getStorageKey = (key: string): string => {
        return `${STORAGE_UUID}#${key}`;
    }
    
    private static _get = (keySuffix: string): string => {
        return window.localStorage[StorageHelper._getStorageKey(keySuffix)];
    }
    
    private static _set = (keySuffix: string, value: string) => {
        window.localStorage[StorageHelper._getStorageKey(keySuffix)] = value;
    }
}    