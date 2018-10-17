import { Tabs, ISubbeatTimeMap, IMusicIdx } from "./types";

// export const redirect = (route: string) => {
//     window.location.replace(`${window.location.origin}/${route}`);
// };

export const getCurrentTab = () => {
    let windowPathname = window.location.pathname;
    for (let tab in Tabs) {
        let currTab = Tabs[tab];
        if (new RegExp(currTab).test(windowPathname)) {
            return currTab as Tabs;
        }
    }
    return Tabs.None;
}

export const objectIsEmpty = (object: any) => {
    if (!object) {
        return true;
    }
    return Object.keys(object).length === 0;
};

export function shallowEqual(A: any, B: any) {
    return JSON.stringify(A) === JSON.stringify(B);
};

export const waitFor = (getUpdate: () => boolean, rate: number) => {
    return new Promise((resolve, reject) => {
        (function check() {
            setTimeout(() => {
                if (getUpdate()) resolve();
                else check();
            }, rate);
        })();
    });
};

export const copyObject = <T>(object: T) => JSON.parse(JSON.stringify(object)) as T;

export const length = (obj: any) => {
    return Array.isArray(obj) ? obj.length : Object.keys(obj).length;
}

export const binarySearch = <T>(obj: T[] | { [key: number]: T }, element: T, difference = (a: any, b: any) => a - b, startIdx = 0, endIdx = length(obj) - 1): [number, T] => {
    let middleIdx = startIdx + Math.floor((endIdx - startIdx) / 2);
    let currentElement = obj[middleIdx];

    if (element === currentElement) {
        return [Number(middleIdx), currentElement];
    }
    if (startIdx === middleIdx) {
        let greaterElement = obj[endIdx];
        return Math.abs(difference(element, currentElement)) > Math.abs(difference(element, greaterElement)) ? [Number(endIdx), greaterElement] : [Number(middleIdx), currentElement];
    }

    if (difference(element, currentElement) < 0) {
        return binarySearch(obj, element, difference, startIdx, middleIdx);
    }
    return binarySearch(obj, element, difference, middleIdx, endIdx);
}

export const getClosestQueueTime = (queueTimes: ISubbeatTimeMap, time: number): [IMusicIdx, number] => {
    let barIndices = Object.keys(queueTimes).map((idx: string) => Number(idx));
    let minIdx = Math.min(...barIndices);
    let maxIdx = Math.max(...barIndices);

    let comparison = (a: { [subbeatIdx: number]: number }, b: { [subbeatIdx: number]: number }) => {
        let aCenter = Math.floor(length(a) / 2);
        let bCenter = Math.floor(length(b) / 2);
        return a[aCenter] - b[bCenter];
    };

    let [barIdx, queueTimeBar] = binarySearch(
        queueTimes, 
        { 0: time }, 
        comparison, 
        minIdx, 
        maxIdx
    );

    let [subbeatIdx, closestTime] = binarySearch(
        queueTimeBar,
        time
    );

    return [{ barIdx, subbeatIdx }, closestTime];
}

export const mod = (m: number, n: number): number => {
    let r = m % n;
    return r >= 0 ? r : n + r;
} 

export const identity = <T>(obj: T) => obj;

// Given an array of "choices", in which each "choice" is a pairing of an element
// and a probability, this function returns a random variable returning the element
// choices[i][0] with probablity choices[i][1] / the sum of (choices[x][1]) 
// from x = 0 to length of choices
export const generateCustomRandomVariable = <T>(choices: [T, number][]) => {
    let totalWeight = choices.reduce((total, choice) => total + choice[1], 0);
    let variable = () => {
        let k = Math.floor(Math.random() * totalWeight);
        for (let choice of choices) {
            k -= choice[1];
            if (k < 0) {
                return choice[0];
            }
        }
        return;
    }; 
    return variable as () => T;
};

export const mean = (arr: number[]) => {
    if (!Array.isArray(arr) || arr.length === 0 || arr.some(a => typeof a !== "number")) {
        return NaN;
    }
    return arr.reduce((acc, curr) => acc + curr, 0) / arr.length;
}

export const vectorSum = (arr1: number[], arr2: number[]) => {
    if (
        !Array.isArray(arr1) || 
        !Array.isArray(arr2) || 
        arr1.length === 0 || 
        arr2.length === 0 || 
        arr1.length !== arr2.length ||
        arr1.some(a => typeof a !== "number") || 
        arr2.some(b => typeof b !== "number")
    ) {
        return NaN;
    }

    return arr1.map((a, i) => a + arr2[i]);
}