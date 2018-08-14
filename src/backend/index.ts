import express from "express";
import path from "path";
import { PreCompData } from "./PreCompData";

// import fs from "fs";
// let files = fs.readdirSync('./build/static/js');
// /Users/hlowso/Projects/precomp/precomp-frontend/

const exitHandler = (db: PreCompData, options: any, exitCode: number) => {
    db.close();
    if (options.exit) {
        process.exit();
    }
};

(async function() {

    /**
     * SETUP
     */

    const { 
        PORT, 
        MONGO_SERVER, 
        MONGO_USER, 
        MONGO_PASSWORD, 
        MONGO_DATABASE_NAME 
    } = process.env;

    // Create database helper
    const data = new PreCompData(
        MONGO_SERVER as string,
        MONGO_USER as string,
        MONGO_PASSWORD as string,
        MONGO_DATABASE_NAME as string
    );

    await data.connectAsync();

    console.log(await data.getChartsAsync());

    // Setup server
    const server = express();

    server.use(express.static('build'));

    server.get(['/', '/login', '/signup'], (req, res) => { 
        res.sendFile(path.join(__dirname, "/build/index.html")); 
    });

    server.listen(PORT, () => console.log(`Precomp listening on port ${PORT}!`));

    /**
     * CLEANUP
     */

    //do something when app is closing
    process.on('exit', exitHandler.bind(null, data, { cleanup:true }));

    //catches ctrl+c event
    process.on('SIGINT', exitHandler.bind(null, data, { exit:true }));

    // catches "kill pid" (for example: nodemon restart)
    process.on('SIGUSR1', exitHandler.bind(null, data, { exit:true }));
    process.on('SIGUSR2', exitHandler.bind(null, data, { exit:true }));

    //catches uncaught exceptions
    process.on('uncaughtException', exitHandler.bind(null, data, { exit:true }));
})();






