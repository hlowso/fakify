import express from "express";
import cookieSession from "cookie-session";
import bodyParser from "body-parser";
import { PreCompData } from "./PreCompData";
import { PreCompApiHelper } from "./PreCompApiHelper";

import { AdminController } from "./controllers/api/AdminController";
import { ChartsController } from "./controllers/api/ChartsController";
import { AdminViewController } from "./controllers/views/AdminViewController";
import { StandardViewController } from "./controllers/views/StandardViewController";

import { AdminRoutes, StandardRoutes } from "../shared/types";

const exitHandler = (data: PreCompData, options: any, exitCode: number) => {
    data.close();
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
        MONGO_DATABASE_NAME,
        SESSION_SECRET 
    } = process.env;

    // Create database helper
    const data = new PreCompData(
        MONGO_SERVER as string,
        MONGO_USER as string,
        MONGO_PASSWORD as string,
        MONGO_DATABASE_NAME as string
    );

    await data.connectAsync();

    // Create api helper
    const api = new PreCompApiHelper(data);

    // Setup server
    const server = express();

    server.use(express.static('build'));
    server.use(cookieSession({
        name: "PreComp Session",
        secret: SESSION_SECRET as string,
        maxAge: 24 * 60 * 60 * 1000 * 7 // One week
    }));
    server.use(bodyParser.json());

    // Enable CORS
    server.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "origin, x-requested-with, content-type, accept");
        res.header("Access-Control-Allow-Methods", "POST, GET, PUT, PATCH, DELETE, OPTIONS");
        next();
    });

    // Set routes
    server.use(AdminRoutes, new AdminViewController(api).router);
    server.use(StandardRoutes, new StandardViewController(api).router);

    let apiRouter = express.Router();

    apiRouter.use("/admin",
        new AdminController(api).router
    );

    apiRouter.use("/songs", 
        new ChartsController(api).router
    );

    server.use("/api", apiRouter);

    server.listen(PORT, () => console.log(`Precomp listening on port ${PORT}!`));

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
