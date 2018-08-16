// import express from "express";
import { UnauthorizedResponse, PreCompController } from "../PreCompController";
import { PreCompApiHelper } from "../../PreCompApiHelper";
import { IIncomingUser } from "../../../shared/types";

export class AdminController extends PreCompController {
    constructor(api: PreCompApiHelper) {

        super(api);
        this._unauthorizedResponse = UnauthorizedResponse.Ignore;

        /**
         * ROUTES
         */

        this._router.use("/signup", async (req, res) => {
            let user = await this._api.createUserAsync(req.body as IIncomingUser);
            if (!user) {
                res.status(403);
                return res.send("User already exists");
            }
            return res.send(user);
        });

        this._router.use("/login", async (req, res) => {
            let user = await this._api.loginUserAsync(req.body as IIncomingUser);
            if (!user) {
                res.status(401);
                return res.send("Incorrect username or password");
            }
            return res.send(user);
        });

        // TODO: remove this endpoint
        this._router.use("/authenticate", (req, res) => { 
            res.status(400);
            res.send("Deprecated endpoint");
        })
    }
}
