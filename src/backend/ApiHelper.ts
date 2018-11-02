import crypto from "crypto";
import uuidv4 from "uuid/v4";
import bcrypt from "bcryptjs";
import { IIncomingUser, ISong, ISession, ChartResponse, SignupResponse, IUser, IDataHelper } from "../shared/types";
import { MIN_PASSWORD_LENGTH, EMAIL_REGEX, USER_LIMIT, CHART_LIMIT, USER_CHART_LIMIT } from "../shared/Constants";
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

export class ApiHelper {
    private _data: IDataHelper;

    public encryptSessionToken: (sessionToken?: ISession) => string | undefined;
    public decryptSessionTokenEncryption: (encryption?: string) => ISession | undefined;    

    constructor(data: IDataHelper, secret: string) {
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

    public createUserAsync = async (newUser: IIncomingUser): Promise<SignupResponse | IUser> => {

        if (newUser.password.length < MIN_PASSWORD_LENGTH || !EMAIL_REGEX.test(newUser.email)) {
            return SignupResponse.InvalidCredentials;
        }

        let existingUser = await this._data.getUserByEmailAsync(newUser.email);

        if (existingUser) {
            return SignupResponse.EmailTaken;
        }

        let userCount = await this._data.countUsersAsync();

        if (userCount >= USER_LIMIT) {
            return SignupResponse.Error;
        }

        let user: IUser = { 
            email: newUser.email, 
            passhash: await bcrypt.hash(newUser.password, 10), 
            token: uuidv4() 
        };

        let success = await this._data.insertUserAsync(user);

        if (!success) {
            return SignupResponse.Error;
        }

        return user;
    }

    public loginUserAsync = async (returningUser: IIncomingUser): Promise<IUser | null> => {
        let existingUser = await this._data.getUserByEmailAsync(returningUser.email);   

        if (!existingUser) {
            return null;
        }    

        if (!bcrypt.compareSync(returningUser.password, existingUser.passhash)) {
            return null;
        }

        let newToken = uuidv4();

        let success = await this._data.updateUserTokenAsync(existingUser.email, newToken);

        if (!success) {
            return null;
        }

        return { ...existingUser, token: newToken} as IUser;
    }

    // CHARTS

    public getChartTitleProjectionsAsync = async (userId?: Mongo.ObjectId) => {
        let titleProjections = {};

        (await this._data.getChartsAsync(userId)).forEach(chart => {
            titleProjections[(chart._id as Mongo.ObjectId).toHexString()] = chart.title;
        });

        return titleProjections;
    }

    public createChartAsync = async (chart: ISong, userId: Mongo.ObjectId): Promise<ChartResponse> => {
        if (!Chart.validChart(chart)) {
            return ChartResponse.Invalid;
        }

        if (await this._data.getChartByTitleAsync(chart.title as string)) {
            return ChartResponse.TitleTaken;
        }

        let chartCount = await this._data.countChartsAsync();

        if (chartCount >= CHART_LIMIT) {
            return ChartResponse.ChartLimit;
        }

        chartCount = await this._data.countChartsAsync(userId);

        if (chartCount >= USER_CHART_LIMIT) {
            return ChartResponse.UserChartLimit;
        }

        chart.userId = userId;

        return (await this._data.insertChartAsync(chart)) ? ChartResponse.OK : ChartResponse.Error;
    }

    public updateChartAsync = async (chart: ISong, chartId?: Mongo.ObjectId, userId?: Mongo.ObjectId): Promise<ChartResponse> => {
        if (!Chart.validChart(chart)) {
            return ChartResponse.Invalid;
        }

        let existingChart = await this._data.getChartByTitleAsync(chart.title as string);

        if (existingChart && !(existingChart._id as Mongo.ObjectId).equals(chartId as Mongo.ObjectId)) {
            return ChartResponse.TitleTaken;
        }

        return (await this._data.updateChartAsync(chart, chartId, userId)) ? ChartResponse.OK : ChartResponse.Unauthorized;
    }
}