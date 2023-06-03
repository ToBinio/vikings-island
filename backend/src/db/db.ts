import {dbSettings} from "./dbSettings";
import {Generated, Kysely, PostgresDialect} from "kysely";
import {Pool} from "pg";

export interface UserTable {
    id: Generated<number>,

    user_name: string,
    password: string,

    is_admin: boolean
}

export interface GameTable {
    id: Generated<number>,

    name: string
    tick: number
}

export interface PlayerTable {
    id: Generated<number>,

    user_id: number,
    game_id: number,

    gold: number,
    color: string,
}

export interface ShipTable {
    id: Generated<number>,
    user_id: number,
    game_id: number,

    x: number,
    y: number,
    goal_x: Generated<number>,
    goal_y: Generated<number>
}

interface Database {
    users: UserTable
    games: GameTable
    players: PlayerTable
    ships: ShipTable
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