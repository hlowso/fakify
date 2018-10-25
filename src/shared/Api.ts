import * as FetchHelpers from "./FetchHelpers";
import { StorageHelper } from "./StorageHelper";
import { IIncomingUser, ISong, IUser, ChartResponse, LoginResponse, SignupResponse, ITitles } from "./types";

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

    return getResponseJson<LoginResponse>(res) || LoginResponse.Error;
};

export async function logoutAsync() {
    let res = await FetchHelpers.PATCH('/api/admin/logout', null, true);
    return getResponseJson<boolean>(res) || false;
};

export async function signupAsync(newUser: IIncomingUser): Promise<SignupResponse> {
    let res = await FetchHelpers.POST('/api/admin/signup', newUser, true);

    if (res.status === 200) {
        let sessionToken = res.headers.get("X-Session-Token");
        StorageHelper.setSessionToken(sessionToken);
    }
                
    return getResponseJson<SignupResponse>(res) || SignupResponse.Error;
};

export async function saveSongAsync(newSong: ISong): Promise<ChartResponse> {
    let res = await FetchHelpers.POST('/api/songs', newSong);
    return getResponseJson<ChartResponse>(res) || ChartResponse.Error;
}

export async function updateSongAsync(chartId: string, newSong: ISong): Promise<ChartResponse> {
    let res = await FetchHelpers.PUT(`/api/songs/${chartId}`, newSong);
    return getResponseJson<ChartResponse>(res) || ChartResponse.Error;
}

export async function getUserSongTitles(): Promise<ITitles> {
    let res = await FetchHelpers.GET('/api/songs/user/titles');
    return getResponseJson<ITitles>(res) || {};
};

export async function getSongTitlesAsync(): Promise<ITitles> {
    let res = await FetchHelpers.GET('/api/songs/titles');
    return getResponseJson<ITitles>(res) || {};
};

export async function getSongByTitleAsync(title: string): Promise<ISong | null> {
    let res = await FetchHelpers.GET(`/api/songs/by-title/${title}`);
    return getResponseJson<ISong | null>(res) || null;
}

export async function getSongAsync(chartId: string): Promise<ISong | null> {
    let res = await FetchHelpers.GET(`/api/songs/${chartId}`);
    return getResponseJson<ISong | null>(res) || null;    
};

export async function deleteSongAsync(chartId: string): Promise<number> {
    let res = await FetchHelpers.DELETE(`/api/songs/${chartId}`);
    return getResponseJson<number>(res) || 0;    
}

/**
 * HELPERS
 */

async function getResponseJson<T>(res: Response) {
    let json: any;

    try {
        json = await res.json() as T;
    } catch (err) {
        json = null;
    }

    return json;
}