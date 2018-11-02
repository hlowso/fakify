import { DataHelper } from "../../backend/DataHelper";
export type Migration = (data: DataHelper) => Promise<boolean>;