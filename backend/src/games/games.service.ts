import {GameCreateRequest, GameInfo} from "../../../types/games";
import {addNewGame, addPLayerToGame, getAllGames} from "./games.store";
import {TokenData} from "../util/token";

export function getAllGameInfos(): GameInfo[] {
    return getAllGames();
}

export function createGame(gameCreateRequest: GameCreateRequest, token: TokenData): number {
    let gameId = addNewGame(gameCreateRequest);

    addPLayerToGame(gameId, token.id);

    return gameId;
}