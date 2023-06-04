export interface ShipMoveRequest {
    shipId: number,
    gameId: number,

    goalX: number,
    goalY: number,
}

export interface ShipSpawnRequest {
    gameId: number,
    islandId: number,

    goalX: number,
    goalY: number,
}