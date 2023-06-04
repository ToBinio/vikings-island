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

    user_id: number | undefined,
    game_id: number,

    gold: number,
    color: string,
}

export interface ShipTable {
    id: Generated<number>,
    player_id: number,
    game_id: number,

    ticks_to_move: number,
    max_ticks_to_move: number,

    life: number,
    max_life: number,

    upgrade_count: number,

    damage: number,

    x: number,
    y: number,
    goal_x: Generated<number>,
    goal_y: Generated<number>
}

export interface IslandTable {
    id: Generated<number>,
    player_id: number | undefined,
    game_id: number,

    x: number,
    y: number,

    gold_per_tick: number
}

interface Database {
    users: UserTable
    games: GameTable
    players: PlayerTable
    ships: ShipTable
    islands: IslandTable
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