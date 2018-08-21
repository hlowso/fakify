let optionsBase = {
    credentials: "same-origin",
    headers: {
        'content-type': 'application/json'
    }, 
}

const sendRequest = (path, method, payload) => {
    let url = (
        // Use an environment variable that won't exist on netlify's server
        process.env.PRECOMP_LOCAL
            ? ""
            : "https://precomp.herokuapp.com"
    ) + path;

    let options = {
        method,
        ...optionsBase
    };

    if (payload) options.body = JSON.stringify(payload);

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