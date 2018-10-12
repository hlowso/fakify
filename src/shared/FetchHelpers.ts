import { StorageHelper } from "./StorageHelper";
import { Method } from "./types";

const sendRequest = (path: string, method: Method, payload: any) => {
    let url = (
        process.env.REACT_APP_DEPLOY_BUILD
            ? "https://fakify.herokuapp.com"
            : ""
    ) + path;

    let options: RequestInit = {
        method,
        credentials: process.env.REACT_APP_DEPLOY_BUILD ? "include" : "same-origin",
        mode: process.env.REACT_APP_DEPLOY_BUILD ? "cors" : undefined,    
        headers: {
            'content-type': 'application/json',
            'X-Session-Token': StorageHelper.getSessionToken()
        }, 
        body: method !== "GET" && payload ? JSON.stringify(payload) : undefined
    };

    return fetch(url, options);
}

export const GET = (path: string, payload = null) => {
    return sendRequest(path, "GET", payload);
}

export const PATCH = (path: string, payload = null) => {
    return sendRequest(path, "PATCH", payload);
}

export const POST = (path: string, payload = null) => {
    return sendRequest(path, "POST", payload);
}

export const PUT = (path: string, payload = null) => {
    return sendRequest(path, "PUT", payload);
}