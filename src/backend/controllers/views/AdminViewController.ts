import path from "path";
import { UnauthorizedResponse, PreCompController } from "../PreCompController";
import { PreCompApiHelper } from "../../PreCompApiHelper";

export class AdminViewController extends PreCompController {
    constructor(api: PreCompApiHelper) {

        super(api);
        this._unauthorizedResponse = UnauthorizedResponse.Ignore;

        /**
         * ROUTES
         */

        this._router.get(["/login", "/signup"], (req, res) => {
            res.sendFile(path.resolve(__dirname, "/build/index.html"));
        });
    }
}