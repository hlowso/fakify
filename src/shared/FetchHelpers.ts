import { StorageHelper } from "./StorageHelper";
import { Method } from "./types";

const sendRequestAsync = async (path: string, method: Method, payload: any, ignoreUnauthorized = false) => {
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