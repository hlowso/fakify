import { DataHelper } from "../backend/DataHelper";
import { stripBars } from "./migrations/stripBars";
import { Migration } from "./migrations/MigrationBase";

require("dotenv").config();

(async () => {
    const { 
        MONGO_SERVER, 
        MONGO_USER, 
        MONGO_PASSWORD, 
        MONGO_DATABASE_NAME
    } = process.env;

    let MIGRATION = process.argv[2];

    // Add migrations here...
    let migrations: { [name: string]: Migration } = {
        stripBars
    };

    if (!MIGRATION) {
        throw new Error("UNDEFINED MIGRATION. Pass migration name as argument to 'npm run migration' to run a migration."); 
    } else if(!(MIGRATION in migrations)) {
        throw new Error(`INVALID MIGRATION: '${MIGRATION}'.`);
    }

    let data = new DataHelper(MONGO_SERVER as string, MONGO_USER as string, MONGO_PASSWORD as string, MONGO_DATABASE_NAME as string);
    await data.connectAsync();

    let success = await migrations[MIGRATION as string](data);

    data.close();

    if (success) {
        console.log("MIGRATION SUCCESSFUL");
    } else {
        throw new Error("MIGRATION FAILED");
    }
})();

