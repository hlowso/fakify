import { UnauthorizedResponse, PreCompController } from "../PreCompController";
import { ApiHelper } from "ApiHelper";
import * as Mongo from "mongodb";
import { Response } from "express";
import { IUser, ISong, ChartResponse } from "../../../shared/types";

export class ChartsPrivateController extends PreCompController {
    constructor(api: ApiHelper) {

        super(api);
        this._unauthorizedResponse = UnauthorizedResponse.Return401;

        /**
         * ROUTES
         */

        this._router.get("/user/titles", async (req, res) => {
            return await this._handleProjectionsAsync(res, (this._user as IUser)._id as Mongo.ObjectId);
        });

        this._router.post("/", async (req, res) => {
            let result: ChartResponse | undefined;

            try {
                result = await this._api.createChartAsync(req.body as ISong, (this._user as IUser)._id as Mongo.ObjectId);
            } catch (err) {
                res.status(500);
                res.json(ChartResponse.Error);
            }

            return this._handleChartResponse(res, result || ChartResponse.Error);
        });

        this._router.put("/:chartId", async (req, res) => {
            let chartId = this.parseObjectId(req.params.chartId);
            let result: ChartResponse | undefined;

            try {
                result = await this._api.updateChartAsync(req.body as ISong, chartId || undefined, (this._user as IUser)._id as Mongo.ObjectId);
            } catch (err) {
                res.status(500);
                res.json(ChartResponse.Error);
            }

            return this._handleChartResponse(res, result || ChartResponse.Error);
        });

        this._router.delete("/:chartId", async (req, res) => {
            let chartId = this.parseObjectId(req.params.chartId);
            let deleteCount = 0;

            try {
                deleteCount = await this._api.data.deleteChartAsync(chartId || undefined, (this._user as IUser)._id as Mongo.ObjectId)
            } catch (err) {
                res.status(500);
                return res.json(0);
            }

            res.status(200);
            return res.json(deleteCount);
        });
    }

    private _handleChartResponse = (res: Response, result: ChartResponse) => {

        switch(result) {
            case ChartResponse.Invalid:
                res.status(400);
                break
            
            case ChartResponse.Error:
                res.status(500);
                break;

            case ChartResponse.TitleTaken:
            case ChartResponse.ChartLimit:
            case ChartResponse.UserChartLimit:
                res.status(403);
                break;
            
            case ChartResponse.OK:
                res.status(200);
                break;
        }

        return res.json(result);

    }
}