import crypto from "crypto";
import uuidv4 from "uuid/v4";
import bcrypt from "bcryptjs";
import { PreCompData } from "./PreCompData";
import { IIncomingUser, ISong, NoteName, Tempo, IChartBar, ISession, ChartServerError } from "../shared/types";
import { MAX_TITLE_LENGTH } from "../shared/Constants";
import Chart from "../shared/music/Chart";
import * as Mongo from "mongodb";

function getEncryptor(secret: string) {
    const encrypt = (message?: string) => {
        if (typeof message !== "string") {
            return;
        }
        let cipher = crypto.createCipher('aes-128-cbc', secret);
        return cipher.update(message, 'utf8', 'hex') + cipher.final('hex');
    }

    return encrypt;
}

function getDecryptor(secret: string) {
    const decrypt = (encryption?: string) => {
        if (typeof encryption !== "string" || encryption === "undefined" || encryption === "null") {
            return;
        }
        let decipher = crypto.createDecipher('aes-128-cbc', secret);
        return decipher.update(encryption, 'hex', 'utf8') + decipher.final('utf8');
    }

    return decrypt;
}

export class PreCompApiHelper {
    private _data: PreCompData;

    public encryptSessionToken: (sessionToken?: ISession) => string | undefined;
    public decryptSessionTokenEncryption: (encryption?: string) => ISession | undefined;    

    constructor(data: PreCompData, secret: string) {
        this._data = data;

        let encrypt = getEncryptor(secret);
        let decrypt = getDecryptor(secret);
        
        this.encryptSessionToken = sessionToken => {
            if (!sessionToken) {
                return;
            }

            return encrypt(JSON.stringify(sessionToken));
        };

        this.decryptSessionTokenEncryption = encryption => {
            let tokenString = decrypt(encryption);
            if (!tokenString) {
                return;
            }

            return JSON.parse(tokenString);
        }
    }

    get data() {
        return this._data;
    }

    // USERS

    public createUserAsync = async (newUser: IIncomingUser) => {

        let existingUser = await this._data.getUserByEmailAsync(newUser.email);

        if (existingUser) {
            return null;
        }

        let userCount = await this._data.countUsersAsync();

        if (userCount >= 5000) {
            return null;
        }

        let user = { 
            email: newUser.email, 
            passhash: bcrypt.hashSync(newUser.password, 10), 
            token: uuidv4() 
        };

        await this._data.insertUserAsync(user);

        return user;
    }

    public loginUserAsync = async (returningUser: IIncomingUser) => {
        let existingUser = await this._data.getUserByEmailAsync(returningUser.email);   

        if (!existingUser) {
            return null;
        }    

        if (!bcrypt.compareSync(returningUser.password, existingUser.passhash)) {
            return null;
        }

        let newToken = uuidv4();

        await this._data.updateUserTokenAsync(existingUser.email, newToken);

        return { ...existingUser, token: newToken};
    }

    // CHARTS

    public getChartTitleProjectionsAsync = async (userId?: Mongo.ObjectId) => {
        let titleProjections = {};

        (await this._data.getChartsAsync(userId)).forEach(chart => {
            titleProjections[(chart._id as Mongo.ObjectId).toHexString()] = chart.title;
        });

        return titleProjections;
    }

    public createChartAsync = async (chart: ISong, userId: Mongo.ObjectId): Promise<ChartServerError | boolean> => {
        if (!this._validSong(chart)) {
            return ChartServerError.Invalid;
        }

        if (await this.chartTitleExistsAsync(chart.title as string)) {
            return ChartServerError.TitleTaken;
        }

        let chartCount = await this._data.countChartsAsync();

        if (chartCount >= 5000) {
            return ChartServerError.ChartCount;
        }

        chartCount = await this._data.countChartsAsync(userId);

        if (chartCount >= 100) {
            return ChartServerError.UserChartCount;
        }

        chart.userId = userId;

        return await this._data.insertChartAsync(chart);
    }

    public updateChartAsync = async (chartId: Mongo.ObjectId, chart: ISong): Promise<ChartServerError | boolean> => {
        if (!this._validSong(chart)) {
            return ChartServerError.Invalid;
        }

        if (await this.chartTitleExistsAsync(chart.title as string)) {
            return ChartServerError.TitleTaken;
        }

        return await this._data.updateChartAsync(chartId, chart);
    }

    public chartTitleExistsAsync = async (title: string): Promise<boolean> => {
        let existingChart = await this._data.getChartByTitleAsync(title);

        if (existingChart) {
            return true;
        }

        return false;
    }

    // TODO: validSong() should live elsewhere...
    private _validSong = (chart: ISong) => {
        if (typeof chart !== "object") {
            return false;
        }

        for (let prop in chart) {
            if ([ "title", "originalContext", "originalTempo", "barsBase" ].indexOf(prop) === -1) {
                return false;
            }
        }

        let { title, originalContext, originalTempo, barsBase } = chart;

        if (typeof title !== "string" || title.length > MAX_TITLE_LENGTH) {
            return false;
        }

        if (!Chart.validNoteName(originalContext as NoteName)) {
            return false;
        }

        if (!Chart.validTempo(originalTempo as Tempo)) {
            return false;
        }

        if (!Chart.validBaseBars(barsBase as IChartBar[])) {
            return false;
        }

        return true;
    }
}