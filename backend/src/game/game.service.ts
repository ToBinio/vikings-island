import {GameData, NewGame} from "../../../types/games";
import {GameStore} from "./game.store";
import {GameLoopService} from "../gameLoop/gameLoop.service";
import {ShipMoveRequest} from "../../../types/ship";
import {TokenData} from "../util/token";

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

    async setGameById(game: GameData) {
        return GameStore.get().setGameByID(game)
    }

    async getSimpleGameById(gameId: number) {
        return GameStore.get().getSimpleGameByID(gameId)
    }

    async getAllSimpleGames() {
        return GameStore.get().getAllSimpleGames()
    }

    async createGame(newGame: NewGame) {
        let gameId = await GameStore.get().createGame(newGame);

        await GameLoopService.get().startGame(gameId);

        return gameId
    }

    async deleteGame(gameId: number) {
        GameLoopService.get().stopGame(gameId);

        await GameStore.get().deleteGame(gameId);
    }

    async startGames() {
        const games = await GameStore.get().getAllGames();

        for (let game of games) {
            GameLoopService.get().startGame(game.id).then();
        }
    }

    async getGameByUser(userId: number) {
        return GameStore.get().getAllGamesFromUser(userId);
    }

    async setShipGoal(req: ShipMoveRequest, token: TokenData) {

        let player = await GameStore.get().getPlayerByUser(token.id, req.gameId);
        if (player == undefined) return SetShipResult.notInGame

        let ship = await GameStore.get().getShip(req.shipId);
        if (ship == undefined) return SetShipResult.shipNotFound

        if (ship.player_id != player) return SetShipResult.notYourShip

        await GameStore.get().setShipGoal(req);
        return undefined
    }
}

export enum SetShipResult {
    notInGame,
    notYourShip,
    shipNotFound,
}
