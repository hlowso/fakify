import path from "path";
import { PreCompApiHelper } from "../PreCompApiHelper";
import { Router } from "express";
import { IUser } from "../../shared/types";

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

    constructor(api: PreCompApiHelper) {

        this._api = api;
        this._router = Router();
        this._user = null;

        this._router.use( async (req, res, next) => {

            console.log(this.constructor.name);

            console.log(req.url, "SESSION", req.session)

            if (req.session) {
                this._user = await this._api.data.getUserByTokenAsync(req.session.token);
            }

            console.log(req.url, "USER", this._user);
            
            
            if (!this._user) {
                console.log(req.url, "RESP", this._unauthorizedResponse);
                
                switch (this._unauthorizedResponse) {

                    case UnauthorizedResponse.GoToLogin: 
                        return res.sendFile(path.resolve(__dirname, "build/index.html"));

                    case UnauthorizedResponse.Ignore:
                        next();
                        break;

                    default:
                    case UnauthorizedResponse.Return401:
                        res.status(401);
                        return res.send("Missing authentication token");
                }
            } else {
                next();
            }
        });
    }

    get router() {
        return this._router;
    }
}