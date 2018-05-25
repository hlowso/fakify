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
            originalKey: "C",
            originalTempo: 120,
            key: "C",
            tempo: 120,
            chart: {
                progression: {
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
                keys: { 
                    1: "1^7", 
                    2: "4^7", 
                    3: "1^7", 
                    5: "4^7", 
                    7: "1^7", 
                    9: "5^7", 
                    10: "4^7", 
                    11: "1^7", 
                    12: "1^ma7"
                },
                sections: {
    
                }
            }
        });
    });
}