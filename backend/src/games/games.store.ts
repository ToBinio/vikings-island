import {GameCreateRequest, GameInfo} from "../../../types/games";

let games: GameInfo[] = []

let idCount = 0;

export function getAllGames(): GameInfo[] {
    return games;
}

export function addNewGame(gameCreateRequest: GameCreateRequest): number {

    let gameInfo: GameInfo = {
        id: ++idCount,
        players: [],
        name: gameCreateRequest.name,
        timestamp: gameCreateRequest.timeStamp
    }
    games.push(gameInfo)

    return idCount;
}


// false -> game could NOT be found
// true  -> game could be found
export function addPLayerToGame(gameId: number, playerId: number): boolean {
    const gameInfo = getGameById(gameId);

    if (gameInfo == undefined)
        return false

    gameInfo.players.push(playerId);

    return true;
}

function getGameById(gameId: number): GameInfo | undefined {
    for (let game of games) {
        if (game.id == gameId)
            return game
    }

    return undefined
}