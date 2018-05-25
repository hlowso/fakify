import loadAcousticGrandPiano from "./soundfonts/acoustic_grand_piano-ogg";
import loadSynthDrum from "./soundfonts/synth_drum-ogg";

const loadSoundfonts = MIDI => {
    loadAcousticGrandPiano(MIDI);
    loadSynthDrum(MIDI);
};

export default loadSoundfonts