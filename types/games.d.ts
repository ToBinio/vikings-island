export interface GameInfo {
    timestamp: number,
    players: number[],
    name: string
}

export type GameInfoResponse = GameInfo[]