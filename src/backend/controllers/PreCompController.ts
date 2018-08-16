import path from "path";
import { PreCompApiHelper } from "../PreCompApiHelper";
import { Router } from "express";
import { IUser } from "../../shared/types";

export enum UnauthorizedResponse {
    GoToLogin,
    Return403,
    Ignore
}

export class PreCompController {

    protected _api: PreCompApiHelper;
    protected _router: Router;    
    protected _unauthorizedResponse: UnauthorizedResponse;
    protected _user: IUser | null;

    constructor(api: PreCompApiHelper) {

        this._api = api;
        this._router = Router();
        this._user = null;

        this._router.use( async (req, res, next) => {
            if (req.session) {
                this._user = await this._api.data.getUserByTokenAsync(req.session.token);
            }

            if (!this._user) {
                switch (this._unauthorizedResponse) {
                    case UnauthorizedResponse.GoToLogin: 
                        res.sendFile(path.resolve(__dirname, "/build/index.html"));
                        break;
                    case UnauthorizedResponse.Ignore:
                        next();
                        break;
                    default:
                    case UnauthorizedResponse.Return403:
                        res.status(401);
                        res.send("Missing authentication token");
                        break;
                }
            }
        });
    }

    get router() {
        return this._router;
    }
}