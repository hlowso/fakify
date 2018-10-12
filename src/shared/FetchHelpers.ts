import { Method } from "./types";

const sendRequest = (path: string, method: Method, payload: any) => {
    let options: RequestInit = {
        method,
        credentials: "same-origin", 
        headers: {
            'content-type': 'application/json'
        }, 
        body: method !== "GET" ? JSON.stringify(payload) : undefined
    };

    return fetch(path, options);
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