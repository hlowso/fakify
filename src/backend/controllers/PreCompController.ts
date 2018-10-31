import { ApiHelper } from "ApiHelper";
import { Router } from "express";
import { IUser, ISession } from "../../shared/types";
import * as Mongo from "mongodb";

export enum UnauthorizedResponse {
    GoToLogin,
    Return401,
    Ignore
}

export class PreCompController {

    protected _api: ApiHelper;
    protected _router: Router;    
    protected _unauthorizedResponse: UnauthorizedResponse;
    protected _user: IUser | null;
    protected _sessionToken?: ISession;

    constructor(api: ApiHelper) {

        this._api = api;
        this._router = Router();
        this._user = null;

        this._router.use( async (req, res, next) => {

            this._sessionToken = api.decryptSessionTokenEncryption(req.get("X-Session-Token"));

            if (this._sessionToken) {
                this._user = await this._api.data.getUserByTokenAsync(this._sessionToken.token);
            }

            if (!this._user) {
                switch (this._unauthorizedResponse) {

                    case UnauthorizedResponse.Ignore:
                        await next();
                        break;

                    default:
                    case UnauthorizedResponse.Return401:
                        res.status(401);
                        return res.json("Missing authentication token");
                }
            } else {
                await next();
            }
        });
    }

    get router() {
        return this._router;
    }

    protected parseObjectId = (id: string) => {
        if (typeof id !== "string") {
            return;
        } 

        let parsedId: Mongo.ObjectId | undefined;
        try {
            parsedId = new Mongo.ObjectId(id);
        } catch (err) {
            console.error(`Cannot parse mongo object ID: ${id}`);
        }

        return parsedId || null;
    }
}