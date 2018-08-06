let optionsBase = {
    credentials: "same-origin",
    headers: {
        'content-type': 'application/json'
    }, 
}

const sendRequest = (url, method, payload) => {
    let options = {
        method,
        ...optionsBase
    };

    if (payload) options.body = JSON.stringify(payload);

    return fetch(url, options);
}

export const GET = (url, payload = null) => {
    return sendRequest(url, "GET", payload);
}

export const PATCH = (url, payload = null) => {
    return sendRequest(url, "PATCH", payload);
}

export const POST = (url, payload = null) => {
    return sendRequest(url, "POST", payload);
}