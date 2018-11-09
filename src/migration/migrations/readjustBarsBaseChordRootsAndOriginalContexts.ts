import { Migration } from "./MigrationBase";
import { ISong } from "../../shared/types";
import { ObjectId } from "mongodb";
import Chart from "../../shared/music/Chart";

const migration: Migration = async (data) => {

    try {
        let charts = await data.getChartsAsync() as ISong[];

        if (!Array.isArray(charts) || charts.length === 0) {
            throw new Error("no charts retrieved from db");
        }

        for (let chart of charts) {
            
            let c = new Chart(() => {}, chart.barsBase, chart.originalContext, chart.originalTempo);
            
            c.resetBarsBaseFromBars();

            let updateSuccessful = await data.updateChartAsync({ ...chart, originalContext: c.context, barsBase: c.barsBase }, chart._id as ObjectId, chart.userId as ObjectId);

            if (!updateSuccessful) {
                throw new Error(`chart update unsuccessful. chartId: ${chart._id}`);
            }
        }
    } catch (err) {
        console.error(`ERROR: ${err}`);
        return false;
    }
    
    return true;
};

export default migration;