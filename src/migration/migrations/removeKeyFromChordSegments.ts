import { Migration } from "./MigrationBase";
import { ISong, IChartBar } from "../../shared/types";
import * as Util from "../../shared/Util";
import { ObjectId } from "mongodb";

export const removeKeysFromChordSegments: Migration = async (data) =>  {
    let charts = await data.getChartsAsync() as ISong[];

    if (!Array.isArray(charts)) {
        console.error("ERROR: Charts could not be retrieved from database");
        return false;
    }

    for (let chart of charts) {
        let chartCopy = Util.copyObject(chart);

        if (!Array.isArray(chartCopy.barsBase) || chartCopy.barsBase.length === 0) {
            console.error(`ERROR: chart.barsBase is not an array. chartId: ${chart._id}`);
            return false;
        }

        (chartCopy.barsBase as IChartBar[]).forEach((bar, barIdx) => {
            if (!Array.isArray(bar.chordSegments) || bar.chordSegments.length === 0) {
                console.error(`ERROR: bar.chordSegments is not an array. chartId: ${chart._id}, barIdx: ${barIdx}`);
                return false;
            }

            bar.chordSegments.forEach(segment => {
                delete segment.key;
            });
        });

        let updateSuccessful = await data.updateChartAsync(chartCopy, chart._id as ObjectId, chart.userId as ObjectId);

        if (!updateSuccessful) {
            console.error(`ERROR: chart update unsuccessful. chartId: ${chart._id}`);
            return false;
        }
    }

    return true;
}