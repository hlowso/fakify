const _keys = {
    MIDI_INPUT_ID: "MIDI_INPUT_ID",
    SELECTED_SONG_ID: "SELECTED_SONG_ID"
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
