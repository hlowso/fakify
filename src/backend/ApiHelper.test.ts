import * as Mongo from "mongodb";
import * as Util from "../shared/Util";
import { ApiHelper } from "./ApiHelper";
import MockDataHelper, { user0Id } from "../shared/test-data/mock-data-helpers/dataHelper";
import barsInvalid from "../shared/test-data/barsInvalid";
import barsByeBye from "../shared/test-data/barsByeByeBlackbird";
import barsNew from "../shared/test-data/bars-251-multichord";
import { IIncomingUser, SignupResponse, IUser, ISong, IChartBar, ChartResponse } from "../shared/types";

const data = new MockDataHelper({ 
    throwError: false,
    userCountLimit: false,
    chartCountLimit: false,
    userChartCountLimit: false
});

const dataFull = new MockDataHelper({ 
    throwError: false,
    userCountLimit: true,
    chartCountLimit: true,
    userChartCountLimit: true
});

const dataChartsFull = new MockDataHelper({
    throwError: false,
    userCountLimit: false,
    chartCountLimit: true,
    userChartCountLimit: false
});

const dataUserChartsFull = new MockDataHelper({
    throwError: false,
    userCountLimit: false,
    chartCountLimit: false,
    userChartCountLimit: true
});

const invalidSong: ISong = {
    title: "Invalerie",
    originalContext: "D#|Eb",
    originalTempo: [ 120, 4 ],
    barsBase: barsInvalid as IChartBar[]
};

const copiedSong: ISong = {
    title: "Bye Bye Blackbird",
    originalContext: "F",
    originalTempo: [ 120, 4 ],
    barsBase: barsByeBye as IChartBar[]
};

const newSong: ISong = {
    title: "New Song 303482932",
    originalContext: "C",
    originalTempo: [ 120, 4 ],
    barsBase: barsNew as IChartBar[]
};

const secret = "my little secret";

const id251 = new Mongo.ObjectId("5bd2544729bf514db5231498");

test("can be instantiated", () => {
    expect(() => {
        new ApiHelper(data, secret);
    }).not.toThrow();
});

/**
 * createUserAsync
 */

test("createUserAsync returns InvalidCredentials if password is too short", async () => {
    let user: IIncomingUser = { email: "test@gmail.com", password: "foofoo" };
    let api = new ApiHelper(data, secret);
    expect(await api.createUserAsync(user)).toBe(SignupResponse.InvalidCredentials);
});

test("createUserAsync returns InvalidCredentials if email is not a proper email", async () => {
    let user: IIncomingUser = { email: "thisIsNotAnEmailAddress", password: "foofoolalala" };
    let api = new ApiHelper(data, secret);
    expect(await api.createUserAsync(user)).toBe(SignupResponse.InvalidCredentials);
});

test("createUserAsync returns EmailTaken if user with email already exists", async () => {
    let user: IIncomingUser = { email: "test@automation.com", password: "password12" };
    let api = new ApiHelper(data, secret);
    expect(await api.createUserAsync(user)).toBe(SignupResponse.EmailTaken);
});

test("createUserAsync returns Error if database is at user limit", async () => {
    let user: IIncomingUser = { email: "rando28493@gmail.com", password: "password12" };
    let api = new ApiHelper(dataFull, secret);
    expect(await api.createUserAsync(user)).toBe(SignupResponse.Error);
});

test("createUserAsync returns back user with token if successful", async () => {
    let user: IIncomingUser = { email: "rando28493@gmail.com", password: "password12" };
    let api = new ApiHelper(data, secret);
    let insertedUser = await api.createUserAsync(user) as IUser;
    expect(typeof insertedUser.token === "string" && insertedUser.token.length > 0).toBeTruthy();
});

/**
 * loginUserAsync
 */

test("loginUserAsync returns null if user email can't be found", async () => {
    let user: IIncomingUser = { email: "rando28493@gmail.com", password: "password12" };
    let api = new ApiHelper(data, secret);
    expect(await api.loginUserAsync(user)).toBeNull();
});

test("loginUserAsync returns null if user password is incorrect", async () => {
    let user: IIncomingUser = { email: "test@automation.com", password: "password10" };
    let api = new ApiHelper(data, secret);
    expect(await api.loginUserAsync(user)).toBeNull();
});

test("loginUserAsync returns back user with new token if successful", async () => {
    let user: IIncomingUser = { email: "test@automation.com", password: "password12" };
    let api = new ApiHelper(data, secret);
    let loggedInUser = await api.loginUserAsync(user) as IUser;
    expect(typeof loggedInUser.token === "string" && loggedInUser.token.length > 0).toBeTruthy();
});

/**
 * getChartTitleProjectionsAsync
 */

test("getChartTitleProjectionsAsync returns all titles when no userId is given", async () => {
    let chartCount = await data.countChartsAsync();
    let api = new ApiHelper(data, secret);
    let titles = await api.getChartTitleProjectionsAsync();

    let count = 0;
    for (let id in titles) {
        count ++;
        expect(typeof titles[id] === "string" && titles[id].length).toBeTruthy();
    }

    expect(count).toBe(chartCount);
});

test("getChartTitleProjectionsAsync returns empty object when an invalid userId is given", async () => {
    let api = new ApiHelper(data, secret);
    let titles = await api.getChartTitleProjectionsAsync(new Mongo.ObjectId("5bd2758849c9d24febab96e3"));

    expect(Util.objectIsEmpty(titles)).toBeTruthy();
});

test("getChartTitleProjectionsAsync returns all user titles valid userId is given", async () => {
    let chartCount = await data.countChartsAsync(user0Id);
    let api = new ApiHelper(data, secret);
    let titles = await api.getChartTitleProjectionsAsync(user0Id);

    let count = 0;
    for (let id in titles) {
        count ++;
        expect(typeof titles[id] === "string" && titles[id].length).toBeTruthy();
    }

    expect(count).toBe(chartCount);
});

/**
 * createChartAsync
 */

test("createChartAsync returns Invalid if chart is invalid ISong", async () => {
    let api = new ApiHelper(data, secret);
    expect(await api.createChartAsync(invalidSong, user0Id)).toBe(ChartResponse.Invalid);
});

test("createChartAsync returns TitleTaken if chart with same title already exists", async () => {
    let api = new ApiHelper(data, secret);
    expect(await api.createChartAsync(copiedSong, user0Id)).toBe(ChartResponse.TitleTaken);
});

test("createChartAsync returns ChartLimit if data is at chart limit", async () => {
    let api = new ApiHelper(dataChartsFull, secret);
    expect(await api.createChartAsync(newSong, user0Id)).toBe(ChartResponse.ChartLimit);
});

test("createChartAsync returns UserChartLimit if data is at chart limit", async () => {
    let api = new ApiHelper(dataUserChartsFull, secret);
    expect(await api.createChartAsync(newSong, user0Id)).toBe(ChartResponse.UserChartLimit);
});

test("createChartAsync returns OK and puts userId on chart if successful", async () => {
    let api = new ApiHelper(data, secret);
    let res = await api.createChartAsync(newSong, user0Id);

    expect(newSong.userId).toBe(user0Id);
    expect(res).toBe(ChartResponse.OK);
});

/**
 * updateChartAsync
 */

test("updateChartAsync returns Invalid if chart is invalid ISong", async () => {
    let api = new ApiHelper(data, secret);
    expect(await api.updateChartAsync(invalidSong, id251, user0Id)).toBe(ChartResponse.Invalid);
});

test("updateChartAsync returns TitleTaken if chart title is taken", async () => {
    let api = new ApiHelper(data, secret);
    let songClone = Util.copyObject(copiedSong);
    songClone.title = "251";
    expect(await api.updateChartAsync(songClone, new Mongo.ObjectId("5bd2544729bf514db5231499"), user0Id)).toBe(ChartResponse.TitleTaken);
});

test("updateChartAsync returns Unauthorized if userId doesn't match that of the chart", async () => {
    let api = new ApiHelper(data, secret);
    let songClone = Util.copyObject(copiedSong);
    expect(await api.updateChartAsync(songClone, new Mongo.ObjectId("5bd2544729bf514db5231499"), new Mongo.ObjectId("5bd2adda8c917752eb5b6fd5"))).toBe(ChartResponse.Unauthorized);
});

test("updateChartAsync returns OK if successful", async () => {
    let api = new ApiHelper(data, secret);
    let songClone = Util.copyObject(copiedSong);
    songClone.barsBase = barsNew as IChartBar[];
    expect(await api.updateChartAsync(songClone, new Mongo.ObjectId("5bd2544729bf514db5231499"), user0Id)).toBe(ChartResponse.OK);
});