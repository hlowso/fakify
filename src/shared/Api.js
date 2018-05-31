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
            timeSignature: [4, 4],
            originalKeySignature: "C",
            originalTempo: 120,
            chart: {
                bars: {
                    1: { 1: "1^7" },
                    2: { 1: "4^7" },
                    3: { 1: "1^7" },
                    4: { 1: "1^7" },
                    5: { 1: "4^7" },
                    6: { 1: "4^7" },
                    7: { 1: "1^7" },
                    8: { 1: "1^7" },
                    9: { 1: "5^7" },
                    10: { 1: "4^7" },
                    11: { 1: "1^7" },
                    12: { 1: "2^-7", 3: "5^7" },
                },
                keyRanges: [
                    {
                        from: "1",
                        to: "2",
                        key: "1^7"
                    }, {
                        from: "2",
                        to: "3",
                        key: "4^7"
                    }, {
                        from: "3",
                        to: "5",
                        key: "1^7"
                    }, {
                        from: "5",
                        to: "7",
                        key: "4^7"
                    }, {
                        from: "7",
                        to: "9",
                        key: "1^7"
                    }, {
                        from: "9",
                        to: "10",
                        key: "5^7"
                    }, {
                        from: "10",
                        to: "11",
                        key: "4^7"
                    }, {
                        from: "12",
                        to: "1",
                        key: "1^ma7"
                    }
                ],
                segments: [
                    {
                        chartIndex: "1.1",
                        chord: "1^7"
                    }, {
                        chartIndex: "2.1",
                        chord: "4^7"
                    }, {
                        chartIndex: "3.1",
                        chord: "1^7"
                    }, {
                        charIndex: "4.1",
                        chord: "1^7"
                    }, {
                        charIndex: "5.1",
                        chord: "4^7"
                    }, {
                        charIndex: "6.1",
                        chord: "4^7"
                    }, {
                        charIndex: "7.1",
                        chord: "1^7"
                    }, {
                        charIndex: "8.1",
                        chord: "1^7"
                    }, {
                        charIndex: "9.1",
                        chord: "5^7"
                    }, {
                        charIndex: "10.1",
                        chord: "4^7"
                    }, {
                        charIndex: "11.1",
                        chord: "1^7"
                    }, {
                        charIndex: "12.1",
                        chord: "2^-7"
                    }, {
                        charIndex: "12.3",
                        chord: "5^7"
                    }
                ]
            }
        });
    });
}