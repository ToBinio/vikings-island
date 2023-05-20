import {DataTypes, Sequelize} from "sequelize";
import {dbSettings} from "./dbSettings";
import Account from "./models/account";

export const sequelizeConnection = new Sequelize(dbSettings.DB_NAME, dbSettings.USER, dbSettings.PASSWORD, {
    host: dbSettings.HOST,
    dialect: "postgres",
    define: {
        timestamps: false
    }
});

const dbInit  = async () => {
     await Account.sync()
}
export default dbInit
