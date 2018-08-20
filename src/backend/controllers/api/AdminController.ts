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

            if (req.session) {
                req.session.token = user.token;
            }

            return res.send(user);
        });

        this._router.patch("/login", async (req, res) => {
            let user = await this._api.loginUserAsync(req.body as IIncomingUser);

            if (!user) {
                res.status(401);
                return res.send("Incorrect username or password");
            }

            if (req.session) {
                req.session.token = user.token;
            }

            return res.send(user);
        });

        this._router.patch("/logout", async (req, res) => {
            let found = false;
            if (req.session) {
                try {
                    found = await this._api.data.clearUserTokenAsync(req.session.token);
                } catch (err) {
                    res.status(500);
                }
            }

            res.send(found);
        });

        this._router.get("/authenticate", async (req, res) => { 
            if (req.session) {
                let user = await this._api.data.getUserByTokenAsync(req.session.token);
                if (user) {
                    return res.send(user);
                }
            }

            res.status(401);
            return res.send("Missing or incorrect authentication token");
        })
    }
}
