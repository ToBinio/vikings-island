export interface Island {
    id: number
    playerId: number | undefined

    life: number,
    max_life: number,

    upgrade_count: number,

    damage: number,

    x: number,
    y: number,

    goldPerTick: number
}

export interface IslandUpgradeRequest {
    gameId: number,
    islandId: number,
}