import * as FetchHelpers from "./FetchHelpers";

export const authenticate = () => {
    return FetchHelpers.GET('/api/admin/authenticate')
        .then(res => {
            if (res.status === 200) {
                return res.json();
            }
            return null;
        });
};

export const login = returningUser => {
    return FetchHelpers.PATCH('/api/admin/login', returningUser);
};

export const logout = () => {
    return FetchHelpers.PATCH('/api/admin/logout');
};

export const signup = newUser => {
    return FetchHelpers.POST('/api/admin/signup', newUser)
        .then(res => {
            if (res.status === 200) {
                return res.json();
            }
            return null;
        });
};

export const SaveSongResults = {
    Ok: "ok",
    TitleExists: "titleExists",
    InvalidSong: "invalidSong"
};

export async function saveSongAsync(newSong) {
    try {
        let { ok } = await FetchHelpers.POST('/api/songs', newSong);
        return (
            ok
                ? SaveSongResults.Ok
                : SaveSongResults.TitleExists
        );
    } catch(error) {
        return SaveSongResults.InvalidSong;
    }
}

export async function getUserSongTitles() {
    let res = await FetchHelpers.GET('/api/songs/user_titles');
    return res.json();
};

export async function getSongTitlesAsync() {
    let res = await FetchHelpers.GET('/api/songs/titles');
    return res.json();
};

export async function getSongAsync(chartId) {
    let res = await FetchHelpers.GET(`/api/songs/${chartId}`);
    let json = res.json();

    return (
        res.ok 
            ? json  
            : null
    );
};