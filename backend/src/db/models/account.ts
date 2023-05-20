import {DataTypes, Model, Optional} from "sequelize"
import {sequelizeConnection} from "../db";

interface AccountAttributes {
    id: number
    user_name: string
    password: string
}

export interface AccountInput extends Optional<AccountAttributes, 'id'> {
}

class Account extends Model<AccountAttributes, AccountInput> implements AccountAttributes {
    id!: number;
    password!: string;
    user_name!: string;
}

Account.init({
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
}, {
    sequelize: sequelizeConnection
})

export default Account