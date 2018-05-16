let optionsBase = {
    credentials: "same-origin",
    headers: {
        'content-type': 'application/json'
    }, 
}

const fetchWrapper = (url, options) => {
    return fetch(url, options)
        .catch(error => {
            console.log("PRECOMP - FETCH GET ERROR:", error);
        });
}

const sendRequest = (url, method, payload) => {
    let options = {
        method,
        ...optionsBase
    };

    if (payload) options.body = JSON.stringify(payload);

    return fetchWrapper(url, options);
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