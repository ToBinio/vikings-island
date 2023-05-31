import {CreateNewGame, NewGame} from "../../../types/games";
import {NewGameStore} from "./newGameStore";
import {TokenData} from "../util/token";
import {Result} from "../../../types/util";
import {EventService} from "../event/event.service";

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
        EventService.get().updateWaitList(gameId)

        return {ok: gameId};
    }

    joinGame(gameId: number, token: TokenData): Result<JoinGameCreationError, undefined> {

        if (NewGameStore.get().getGameById(gameId) == undefined) {
            return {err: JoinGameCreationError.gameNotFound}
        }

        NewGameStore.get().addPLayerToGame(gameId, token.id);
        EventService.get().updateWaitList(gameId)

        return {ok: undefined};
    }
}

export enum NewGameCreationError {
    gameNameAlreadyTaken,
}

export enum JoinGameCreationError {
    gameNotFound,
    gameFull,
}