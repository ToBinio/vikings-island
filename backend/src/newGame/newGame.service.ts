import {GameCreateRequest, GameInfo} from "../../../types/games";
import {NewGameStore} from "./newGameStore";
import {TokenData} from "../util/token";

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

    getAllGames(): GameInfo[] {
        return NewGameStore.get().getAllGames();
    }

    createGame(gameCreateRequest: GameCreateRequest, token: TokenData): number {
        let gameId = NewGameStore.get().createGame(gameCreateRequest);

        NewGameStore.get().addPLayerToGame(gameId, token.id);

        return gameId;
    }
}