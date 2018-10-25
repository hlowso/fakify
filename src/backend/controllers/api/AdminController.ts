import { UnauthorizedResponse, PreCompController } from "../PreCompController";
import { PreCompApiHelper } from "../../PreCompApiHelper";
import { IIncomingUser, IUser, LoginResponse, SignupResponse } from "../../../shared/types";

export class AdminController extends PreCompController {
    constructor(api: PreCompApiHelper) {

        super(api);
        this._unauthorizedResponse = UnauthorizedResponse.Ignore;

        /**
         * ROUTES
         */

        this._router.post("/signup", async (req, res) => {
            let result: IUser | SignupResponse;
            
            try {
                result = await this._api.createUserAsync(req.body as IIncomingUser);
            } catch (err) {
                res.status(500);
                return res.json(SignupResponse.Error);
            }

            if (typeof result === "string") {
                switch (result) {
                    default:
                    case SignupResponse.Error:
                        res.status(500);
                        return res.json(SignupResponse.Error);
    
                    case SignupResponse.EmailTaken:
                    case SignupResponse.InvalidCredentials:
                        res.status(403);
                        return res.json(result);
    
                }
            }

            res.set("X-Session-Token", this._api.encryptSessionToken({ token: result.token }));            
            return res.json(SignupResponse.OK);
        });

        this._router.patch("/login", async (req, res) => {
            let user: IUser | null;

            try {
                user = await this._api.loginUserAsync(req.body as IIncomingUser);
            } catch (err) {
                res.status(500);
                return res.json(LoginResponse.Error);
            }

            if (!user) {
                res.status(401);
                return res.json(LoginResponse.BadCredentials);
            }

            res.set("X-Session-Token", this._api.encryptSessionToken({ token: user.token }));                        
            return res.json(LoginResponse.OK);
        });

        this._router.patch("/logout", async (req, res) => {
            let found = false;
            if (this._user) {
                try {
                    found = await this._api.data.clearUserTokenAsync(this._user.token);
                } catch (err) {
                    res.status(500);
                }
                
                res.set("X-Session-Token", undefined);
            }

            this._sessionToken = undefined;
            this._user = null;

            return res.json(found);
        });

        this._router.get("/authenticate", async (req, res) => { 
            if (this._user) {
                return res.json(this._user);
            }

            res.status(401);
            return res.json("Missing or incorrect authentication token");
        });
    }
}
