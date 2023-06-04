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

    ships: {
        id: number
        playerId: number

        x: number,
        y: number,

        ticksToMove: number,
        maxTicksToMove: number,

        life: number,
        max_life: number,

        upgrade_count: number,

        damage: number,

        goalX: number | undefined,
        goalY: number | undefined
    }[]

    islands: {
        id: number
        playerId: number | undefined

        life: number,
        max_life: number,

        upgrade_count: number,

        damage: number,

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