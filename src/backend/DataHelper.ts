import * as Mongo from "mongodb";
import { IUser, ISong, IDataHelper } from "../shared/types";

export class DataHelper implements IDataHelper {
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
        let auth = (this._user && this._password) ? `${this._user}:${this._password}@` : "";
        return `mongodb://${auth}${this._mongoServer}/${this._dbName}`;
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

    public countUsersAsync = (): Promise<number> => {
        return this._userColl.countDocuments();
    }

    public getUsersAsync = (): Promise<IUser[]> => {
        return new Promise((resolve, reject) => {
            this._userColl.find({}).toArray((err, users) => {
                if (err !== null) {
                    reject(err);
                }

                resolve(users as IUser[]);
            });
        });
    }

    public getUserByTokenAsync = (token: string): Promise<IUser> => {
        return new Promise((resolve, reject) => {
            if (!token || typeof token !== "string") {
                resolve();
            } else {
                this._userColl.findOne({ token }, (err, user) => {
                    if (err !== null) {
                        reject(err);
                    }
    
                    resolve(user as IUser);
                });
            }
        });
    }

    public getUserByEmailAsync = (email: string): Promise<IUser> => {
        return new Promise((resolve, reject) => {
            if (!email || typeof email !== "string") {
                resolve();
            } else {
                this._userColl.findOne({ email }, (err, user) => {
                    if (err !== null) {
                        reject(err);
                    }
    
                    resolve(user as IUser);
                });
            }
        });
    }

    public insertUserAsync = (user: IUser): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            this._userColl.insertOne(user, (err, response) => {
                if (err !== null) {
                    reject(err);
                }

                resolve(response.insertedCount === 1);
            });
        });
    }

    public updateUserTokenAsync = (email: string, token: string): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            this._userColl.updateOne({ email }, { $set: { token } }, (err, response) => {
                if (err != null) {
                    reject(err);
                }

                resolve(response.matchedCount === 1);
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

    public countChartsAsync = (userId?: Mongo.ObjectId): Promise<number> => {
        return this._chartColl.countDocuments( userId ? { userId } : undefined );
    }

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

    public getChartAsync = (_id?: Mongo.ObjectId): Promise<ISong | null> => {
        return new Promise((resolve, reject) => {

            if (!_id) {
                resolve(null);
            }

            this._chartColl.findOne({ _id }, (err, chart) => {
                if (err !== null) {
                    reject(err);
                }

                resolve(chart);
            });
        });
    }

    public getChartByTitleAsync = (title: string): Promise<ISong | null> => {
        return new Promise((resolve, reject) => {

            if (!title || typeof title !== "string") {
                resolve(null);
            }

            this._chartColl.findOne({ title }, (err, chart) => {
                if (err !== null) {
                    reject(err);
                }

                resolve(chart);
            })
        });
    }

    public insertChartAsync = (chart: ISong): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            this._chartColl.insertOne(chart, (err, response) => {
                if (err !== null) {
                    reject(err);
                }

                resolve(response.insertedCount === 1);
            });
        });
    }

    public updateChartAsync = (chart: ISong, _id?: Mongo.ObjectId, userId?: Mongo.ObjectId): Promise<boolean> => {
        let { title, originalContext, originalTempo, barsBase } = chart;
        let updateSet = { $set: { title, originalContext, originalTempo, barsBase } };

        return new Promise((resolve, reject) => {
            if (!_id || !userId) {
                resolve(false);
            }

            this._chartColl.updateOne({ _id, userId }, updateSet, (err, response) => {
                if (err !== null) {
                    reject(err);
                }

                resolve(response.matchedCount === 1);
            });
        });
    }

    public deleteChartAsync = (_id?: Mongo.ObjectId, userId?: Mongo.ObjectId): Promise<number> => {
        return new Promise((resolve, reject) => {
            if (!_id || !userId) {
                resolve(0);
            }

            this._chartColl.deleteOne({ _id, userId }, (err, response) => {
                if (err !== null) {
                    reject(err);
                }

                resolve(response.deletedCount);
            });
        });
    }
};