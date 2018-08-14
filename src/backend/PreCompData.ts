import * as Mongo from "mongodb";

export class PreCompData {
    private _mongoServer: string;
    private _user: string;
    private _password: string;
    private _dbName: string;
    private _client: any;
    private _db: Mongo.Db;

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
            Mongo.MongoClient.connect(this.connectionUrl, (err, client) => {

                if (err !== null) {
                    reject(err);
                }

                this._client = client;
                this._db = client.db();

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

    public getChartsAsync = () => {
        return new Promise((resolve, reject) => {
            const coll = this._db.collection("Charts");
            coll.find({}).toArray((err, charts) => {
                if (err !== null) {
                    reject(err);
                }

                resolve(charts);
            });
        });
    }
};