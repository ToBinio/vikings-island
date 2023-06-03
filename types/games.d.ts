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
        userId: number,
        playerId: number,
        gold: number,
        color: string
    }[]

    ships: {
        id: number
        playerId: number

        x: number,
        y: number,

        goal_x: number | undefined,
        goal_y: number | undefined
    }[]

    islands: {
        id: number
        playerId: number | undefined

        x: number,
        y: number,

        goldPerTick: number
    }[]
}

export interface Game {
    id: number,
    name: string
    tick: number
}