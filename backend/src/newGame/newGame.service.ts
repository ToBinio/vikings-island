import {CreateNewGame, NewGame} from "../../../types/games";
import {NewGameStore} from "./newGameStore";
import {TokenData} from "../util/token";
import {Result} from "../../../types/util";

export class NewGameService {

    static instance: NewGameService | undefined;

    static get(): NewGameService {
        if (NewGameService.instance == undefined) {
            NewGameService.instance = new NewGameService();
        }

        return NewGameService.instance;
    }

    private constructor() {
    }

    getAllGames(): NewGame[] {
        return NewGameStore.get().getAllGames();
    }

    createGame(gameCreateRequest: CreateNewGame, token: TokenData): Result<NewGameCreationError, number> {

        if (NewGameStore.get().getGameByName(gameCreateRequest.name) != undefined) {
            return {err: NewGameCreationError.gameNameAlreadyTaken};
        }

        let gameId = NewGameStore.get().createGame(gameCreateRequest);

        NewGameStore.get().addPLayerToGame(gameId, token.id);

        return {ok: gameId};
    }
}

export enum NewGameCreationError {
    gameNameAlreadyTaken,
}