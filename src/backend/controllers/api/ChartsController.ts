import { UnauthorizedResponse, PreCompController } from "../PreCompController";
import { PreCompApiHelper } from "../../PreCompApiHelper";
import * as Mongo from "mongodb";
import { IUser } from "../../../shared/types";

export class ChartsController extends PreCompController {
    constructor(api: PreCompApiHelper) {

        super(api);
        this._unauthorizedResponse = UnauthorizedResponse.Return401;

        /**
         * ROUTES
         */

        this._router.get("/titles", async (req, res) => {
            return res.send(await this._api.getChartTitleProjectionsAsync());
        });

        this._router.get("/user/titles", async (req, res) => {
            return res.send(await this._api.getChartTitleProjectionsAsync((this._user as IUser)._id));
        });

        this._router.get("/:chartId", async (req, res) => {
            return res.send(await this._api.data.getChartAsync(new Mongo.ObjectID(req.params.chartId as string)));
        });
    }
}