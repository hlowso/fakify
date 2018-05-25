const keys = {
    MIDI_INPUT_ID: "MIDI_INPUT_ID",
    SELECTED_SONG_ID: "SELECTED_SONG_ID"
}

export const getMidiInputId = () => {
    return window.localStorage[keys.MIDI_INPUT_ID]
}

export const setMidiInputId = midiInputId => {
    window.localStorage[keys.MIDI_INPUT_ID] = midiInputId;
}

export const getSelectedSongId = () => {
    return window.localStorage[keys.SELECTED_SONG_ID]
}

export const setSelectedSongId = selectedSongId => {
    window.localStorage[keys.SELECTED_SONG_ID] = selectedSongId;
}
