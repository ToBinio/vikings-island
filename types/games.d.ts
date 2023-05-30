export interface NewGame {
    id: number,
    tick: number,
    players: number[],
    name: string
}

export type newGames = NewGame[]

export interface CreateNewGame {
    timeStamp: number,
    name: string
}