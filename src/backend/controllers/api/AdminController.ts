import * as Util from "../../../shared/Util";
import { UnauthorizedResponse, PreCompController } from "../PreCompController";
import { PreCompApiHelper } from "../../PreCompApiHelper";
import { IIncomingUser } from "../../../shared/types";

export class AdminController extends PreCompController {
    constructor(api: PreCompApiHelper) {

        super(api);
        this._unauthorizedResponse = UnauthorizedResponse.Ignore;

        /**
         * ROUTES
         */

        this._router.post("/signup", async (req, res) => {
            let user = await this._api.createUserAsync(req.body as IIncomingUser);

            if (!user) {
                res.status(403);
                return res.send("User already exists");
            }

            req.session = { token: user.token };            

            return res.send(user);
        });

        this._router.patch("/login", async (req, res) => {

            console.log(req.body);

            let user = await this._api.loginUserAsync(req.body as IIncomingUser);

            console.log(user);

            if (!user) {
                res.status(401);
                return res.send("Incorrect username or password");
            }

            (req.session as any).token = user.token;

            console.log("NOW SESSION", req.session);

            return res.send(user);
        });

        this._router.patch("/logout", async (req, res) => {
            let found = false;
            if (!Util.objectIsEmpty(req.session)) {
                try {
                    found = await this._api.data.clearUserTokenAsync((req.session as any).token);
                } catch (err) {
                    res.status(500);
                }
                req.session = undefined;
            }

            res.send(found);
        });

        this._router.get("/authenticate", async (req, res) => { 
            if (!Util.objectIsEmpty(req.session)) {
                let user = await this._api.data.getUserByTokenAsync((req.session as any).token);
                if (user) {
                    return res.send(user);
                }
            }

            res.status(401);
            return res.send("Missing or incorrect authentication token");
        })
    }
}
