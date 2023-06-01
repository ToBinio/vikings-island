import {NewGame} from "../../../types/games";
import {GameStore} from "./gameStore";

export class GameService {

    static instance: GameService | undefined;

    static get(): GameService {
        if (GameService.instance == undefined) {
            GameService.instance = new GameService();
        }

        return GameService.instance;
    }

    async getGameById(gameId: number) {
        return GameStore.get().getGameByID(gameId)
    }

    async createGame(newGame: NewGame) {
        return GameStore.get().createGame(newGame);
    }
}
