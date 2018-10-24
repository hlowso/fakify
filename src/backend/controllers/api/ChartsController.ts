import { UnauthorizedResponse, PreCompController } from "../PreCompController";
import { PreCompApiHelper } from "../../PreCompApiHelper";
import * as Mongo from "mongodb";
import { IUser, ISong } from "../../../shared/types";

export class ChartsController extends PreCompController {
    constructor(api: PreCompApiHelper) {

        super(api);
        this._unauthorizedResponse = UnauthorizedResponse.Return401;

        /**
         * ROUTES
         */

        this._router.get("/titles", async (req, res) => {
            return res.json(await this._api.getChartTitleProjectionsAsync());
        });

        this._router.get("/user/titles", async (req, res) => {
            return res.json(await this._api.getChartTitleProjectionsAsync((this._user as IUser)._id as Mongo.ObjectId));
        });

        this._router.get("/:chartId", async (req, res) => {
            let chartId = this.parseObjectId(req.params.chartId);
            return res.json(await this._api.data.getChartAsync(chartId || undefined));

        });

        this._router.post("/", async (req, res) => {
            return res.json(await this._api.createChartAsync(req.body as ISong, (this._user as IUser)._id as Mongo.ObjectId));
        });

        this._router.put("/:chartId", async (req, res) => {
            let chartId = this.parseObjectId(req.params.chartId);
            return res.json(await this._api.data.updateChartAsync(req.body as ISong, chartId || undefined,));
        });

        this._router.delete("/:chartId", async (req, res) => {
            let chartId = this.parseObjectId(req.params.chartId);
            return res.json(await this._api.data.deleteChartAsync(chartId || undefined));
        });

        this._router.get("/by-title/:title", async (req, res) => {
            return res.json(await this._api.data.getChartByTitleAsync(req.params.title as string));
        });
    }
}