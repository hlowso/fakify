import uuidv4 from "uuid/v4";
import bcrypt from "bcryptjs";
import { PreCompData } from "./PreCompData";
import { IIncomingUser } from "../shared/types";

export class PreCompApiHelper {
    private _data: PreCompData;

    constructor(data: PreCompData) {
        this._data = data;
    }

    get data() {
        return this._data;
    }

    public createUserAsync = async (newUser: IIncomingUser) => {

        let existingUser = await this._data.getUserByEmailAsync(newUser.email);

        if (existingUser) {
            return null;
        }

        let user = { 
            email: newUser.email, 
            passhash: bcrypt.hashSync(newUser.password, 10), 
            token: uuidv4() 
        };

        await this._data.insertUserAsync(user);

        return user;
    }

    public loginUserAsync = async (returningUser: IIncomingUser) => {
        let existingUser = await this._data.getUserByEmailAsync(returningUser.email);   

        if (!existingUser) {
            return null;
        }    

        if (!bcrypt.compareSync(returningUser.password, existingUser.passhash)) {
            return null;
        }

        let newToken = uuidv4();

        await this._data.updateUserTokenAsync(existingUser.email, newToken);

        return { ...existingUser, token: newToken};
    }

    public getChartTitleProjectionsAsync = async () => {
        return (await this._data.getChartsAsync()).map(chart => {
            let titleObj = {};
            titleObj[chart.chartId as string] = chart.title;
            return titleObj;
        });
    }
}