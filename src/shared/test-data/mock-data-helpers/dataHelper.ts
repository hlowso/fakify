import * as Mongo from "mongodb";
import { IDataHelper, IMockDataHelperOptions, IUser, ISong } from "../../types";
import { USER_LIMIT, CHART_LIMIT, USER_CHART_LIMIT } from "../../Constants";

import bars251 from "../bars-251";
import barsByeBye from "../barsByeByeBlackbird";
import bars7_4 from "../bars7_4WithCs";

export const password = "password12"
export const user0Id = new Mongo.ObjectId("507f1f77bcf86cd799439011");

export default class MockDataHelper implements IDataHelper {

    private _throwError: boolean;
    private _userCount: number;
    private _chartCount: number;
    private _userChartCount: number;
    private _user0: IUser = { 
        _id: user0Id, 
        email: "test@automation.com", 
        passhash: "$2a$10$b1h3UH5N6qHBcSfkKQwAIe0ndQVtYIp0JujrgttYLzl6OofCYL24O", 
        token: "secret_token", 
        userId: "user0" 
    };

    private _userCharts: ISong[] = [
        {
            _id: new Mongo.ObjectId("5bd2544729bf514db5231498"),
            userId: user0Id,
            title: "251",
            originalContext: "A#|Bb",
            originalTempo: [ 120, 4 ],
            barsBase: bars251
        } as ISong,
        {
            _id: new Mongo.ObjectId("5bd2544729bf514db5231499"),
            userId: user0Id,
            title: "Bye Bye Blackbird",
            originalContext: "F",
            originalTempo: [ 160, 4 ],
            barsBase: barsByeBye
        } as ISong
    ];

    private _otherCharts: ISong[] = [
        {
            _id: new Mongo.ObjectId("5bd2557129bf514db523149a"),
            userId: user0Id,
            title: "7/4",
            originalContext: "D#|Eb",
            originalTempo: [ 210, 4 ],
            barsBase: bars7_4
        } as ISong
    ];

    private _allCharts: ISong[] = [  ...this._userCharts, ...this._otherCharts ];

    constructor(options: IMockDataHelperOptions) {
        this._throwError = !!options.throwError;
        this._userCount = options.userCountLimit ? USER_LIMIT : 1;
        this._chartCount = options.chartCountLimit ? CHART_LIMIT : this._allCharts.length;
        this._userChartCount = options.userChartCountLimit ? USER_CHART_LIMIT : this._userCharts.length;
    }

    public countUsersAsync = () => {
        return this._return(this._userCount);
    }

    public getUserByTokenAsync = (token: string) => {
        return this._return(token === this._user0.token ? this._user0 : null);
    }

    public getUserByEmailAsync = (email: string) => {
        return this._return(email === this._user0.email ? this._user0 : null);
    }

    public insertUserAsync = (user: IUser) => {
        return this._return(true);
    }

    public updateUserTokenAsync = (email: string, token: string) => {
        return this._return(true);
    }

    public clearUserTokenAsync = (token: string) => {
        return this._return(true);
    }

    public countChartsAsync = (userId?: Mongo.ObjectId) => {

        let response = 0;

        if (userId) {
            if (userId === user0Id) {
                response = this._userChartCount;
            } 
        } else {
            response = this._chartCount;
        }

        return this._return(response);
    }

    public getChartsAsync = (userId?: Mongo.ObjectId) => {

        let response: ISong[];

        if (userId) {
            if (userId === this._user0._id) {
                response = this._userCharts;
            } else {
                response = [];
            }
        } else {
            response = this._allCharts;
        }

        return this._return(response);
    }

    public getChartAsync = (_id?: Mongo.ObjectId) => {
        let chart = this._allCharts.find(c => (c._id as Mongo.ObjectId).equals(_id as Mongo.ObjectId));
        return this._return(chart || null);
    }

    public getChartByTitleAsync = (title: string) => {
        let chart = this._allCharts.find(c => c.title === title);
        return this._return(chart || null);
    }

    public insertChartAsync = (chart: ISong) => {
        return this._return(!!chart);
    }

    public updateChartAsync = (chart: ISong, _id?: Mongo.ObjectId, userId?: Mongo.ObjectId) => {
        return this._return(this._allCharts.some(c => (c._id as Mongo.ObjectId).equals(_id as Mongo.ObjectID) && (c.userId as Mongo.ObjectId).equals(userId as Mongo.ObjectId)));
    }

    public deleteChartAsync = (_id?: Mongo.ObjectId, userId?: Mongo.ObjectId) => {
        return this._return(this._allCharts.some(c => (c._id as Mongo.ObjectId).equals(_id as Mongo.ObjectID) && (c.userId as Mongo.ObjectId).equals(userId as Mongo.ObjectId)) ? 1 : 0 );
    }

    /**
     * PRIVATE
     */

    private _return = <T>(data: T, errMessage?: string): Promise<T> => {
        return this._throwError ? rejectPromise<T>(errMessage || "") : wrapInResolvingPromise<T>(data);
    }
}

function wrapInResolvingPromise<T>(data: T): Promise<T> {
    return new Promise(resolve => resolve(data));
}

function rejectPromise<T>(response: string): Promise<T> {
    return new Promise((resolve, reject) => reject(response));
}