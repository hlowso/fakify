import { Migration } from "./MigrationBase";
import { DataHelper } from "../../backend/DataHelper";

const backup: Migration = async (data) => {

    let localDb = new DataHelper("localhost:27017", "", "", "fakify-prod-backup");

    try {
        await localDb.connectAsync();

        let charts = await data.getChartsAsync();

        if (!Array.isArray(charts) || charts.length === 0) {
            throw new Error("no charts retrieved");
        }

        for (let chart of charts) {
            let success = localDb.insertChartAsync(chart);

            if (!success) {
                throw new Error(`chart could not be saved: ${chart._id}`);
            }
        }

        let users = await data.getUsersAsync();

        if (!Array.isArray(users) || users.length === 0) {
            throw new Error("no users retrieved");
        }

        for (let user of users) {
            let success = localDb.insertUserAsync(user);

            if (!success) {
                throw new Error(`user could not be saved: ${user._id}`);
            }
        }

    } catch (err) {
        localDb.close();
        console.error(`ERROR: ${err}`);
        return false;
    } 

    localDb.close();

    return true;
};

export default backup;