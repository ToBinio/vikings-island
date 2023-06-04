import {Ship} from "./ship";
import {Island} from "./island";

export interface NewGame {
    id: number,
    tick: number,
    players: number[],
    name: string
}

export type NewGames = NewGame[]

export interface CreateNewGame {
    timeStamp: number,
    name: string
}

export interface GameData {
    id: number,
    name: string
    tick: number

    players: {
        userId: number | undefined,
        playerId: number,
        gold: number,
        color: string
    }[]

    ships: Ship[]

    islands: Island[]
}

export interface Game {
    id: number,
    name: string
    tick: number
}