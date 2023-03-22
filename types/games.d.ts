export interface GameInfo {
    id: number,
    timestamp: number,
    players: number[],
    name: string
}

export type GameInfoResponse = GameInfo[]

export interface GameCreateRequest {
    timeStamp: number,
    name: string
}