export interface ShipMoveRequest {
    shipId: number,
    gameId: number,

    goalX: number,
    goalY: number,
}

export interface Ship {
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
}

export interface ShipSpawnRequest {
    gameId: number,
    islandId: number,
}

export interface ShipUpgradeRequest {
    gameId: number,
    shipId: number,
}