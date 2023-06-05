import {CreateNewGame, NewGame} from "../../../types/games";
import {NewGameStore} from "./newGame.store";
import {TokenData} from "../util/token";
import {Result} from "../../../types/util";
import {EventService} from "../event/event.service";
import {GameService} from "../game/game.service";

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

        if (gameCreateRequest.timeStamp < 1) {
            return {err: NewGameCreationError.gameTickToShort};
        }

        let gameId = NewGameStore.get().createGame(gameCreateRequest);

        return {ok: gameId};
    }

    async joinGame(newGameId: number, token: TokenData): Promise<Result<JoinNewGameError, undefined>> {

        if (NewGameStore.get().getGameById(newGameId) == undefined)
            return {err: JoinNewGameError.gameNotFound}

        if (!NewGameStore.get().addPLayerToGame(newGameId, token.id))
            return {err: JoinNewGameError.alreadyJoined}

        let newGame = NewGameStore.get().getGameById(newGameId)!;

        if (newGame.players.length >= 4) {

            let gameId = await GameService.get().createGame(newGame);

            console.log("created Game " + gameId);

            EventService.get().updateWaitList(newGameId, gameId);
            NewGameStore.get().removeGame(newGameId);

        } else {
            EventService.get().updateWaitList(newGameId, -1)
        }

        return {ok: undefined};
    }

    leaveGame(gameId: number, token: TokenData): Result<LeaveNewGameError, undefined> {

        const game = NewGameStore.get().getGameById(gameId);

        if (game == undefined) {
            return {err: LeaveNewGameError.gameNotFound}
        }

        const result = NewGameStore.get().removePLayerFromGame(gameId, token.id);

        if (result.err != undefined) {
            return result;
        }

        if (game.players.length <= 0) {
            NewGameStore.get().removeGame(gameId);
        }

        EventService.get().updateWaitList(gameId, -1)

        return {ok: undefined};
    }

    getGame(gameId: number): NewGame | undefined {
        return NewGameStore.get().getGameById(gameId);
    }
}

export enum NewGameCreationError {
    gameNameAlreadyTaken,
    gameTickToShort
}

export enum JoinNewGameError {
    gameNotFound,
    gameFull,
    alreadyJoined,
}

export enum LeaveNewGameError {
    gameNotFound,
    neverJoined,
}