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

export const redirect = route => {
    window.location.replace(`http://localhost:3000/${route}`);
};

export const objectIsEmpty = object => {
    return Object.keys(object).length === 0;
};

export const waitFor = (checker, rate) => {
    return new Promise((resolve, reject) => {
        (function check() {
            setTimeout(() => {
                if (checker()) resolve();
                else check();
            }, rate);
        })();
    });
};

export const copyObject = object => JSON.parse(JSON.stringify(object));