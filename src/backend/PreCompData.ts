import * as Mongo from "mongodb";
import { IUser, ISong } from "../shared/types";

export class PreCompData {
    private _mongoServer: string;
    private _user: string;
    private _password: string;
    private _dbName: string;
    private _client: any;

    private _userColl: Mongo.Collection;
    private _chartColl: Mongo.Collection;    

    constructor(server: string, user: string, password: string, dbName: string) {
        this._mongoServer = server;
        this._user = user;
        this._password = password;
        this._dbName = dbName;
    }
    
    /**
     * CONNECTION / DISCONNECTION
     */

    get connectionUrl() {
        return `mongodb://${this._user}:${this._password}@${this._mongoServer}/${this._dbName}`;
    }

    public connectAsync = () => {
        return new Promise((resolve, reject) => {
            Mongo.MongoClient.connect(this.connectionUrl, { useNewUrlParser: true }, (err, client) => {

                if (err !== null) {
                    reject(err);
                }

                this._client = client;
                let db = client.db();

                this._userColl = db.collection("Users");
                this._chartColl = db.collection("Charts");                

                resolve();
            });
        });
    }

    public close = () => {
        this._client.close();
    }

    /**
     * HELPER FUNCTIONS
     */

    // Users

    public getUserByTokenAsync = (token: string): Promise<IUser> => {
        return new Promise((resolve, reject) => {
            this._userColl.findOne({ token }, (err, user) => {
                if (err !== null) {
                    reject(err);
                }

                resolve(user as IUser);
            });
        });
    }

    public getUserByEmailAsync = (email: string): Promise<IUser> => {
        return new Promise((resolve, reject) => {
            this._userColl.findOne({ email }, (err, user) => {
                if (err !== null) {
                    reject(err);
                }

                resolve(user as IUser);
            });
        });
    }

    public insertUserAsync = (user: IUser): Promise<Mongo.InsertOneWriteOpResult> => {
        return new Promise((resolve, reject) => {
            this._userColl.insertOne(user, (err, response) => {
                if (err !== null) {
                    reject(err);
                }

                resolve(response);
            });
        });
    }

    public updateUserTokenAsync = (email: string, token: string): Promise<Mongo.UpdateWriteOpResult> => {
        return new Promise((resolve, reject) => {
            this._userColl.updateOne({ email }, { $set: { token } }, (err, response) => {
                if (err != null) {
                    reject(err);
                }

                resolve(response);
            });
        });
    }

    public clearUserTokenAsync = (token: string): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            this._userColl.updateOne({ token }, { $set: { token: null } }, (err, response) => {
                if (err != null) {
                    reject(err);
                }

                resolve(response.modifiedCount === 1);
            });
        });
    }

    // Charts

    public getChartsAsync = (userId?: Mongo.ObjectId): Promise<ISong[]> => {
        let query = userId ? { userId } : {};
        return new Promise((resolve, reject) => {
            this._chartColl.find(query).toArray((err, charts) => {
                if (err !== null) {
                    reject(err);
                }

                resolve(charts as ISong[]);
            });
        });
    }

    public getChartAsync = (_id: Mongo.ObjectId): Promise<ISong> => {
        return new Promise((resolve, reject) => {
            this._chartColl.findOne({ _id }, (err, chart) => {
                if (err !== null) {
                    reject(err);
                }

                resolve(chart);
            });
        });
    }
};