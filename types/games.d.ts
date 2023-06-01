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
        gold: number,
        color: string
    }[]
}

export interface Game {
    id: number,
    name: string
    tick: number
}