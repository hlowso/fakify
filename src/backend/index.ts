import express from "express";
import bodyParser from "body-parser";
import { DataHelper } from "DataHelper";
import { ApiHelper } from "ApiHelper";

import { AdminController } from "./controllers/api/AdminController";
import { ChartsController } from "./controllers/api/ChartsController";
import { ChartsPrivateController } from "./controllers/api/ChartsPrivateController";

import path from "path";

const exitHandler = (data: DataHelper, options: any, exitCode: number) => {
    data.close();
    if (options.exit) {
        process.exit();
    }
};

(async function() {

    /**
     * SETUP
     */

    let { 
        PORT,
        TEST_PORT, 
        MONGO_SERVER, 
        MONGO_USER, 
        MONGO_PASSWORD, 
        MONGO_DATABASE_NAME,
        DEV_MONGO_SERVER, 
        DEV_MONGO_USER, 
        DEV_MONGO_PASSWORD, 
        DEV_MONGO_DATABASE_NAME,
        SESSION_SECRET 
    } = process.env;

    let flag = process.argv[2];

    if (flag === "--test") {
        PORT = TEST_PORT;
        MONGO_SERVER = DEV_MONGO_SERVER;
        MONGO_USER = DEV_MONGO_USER;
        MONGO_PASSWORD = DEV_MONGO_PASSWORD;
        MONGO_DATABASE_NAME = DEV_MONGO_DATABASE_NAME;
    }

    // Create database helper
    const data = new DataHelper(
        MONGO_SERVER as string,
        MONGO_USER as string,
        MONGO_PASSWORD as string,
        MONGO_DATABASE_NAME as string
    );

    try {
        await data.connectAsync();
    } catch(err) {
        console.error("PRECOMP: failed to connect to mLab", err);
        return;
    }

    // Create api helper
    const api = new ApiHelper(data, SESSION_SECRET as string);

    // Setup server
    const server = express();

    server.use(express.static(path.join(__dirname, "build")));
    server.use(bodyParser.json());

    // Enable CORS
    server.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "https://fakify.netlify.com");
        res.header("Access-Control-Allow-Headers", "origin, x-requested-with, content-type, accept, set-cookie, x-session-token");
        res.header("Access-Control-Expose-Headers", "x-session-token");        
        res.header("Access-Control-Allow-Methods", "POST, GET, PUT, PATCH, DELETE, HEAD, OPTIONS");
        res.header("Access-Control-Allow-Credentials", "true");

        if (req.method === "OPTIONS") {
            res.status(204);
            res.json();
        } else {
            next();
        }
    });

    let apiRouter = express.Router();

    apiRouter.use("/admin",
        new AdminController(api).router
    );

    apiRouter.use("/songs", 
        new ChartsController(api).router,
        new ChartsPrivateController(api).router
    );

    server.use("/api", apiRouter);

    let pathToApp = path.join(__dirname, "build", "index.html");

    // Catch all other requests and return the app which will generate a
    // "Not Found" message
    server.get(/\/.*/, (req, res) => {
        return res.sendFile(pathToApp);
    });

    server.listen(PORT, () => console.log(`Fakify listening on port ${PORT}!`));

    /**
     * CLEANUP
     */

    //do something when app is closing
    process.on('exit', exitHandler.bind(null, data, { cleanup: true }));

    //catches ctrl+c event
    process.on('SIGINT', exitHandler.bind(null, data, { exit: true }));

    // catches "kill pid" (for example: nodemon restart)
    process.on('SIGUSR1', exitHandler.bind(null, data, { exit: true }));
    process.on('SIGUSR2', exitHandler.bind(null, data, { exit: true }));

    //catches uncaught exceptions
    process.on('uncaughtException', exitHandler.bind(null, data, { exit: true }));

})();
