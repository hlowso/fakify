import soundfonts from "../../../soundfontsIndex";

export const compDrumsSwingFeelV0 = bars => {

    return bars.map(bar => {

        let phrases = [];

        bar.chordEnvelopes.forEach(chordEnvelope => {
            let fullBeatsCouplets = chordEnvelope.durationInSubbeats / 6;
            let ridePhrase = [],
                hiHatPhrase = [];
            
            if (chordEnvelope.durationInSubbeats % 6) {
                ridePhrase.push([{
                    subbeatOffset: 0,
                    notes: [window[soundfonts["rideCymbal"]].pitch],
                    durationInSubbeats: chordEnvelope.durationInSubbeats,
                    velocity: 1
                }]);
            } else {
                for (let i = 0; i < fullBeatsCouplets; i ++) {
                    ridePhrase = [...ridePhrase, 
                        // ding, ding-gah
                        { subbeatOffset: i * 6, notes: [soundfonts["rideCymbal"].pitch], durationInSubbeats: 3, velocity: 1},
                        { subbeatOffset: 3 + i * 6, notes: [soundfonts["rideCymbal"].pitch], durationInSubbeats: 2, velocity: 1},
                        { subbeatOffset: 5 + i * 6, notes: [soundfonts["rideCymbal"].pitch], durationInSubbeats: 1, velocity: 0.6}
                    ];
                    hiHatPhrase = [...hiHatPhrase, 
                        { subbeatOffset: i * 6 + 3, notes: [soundfonts["shutHihat"].pitch], durationInSubbeats: 3, velocity: 1 }
                    ];
                }
            }

            phrases.push({
                "rideCymbal": ridePhrase,
                "shutHihat": hiHatPhrase
            });
        });

        return phrases;
    }); 
};

export default compDrumsSwingFeelV0;