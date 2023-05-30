import {GameCreateRequest, GameInfo} from "../../../types/games";
import {GamesStore} from "./games.store";
import {TokenData} from "../util/token";

export class GamesService {

    static instance: GamesService | undefined;

    static get(): GamesService {
        if (GamesService.instance == undefined) {
            GamesService.instance = new GamesService();
        }

        return GamesService.instance;
    }

    private constructor() {
    }

    getAllGames(): GameInfo[] {
        return GamesStore.get().getAllGames();
    }

    createGame(gameCreateRequest: GameCreateRequest, token: TokenData): number {
        let gameId = GamesStore.get().createGame(gameCreateRequest);

        GamesStore.get().addPLayerToGame(gameId, token.id);

        return gameId;
    }
}