export const redirect = route => {
    window.location.replace(`http://localhost:3000/${route}`);
};

export const objectIsEmpty = object => {
    return Object.keys(object).length === 0;
};

export const waitFor = (getUpdate, rate) => {
    return new Promise((resolve, reject) => {
        (function check() {
            setTimeout(() => {
                if (getUpdate()) resolve();
                else check();
            }, rate);
        })();
    });
};

export const copyObject = object => JSON.parse(JSON.stringify(object));

export const arrayBinarySearch = (array, element, difference = (a, b) => a - b, startIdx = 0, endIdx = array.length - 1) => {
    let middleIdx = startIdx + Math.floor((endIdx - startIdx) / 2);
    let currentElement = array[middleIdx];
    if (element === currentElement) {
        return [middleIdx, currentElement];
    }
    if (startIdx === middleIdx) {
        let greaterElement = array[endIdx];
        return Math.abs(difference(element, currentElement)) > Math.abs(difference(element, greaterElement)) ? [endIdx, greaterElement] : [middleIdx, currentElement];
    }
    
    if (difference(element, currentElement) < 0) {
        return arrayBinarySearch(array, element, difference, startIdx, middleIdx);
    }
    return arrayBinarySearch(array, element, difference, middleIdx, endIdx);
}

export const mod = (m, n) => {
    let r = m % n;
    return r >= 0 ? r : n + r;
} 

export class CookieManager {
    constructor() {
        this._cookies = {}; 
        this._cookieString = "";

        this._cookies = this.constructor.parse(document.cookie);
    }

    get = key => {
        return this._cookies[key];
    }

    set = (key, value) => {
        this._cookies[key] = value;
        this.stringify();
        this.save();
    }

    stringify = () => {
        this.cookieString = "";

        for(let key in this._cookies) {
            this._cookieString += `${key}=${this._cookies[key]};`
        }

        this._cookies = this._cookies.substring(0, this._cookieString.length - 1);
    }

    save = () => {
        document.cookie = this._cookieString;
    }

    static parse = str => {
        let obj = {};
        let pairStringArray = str.split(';');

        for (let pairString of pairStringArray) {

            let splitIndex = pairString.indexOf('=');
            let key = pairString.substring(0, splitIndex);
            let value = pairString.substring(splitIndex + 1);

            obj[key] = value;
        }

        return obj;
    }
};