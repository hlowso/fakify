// Steps for adding a new instrument:
//  1. download some sf2.js from https://surikov.github.io/webaudiofontdata/sound/
//  2. add the sf2.js file to publc/soundfonts/ 
//  3. add the instrument to the soundfonts object in the
//  following format

const soundfonts = {
    piano: {
        name: "piano",
        variable: "_tone_0000_Aspirin_sf2_file",
        url: "/soundfonts/0000_Aspirin_sf2_file.js"
    },

    doubleBass: {
        name: "doubleBass",
        variable: "_tone_0320_Aspirin_sf2_file",
        url: "/soundfonts/0320_Aspirin_sf2_file.js"
    },

    // These drumkit sounds come from https://surikov.github.io/webaudiofontdata/sound/drums_0_Chaos_sf2_fileDrum_Stan1_SC88P.html
    bassDrum: {
        name: "bassDrum",
        variable: "_drum_35_0_Chaos_sf2_file",
        url: "/soundfonts/drums/12835_0_Chaos_sf2_file.js",
        pitch: 35
    },

    snareDrum: {
        name: "snareDrum",
        variable: "_drum_40_0_Chaos_sf2_file",
        url: "/soundfonts/drums/12840_0_Chaos_sf2_file.js",
        pitch: 40
    },

    shutHiHat: {
        name: "shutHiHat",
        variable: "_drum_44_0_Chaos_sf2_file",
        url: "/soundfonts/drums/12844_0_Chaos_sf2_file.js",
        pitch: 44
    },

    rideCymbal: {
        name: "rideCymbal",
        variable: "_drum_59_0_Chaos_sf2_file",
        url: "/soundfonts/drums/12859_0_Chaos_sf2_file.js",
        pitch: 59
    },
    
};

export default soundfonts;