// import express from "express";
import { UnauthorizedResponse, PreCompController } from "../PreCompController";
import { PreCompApiHelper } from "../../PreCompApiHelper";

export class AdminController extends PreCompController {
    constructor(api: PreCompApiHelper) {

        super(api);
        this._unauthorizedResponse = UnauthorizedResponse.Ignore;

        /**
         * ROUTES
         */

        this._router.use();
    }
}
