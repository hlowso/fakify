const _keys = {
    MIDI_INPUT_ID: "MIDI_INPUT_ID",
    SELECTED_SONG_ID: "SELECTED_SONG_ID",
    SONG_SETTINGS_PREFIX: "SONG_SETTINGS_"
}

export const getMidiInputId = () => {
    return window.localStorage[_keys.MIDI_INPUT_ID]
}

export const setMidiInputId = midiInputId => {
    window.localStorage[_keys.MIDI_INPUT_ID] = midiInputId;
}

export const getSelectedSongId = () => {
    return window.localStorage[_keys.SELECTED_SONG_ID]
}

export const setSelectedSongId = selectedSongId => {
    window.localStorage[_keys.SELECTED_SONG_ID] = selectedSongId;
}

export const getSongSettings = songId => {
    let settings = window.localStorage[`${_keys.SONG_SETTINGS_PREFIX}${songId}`];
    if (typeof settings === "object") {
        return JSON.parse(settings);
    }
    return null;
}

export const setSongSettings = (songId, settings) => {
    window.localStorage[`${_keys.SONG_SETTINGS_PREFIX}${songId}`] = JSON.stringify(settings);
}
