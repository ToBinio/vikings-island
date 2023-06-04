export interface Island {
    id: number
    playerId: number | undefined

    x: number,
    y: number,

    goldPerTick: number
}