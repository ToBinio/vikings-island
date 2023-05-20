import {DataTypes, Sequelize} from "sequelize";
import {dbSettings} from "./dbSettings";

export const sequelize = new Sequelize(dbSettings.DB_NAME, dbSettings.USER, dbSettings.PASSWORD, {
    host: dbSettings.HOST,
    dialect: "postgres",
    define: {
        timestamps: false
    }
});

const Account = sequelize.define('account', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_name: {
        type: DataTypes.TEXT,
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.TEXT,
        allowNull: false
    }
})
