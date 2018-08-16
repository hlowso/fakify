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
            let token: string | undefined;

            if (req.session) {
                token = req.session.token;
            }
            
            if (token) {
                this._user = await this._api.data.getUserByTokenAsync(token);
            }

            console.log(this._user);

            if (!this._user) {
                switch (this._unauthorizedResponse) {
                    case UnauthorizedResponse.GoToLogin: 
                        console.log("GO TO LOGIN", __dirname);
                        return res.sendFile(path.resolve(__dirname, "build/index.html"));
                    case UnauthorizedResponse.Ignore:
                        console.log("IGNORE");                    
                        return next();
                    default:
                    case UnauthorizedResponse.Return403:
                        console.log("403");
                        res.status(401);
                        return res.send("Missing authentication token");
                }
            } else {
                console.log("ELSE");
                return next();
            }
        });
    }

    get router() {
        return this._router;
    }
}