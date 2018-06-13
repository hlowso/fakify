let STORAGE_UUID = "0b48c2d5-4583-4d17-8cc7-2b3a74a43d08"; 

const _getStorageKey = key => {
    return `${STORAGE_UUID}#${key}`;
}

const _get = keySuffix => {
    return window.localStorage[_getStorageKey(keySuffix)];
}

const _set = (keySuffix, value) => {
    window.localStorage[_getStorageKey(keySuffix)] = value;
}

const _keys = {
    MIDI_INPUT_ID: "MIDI_INPUT_ID",
    SELECTED_SONG_ID: "SELECTED_SONG_ID",
    SONG_SETTINGS_PREFIX: "SONG_SETTINGS_",
    PLAY_MODE: "PLAY_MODE"
}

export const getMidiInputId = () => {
    return _get(_keys.MIDI_INPUT_ID);
}

export const setMidiInputId = midiInputId => {
    _set(_keys.MIDI_INPUT_ID, midiInputId);
}

export const getSelectedSongId = () => {
    return _get(_keys.SELECTED_SONG_ID);
}

export const setSelectedSongId = selectedSongId => {
    _set(_keys.SELECTED_SONG_ID, selectedSongId);
}

export const getSongSettings = songId => {
    let settingsString = _get(`${_keys.SONG_SETTINGS_PREFIX}${songId}`);
    try {
        let settings = JSON.parse(settingsString);
        return settings;
    } catch (error) {
        console.log("PRECOMP - cannot parse string:", settingsString);
    }
    return {};
}

export const updateSongSettings = (songId, settingsUpdate) => {
    let settings = getSongSettings(songId);
    _set(`${_keys.SONG_SETTINGS_PREFIX}${songId}`, JSON.stringify({ 
        ...settings,
        ...settingsUpdate 
    }));
}

export const getPlayMode = () => {
    return _get(_keys.PLAY_MODE);
}

export const setPlayMode = playMode => {
    _set(_keys.PLAY_MODE, playMode);
}
