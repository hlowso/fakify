import path from "path";
import { PreCompApiHelper } from "../PreCompApiHelper";
import { Router } from "express";
import { IUser, ISession } from "../../shared/types";

export enum UnauthorizedResponse {
    GoToLogin,
    Return401,
    Ignore
}

export class PreCompController {

    protected _api: PreCompApiHelper;
    protected _router: Router;    
    protected _unauthorizedResponse: UnauthorizedResponse;
    protected _user: IUser | null;
    protected _sessionToken?: ISession;

    constructor(api: PreCompApiHelper) {

        this._api = api;
        this._router = Router();
        this._user = null;

        this._router.use( async (req, res, next) => {

            console.log("TOKEN", req.get("X-Session-Token"));

            this._sessionToken = api.decryptSessionTokenEncryption(req.get("X-Session-Token"));

            console.log("SESSION", this._sessionToken)

            if (this._sessionToken) {
                this._user = await this._api.data.getUserByTokenAsync((this._sessionToken as ISession).token);
            }

            if (!this._user) {
                switch (this._unauthorizedResponse) {

                    case UnauthorizedResponse.GoToLogin: 
                        return res.sendFile(path.resolve(__dirname, "build/index.html"));

                    case UnauthorizedResponse.Ignore:
                        await next();
                        break;

                    default:
                    case UnauthorizedResponse.Return401:
                        res.status(401);
                        return res.send("Missing authentication token");
                }
            } else {
                await next();
            }
        });
    }

    get router() {
        return this._router;
    }
}