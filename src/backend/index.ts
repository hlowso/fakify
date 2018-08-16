import express from "express";
import cookieSession from "cookie-session";
import bodyParser from "body-parser";
import { PreCompData } from "./PreCompData";
import { PreCompApiHelper } from "./PreCompApiHelper";

import { AdminController } from "./controllers/api/AdminController";
import { AdminViewController } from "./controllers/views/AdminViewController";
import { StandardViewController } from "./controllers/views/StandardViewController";

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

    // Set routes
    let adminViewRouter = new AdminViewController(api).router;
    let standardViewRouter = new StandardViewController(api).router;
    
    server.use("/login", adminViewRouter);
    server.use("/signup", adminViewRouter);
    server.use("/play", standardViewRouter);
    server.use("/create", standardViewRouter);    

    server.use("/api/admin", 
        new AdminController(api).router
    );

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
