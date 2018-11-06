import { StorageHelper } from "./StorageHelper";
import { Method } from "./types";

const sendRequestAsync = async (path: string, method: Method, payload: any, ignoreUnauthorized = false) => {
    let url = "";
    let credentials: "same-origin" | "omit" | "include" | undefined;
    let mode: "navigate" | "same-origin" | "no-cors" | "cors" | undefined;

    switch (process.env.REACT_APP_DEPLOY_BUILD) {
        default:
        case "LOCAL":
        case "PROD":
            url = "";
            credentials = "same-origin";
            break;
            
        case "DEV":
            url = "https://fakify.herokuapp.com";
            credentials = "include";
            mode = "cors";
            break;
    }

    url += path;

    let options: RequestInit = {
        method,
        credentials,
        mode,    
        headers: {
            'content-type': 'application/json',
            'X-Session-Token': StorageHelper.getSessionToken()
        }, 
        body: method !== "GET" && payload ? JSON.stringify(payload) : undefined
    };

    let res = await fetch(url, options);

    if (res.status === 401 && !ignoreUnauthorized) {
        window.location.reload();
    }

    return res;
}

export const GET = (path: string, payload?: any, ignoreUnauthorized = false) => {
    return sendRequestAsync(path, "GET", payload, ignoreUnauthorized);
}

export const PATCH = (path: string, payload?: any, ignoreUnauthorized = false) => {
    return sendRequestAsync(path, "PATCH", payload, ignoreUnauthorized);
}

export const POST = (path: string, payload?: any, ignoreUnauthorized = false) => {
    return sendRequestAsync(path, "POST", payload, ignoreUnauthorized);
}

export const PUT = (path: string, payload?: any, ignoreUnauthorized = false) => {
    return sendRequestAsync(path, "PUT", payload, ignoreUnauthorized);
}

export const DELETE = (path: string, payload?: any, ignoreUnauthorized = false) => {
    return sendRequestAsync(path, "DELETE", payload, ignoreUnauthorized);
}