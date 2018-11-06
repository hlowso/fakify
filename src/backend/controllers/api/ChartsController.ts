import { UnauthorizedResponse, PreCompController } from "../PreCompController";
import { ApiHelper } from "ApiHelper";
import { ISong } from "../../../shared/types";

export class ChartsController extends PreCompController {
    constructor(api: ApiHelper) {

        super(api);
        this._unauthorizedResponse = UnauthorizedResponse.Ignore;

        /**
         * ROUTES
         */

        this._router.get("/titles", async (req, res) => {
            return await this._handleProjectionsAsync(res);
        });

        this._router.get("/:chartId", async (req, res) => {
            let chartId = this.parseObjectId(req.params.chartId);
            let chart: ISong | null;

            try {
                chart = await this._api.data.getChartAsync(chartId || undefined);
            } catch (err) {
                res.status(500);
                return res.json(null);
            }

            res.status(chart ? 200 : 404);
            return res.json(chart);
        });

        this._router.get("/by-title/:title", async (req, res) => {
            let chart: ISong | null;

            try {
                chart = await this._api.data.getChartByTitleAsync(req.params.title as string)
            } catch (err) {
                res.status(500);
                return res.json(null);
            }

            res.status(chart ? 200 : 404);
            return res.json(chart);
        });
    }
}