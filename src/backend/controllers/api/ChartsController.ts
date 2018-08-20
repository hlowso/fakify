import { UnauthorizedResponse, PreCompController } from "../PreCompController";
import { PreCompApiHelper } from "../../PreCompApiHelper";

export class ChartsController extends PreCompController {
    constructor(api: PreCompApiHelper) {

        super(api);
        this._unauthorizedResponse = UnauthorizedResponse.Return403;

        /**
         * ROUTES
         */

        this._router.get("/titles", async (req, res) => {
            return await this._api.getChartTitleProjectionsAsync();
        });
    }
}