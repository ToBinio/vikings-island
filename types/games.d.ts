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