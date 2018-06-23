import * as FetchHelpers from "./FetchHelpers";

export const authenticate = () => {
    return FetchHelpers.GET('/api/admin/authenticate')
        .then(res => {
            if (res.status === 200) {
                return res.json();
            }
            return null;
        });
}

export const login = returningUser => {
    return FetchHelpers.PATCH('/api/admin/login', returningUser);
}

export const logout = () => {
    return FetchHelpers.PATCH('/api/admin/logout');
}

export const signup = newUser => {
    return FetchHelpers.POST('/api/admin/signup', newUser)
        .then(res => {
            if (res.status === 200) {
                return res.json();
            }
            return null;
        });
}

export const getSongTitlesAsync = () => {
    // hard-coded for now
    // TODO: create endpoint
    return new Promise((resolve, reject) => {
        resolve({
            "0": "#4",
            "1": "'Round Midnight",
            "2": "Bewitched",
            "3": "Bye Bye Blackbird",
            "4": "C Blues",
            "5": "Giant Steps",                
            "6": "Michelle",
            "7": "My Favourite Things",
            "8": "Now's The Time",
            "9": "Someday My Prince Will Come"
        });
    });
}

export const getSongAsync = songId => {
    // hard-coded for now
    // TODO: create endpoint
    return new Promise((resolve, reject) => {
        resolve({
            id: songId,
            title: "C Blues",
            originalKeyContext: "C",
            originalTempo: [120, 4],
            suitableFeels: ["swing"],
            barsBase: [
                {
                    barIndex: 0,
                    timeSignature: [8, 8],
                    chordSegments: [
                        {
                            beatIdx: 0,
                            chord: "1^7",
                            durationInBeats: 8,
                            key: "4"
                        }
                    ]
                },
                {
                    barIndex: 1,
                    timeSignature: [8, 8],
                    chordSegments: [
                        {
                            beatIdx: 0,
                            chord: "4^7",
                            durationInBeats: 8,
                            key: "J"
                        }
                    ]
                },
                {
                    barIndex: 2,
                    timeSignature: [8, 8],
                    chordSegments: [
                        {
                            beatIdx: 0,
                            chord: "1^7",
                            durationInBeats: 8,
                            key: "4"
                        }
                    ]
                },
                {
                    barIndex: 3,
                    timeSignature: [8, 8],
                    chordSegments: [
                        {
                            beatIdx: 0,
                            chord: "1^7",
                            durationInBeats: 8,
                            key: "4"
                        }
                    ]
                },
                {
                    barIndex: 4,
                    timeSignature: [8, 8],
                    chordSegments: [
                        {
                            beatIdx: 0,
                            chord: "4^7",
                            durationInBeats: 8,
                            key: "J"
                        }
                    ]
                },
                {
                    barIndex: 5,
                    timeSignature: [8, 8],
                    chordSegments: [
                        {
                            beatIdx: 0,
                            chord: "4^7",
                            durationInBeats: 8,
                            key: "J"
                        }
                    ]
                }, 
                {
                    barIndex: 6,
                    timeSignature: [8, 8],
                    chordSegments: [
                        {
                            beatIdx: 0,
                            chord: "1^7",
                            durationInBeats: 8,
                            key: "4"
                        }
                    ]
                },
                {
                    barIndex: 7,
                    timeSignature: [8, 8],
                    chordSegments: [
                        {
                            beatIdx: 0,
                            chord: "1^7",
                            durationInBeats: 8,
                            key: "4"
                        }
                    ]
                },
                {
                    barIndex: 8,
                    timeSignature: [8, 8],
                    chordSegments: [
                        {
                            beatIdx: 0,
                            chord: "5^7",
                            durationInBeats: 8,
                            key: "1"
                        }
                    ]
                },
                {
                    barIndex: 9,
                    timeSignature: [8, 8],
                    chordSegments: [
                        {
                            beatIdx: 0,
                            chord: "4^7",
                            durationInBeats: 8,
                            key: "J"
                        }
                    ]
                },
                {
                    barIndex: 10,
                    timeSignature: [8, 8],
                    chordSegments: [
                        {
                            beatIdx: 0,
                            chord: "1^7",
                            durationInBeats: 8,
                            key: "4"
                        }
                    ]
                },
                {
                    barIndex: 11,
                    timeSignature: [8, 8],
                    chordSegments: [
                        {
                            beatIdx: 0,
                            chord: "2^-7",
                            durationInBeats: 4,
                            key: "1"
                        },
                        {
                            beatIdx: 4,
                            chord: "5^7",
                            durationInBeats: 4,
                            key: "1"
                        }
                    ]
                }
            ]
            // barsV1: [
            //     {
            //         barIndex: 1,
            //         timeSignature: [4, 4],
            //         chordSegments: [
            //             {
            //                 beat: 0,
            //                 chord: "1^7",
            //                 beatsBeforeChange: 4,
            //                 durationInBeats: 4,
            //                 key: "1^7"
            //             }
            //         ]
            //     },
            //     {
            //         barIndex: 2,
            //         timeSignature: [4, 4],
            //         chordEnvelopes: [
            //             {
            //                 beat: '1',
            //                 chord: "4^7",
            //                 beatsBeforeChange: 4,
            //                 durationInBeats: 4,
            //                 key: "4^7"
            //             }
            //         ]
            //     },
            //     {
            //         barIndex: 3,
            //         timeSignature: [4, 4],
            //         chordEnvelopes: [
            //             {
            //                 beat: '1',
            //                 chord: "1^7",
            //                 beatsBeforeChange: 8,
            //                 durationInBeats: 4,
            //                 key: "1^7"
            //             }
            //         ]
            //     },
            //     {
            //         barIndex: 4,
            //         timeSignature: [4, 4],
            //         chordEnvelopes: [
            //             {
            //                 beat: '1',
            //                 chord: "1^7",
            //                 beatsBeforeChange: 4,
            //                 durationInBeats: 4,
            //                 key: "1^7"
            //             }
            //         ]
            //     },
            //     {
            //         barIndex: 5,
            //         timeSignature: [4, 4],
            //         chordEnvelopes: [
            //             {
            //                 beat: '1',
            //                 chord: "4^7",
            //                 beatsBeforeChange: 8,
            //                 durationInBeats: 4,
            //                 key: "4^7"
            //             }
            //         ]
            //     },
            //     {
            //         barIndex: 6,
            //         timeSignature: [4, 4],
            //         chordEnvelopes: [
            //             {
            //                 beat: '1',
            //                 chord: "4^7",
            //                 beatsBeforeChange: 4,
            //                 durationInBeats: 4,
            //                 key: "4^7"
            //             }
            //         ]
            //     }, 
            //     {
            //         barIndex: 7,
            //         timeSignature: [4, 4],
            //         chordEnvelopes: [
            //             {
            //                 beat: '1',
            //                 chord: "1^7",
            //                 beatsBeforeChange: 8,
            //                 durationInBeats: 4,
            //                 key: "1^7"
            //             }
            //         ]
            //     },
            //     {
            //         barIndex: 8,
            //         timeSignature: [4, 4],
            //         chordEnvelopes: [
            //             {
            //                 beat: '1',
            //                 chord: "1^7",
            //                 beatsBeforeChange: 4,
            //                 durationInBeats: 4,
            //                 key: "1^7"
            //             }
            //         ]
            //     },
            //     {
            //         barIndex: 9,
            //         timeSignature: [4, 4],
            //         chordEnvelopes: [
            //             {
            //                 beat: '1',
            //                 chord: "5^7",
            //                 beatsBeforeChange: 4,
            //                 durationInBeats: 4,
            //                 key: "5^7"
            //             }
            //         ]
            //     },
            //     {
            //         barIndex: 10,
            //         timeSignature: [4, 4],
            //         chordEnvelopes: [
            //             {
            //                 beat: '1',
            //                 chord: "4^7",
            //                 beatsBeforeChange: 4,
            //                 durationInBeats: 4,
            //                 key: "4^7"
            //             }
            //         ]
            //     },
            //     {
            //         barIndex: 11,
            //         timeSignature: [4, 4],
            //         chordEnvelopes: [
            //             {
            //                 beat: '1',
            //                 chord: "1^7",
            //                 beatsBeforeChange: 4,
            //                 durationInBeats: 4,
            //                 key: "1^7"
            //             }
            //         ]
            //     },
            //     {
            //         barIndex: 12,
            //         timeSignature: [4, 4],
            //         chordEnvelopes: [
            //             {
            //                 beat: '1',
            //                 chord: "2^-7",
            //                 beatsBeforeChange: 2,
            //                 durationInBeats: 2,
            //                 key: "1"
            //             },
            //             {
            //                 beat: '3',
            //                 chord: "5^7",
            //                 beatsBeforeChange: 2,
            //                 durationInBeats: 2,
            //                 key: "1"
            //             }
            //         ]
            //     }
            // ]
        });
    });
}