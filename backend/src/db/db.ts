import {dbSettings} from "./dbSettings";
import {Generated, Kysely, PostgresDialect} from "kysely";
import {Pool} from "pg";

export interface UserTable {
    id: Generated<number>,

    user_name: string,
    password: string,

    is_admin: boolean
}

interface Database {
    users: UserTable
}

export const db = new Kysely<Database>({
    dialect: new PostgresDialect({
        pool: new Pool({
            host: dbSettings.HOST,
            database: dbSettings.DB_NAME,
            password: dbSettings.PASSWORD,
            user: dbSettings.USER
        })
    })
})