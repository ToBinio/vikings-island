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

    leaveGame(gameId: number, token: TokenData): Result<LeaveGameCreationError, undefined> {

        if (NewGameStore.get().getGameById(gameId) == undefined) {
            return {err: LeaveGameCreationError.gameNotFound}
        }

        const result = NewGameStore.get().removePLayerToGame(gameId, token.id);

        if (result.err != undefined) {
            return result;
        }

        EventService.get().updateWaitList(gameId)

        return {ok: undefined};
    }

    getGame(gameId: number): NewGame | undefined {
        return NewGameStore.get().getGameById(gameId);
    }
}

export enum NewGameCreationError {
    gameNameAlreadyTaken,
}

export enum JoinGameCreationError {
    gameNotFound,
    gameFull,
}

export enum LeaveGameCreationError {
    gameNotFound,
    neverJoined,
}