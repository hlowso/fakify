import path from "path";
import { UnauthorizedResponse, PreCompController } from "../PreCompController";
import { PreCompApiHelper } from "../../PreCompApiHelper";

export class StandardViewController extends PreCompController {
    constructor(api: PreCompApiHelper) {

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