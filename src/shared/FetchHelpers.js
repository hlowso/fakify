
const sendRequest = (path, method, payload) => {
    let url = (
        process.env.REACT_APP_DEPLOY_BUILD
            ? "https://fakify.herokuapp.com"
            : ""
    ) + path;

    let options = {
        method,
        credentials: process.env.REACT_APP_DEPLOY_BUILD ? "include" : "same-origin",
        mode: process.env.REACT_APP_DEPLOY_BUILD ? "cors" : undefined,    
        headers: {
            'content-type': 'application/json',
            'X-Session-Token': "lalala test"
        }, 
        body: method !== "GET" ? JSON.stringify(payload) : undefined
    };

    return fetch(url, options);
}

export const GET = (path, payload = null) => {
    return sendRequest(path, "GET", payload);
}

export const PATCH = (path, payload = null) => {
    return sendRequest(path, "PATCH", payload);
}

export const POST = (path, payload = null) => {
    return sendRequest(path, "POST", payload);
}

export const PUT = (path, payload = null) => {
    return sendRequest(path, "PUT", payload);
}