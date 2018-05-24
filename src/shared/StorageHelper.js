export const getLocalStorage = () => {
    return window.localStorage;
}

export const setLocalVariable = (key, value) => {
    window.localStorage[key] = value;
}