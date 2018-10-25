import * as FetchHelpers from "./FetchHelpers";
import { StorageHelper } from "./StorageHelper";
import { IIncomingUser, ISong, IUser, ChartServerError, LoginResponse, SignupResponse } from "./types";

export async function authenticateAsync(): Promise<IUser | null> {
    let res = await FetchHelpers.GET('/api/admin/authenticate', null, true);
    if (res.status === 200) {
        return res.json();
    }
    return null;
};

export async function loginAsync(returningUser: IIncomingUser): Promise<LoginResponse> {
    let res = await FetchHelpers.PATCH('/api/admin/login', returningUser, true);

    if (res.status === 200) {
        let sessionToken = res.headers.get("X-Session-Token");
        StorageHelper.setSessionToken(sessionToken);
    }

    return await res.json() as LoginResponse;
};

export async function logoutAsync() {
    let res = await FetchHelpers.PATCH('/api/admin/logout', null, true);
    return res.json();
};

export async function signupAsync(newUser: IIncomingUser): Promise<SignupResponse> {
    let res = await FetchHelpers.POST('/api/admin/signup', newUser, true);

    if (res.status === 200) {
        let sessionToken = res.headers.get("X-Session-Token");
        StorageHelper.setSessionToken(sessionToken);
    }
                
    return await res.json() as SignupResponse;
};

export async function saveSongAsync(newSong: ISong): Promise<ChartServerError | boolean> {
    let res = await FetchHelpers.POST('/api/songs', newSong);
    return await res.json() as ChartServerError | boolean;
}

export async function updateSongAsync(chartId: string, newSong: ISong): Promise<ChartServerError | boolean> {
    let res = await FetchHelpers.PUT(`/api/songs/${chartId}`, newSong);
    return await res.json() as ChartServerError | boolean;
}

export async function getUserSongTitles(): Promise<{ [chartId: string]: string }> {
    let res = await FetchHelpers.GET('/api/songs/user/titles');
    return res.json();
};

export async function getSongTitlesAsync(): Promise<{ [chartId: string]: string }> {
    let res = await FetchHelpers.GET('/api/songs/titles');
    return await res.json();
};

export async function getSongByTitleAsync(title: string): Promise<ISong | null> {
    let res = await FetchHelpers.GET(`/api/songs/by-title/${title}`);
    return await res.json();
}

export async function getSongAsync(chartId: string): Promise<ISong | null> {
    let res = await FetchHelpers.GET(`/api/songs/${chartId}`);
    let json = res.json();

    return (
        res.ok 
            ? json
            : null
    );
};

export async function deleteSongAsync(chartId: string): Promise<boolean> {
    let res = await FetchHelpers.DELETE(`/api/songs/${chartId}`);
    return await res.json();
}