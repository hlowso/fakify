import path from "path";
import { UnauthorizedResponse, PreCompController } from "../PreCompController";
import { ApiHelper } from "ApiHelper";

export class StandardViewController extends PreCompController {
    constructor(api: ApiHelper) {

        super(api);
        this._unauthorizedResponse = UnauthorizedResponse.GoToLogin;

        /**
         * ROUTES
         */

        this._router.get(["/", "/play", "/create"], (req, res) => {
            res.sendFile(path.resolve(__dirname, "build/index.html"));
        });
    }
}