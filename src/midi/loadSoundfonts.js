import loadAcousticGrandPiano from "./soundfonts/acoustic_grand_piano-ogg";
import loadSynthDrum from "./soundfonts/synth_drum-ogg";
import loadReverseCymbal from "./soundfonts/reverse_cymbal-ogg";

const loadSoundfonts = MIDI => {
    loadAcousticGrandPiano(MIDI);
    loadSynthDrum(MIDI);
    loadReverseCymbal(MIDI);
};

export default loadSoundfonts