import path from "path";
import { PreCompApiHelper } from "../PreCompApiHelper";
import { Router } from "express";

export enum UnauthorizedResponse {
    GoToLogin,
    Return403,
    Ignore
}

export class PreCompController {

    protected _api: PreCompApiHelper;
    protected _router: Router;    
    protected _unauthorizedResponse: UnauthorizedResponse;

    constructor(api: PreCompApiHelper) {

        this._api = api;
        this._router = Router();

        this._router.use((req, res, next) => {
            let hasToken = false;
            if (hasToken) {
                switch (this._unauthorizedResponse) {
                    case UnauthorizedResponse.GoToLogin: 
                        res.sendFile(path.resolve(__dirname, "/build/index.html"));
                        break;
                    case UnauthorizedResponse.Ignore:
                        next();
                        break;
                    default:
                    case UnauthorizedResponse.Return403:
                        res.status(403);
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