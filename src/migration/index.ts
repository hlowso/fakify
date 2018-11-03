import { DataHelper } from "../backend/DataHelper";
import { stripBars } from "./migrations/stripBars";
import { Migration } from "migrations/MigrationBase";

(async function() {
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
        console.error("UNDEFINED MIGRATION. Pass migration name as argument to 'npm run migration' to run a migration."); 
        return;       
    } else if(!(MIGRATION in migrations)) {
        console.error(`INVALID MIGRATION: '${MIGRATION}'.`);
        return;
    }

    let data = new DataHelper(MONGO_SERVER as string, MONGO_USER as string, MONGO_PASSWORD as string, MONGO_DATABASE_NAME as string);
    await data.connectAsync();

    let success = await migrations[MIGRATION as string](data);

    success ? console.log("MIGRATION SUCCESSFUL") : console.error("MIGRATION FAILED");

    data.close();
})();

