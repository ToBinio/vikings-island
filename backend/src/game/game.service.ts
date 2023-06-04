import {GameData, NewGame} from "../../../types/games";
import {GameStore} from "./game.store";
import {GameLoopService} from "../gameLoop/gameLoop.service";
import {ShipMoveRequest, ShipSpawnRequest} from "../../../types/ship";
import {TokenData} from "../util/token";
import {EventService} from "../event/event.service";

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
        await EventService.get().updateGame((await GameStore.get().getGameByID(req.gameId))!);
        return undefined
    }

    async spawnShip(req: ShipSpawnRequest, token: TokenData) {
        let player = await GameStore.get().getPlayerByUser(token.id, req.gameId);
        if (player == undefined) return SpawnShipResult.notInGame

        let island = await GameStore.get().getIsland(req.islandId);
        if (island == undefined) return SpawnShipResult.islandNotFound

        if (island.player_id != player) return SpawnShipResult.notYourIsland

        let validSpaces = [];

        let ships = await GameStore.get().getShips(req.gameId);

        for (let x = -1; x < 2; x++) {
            outer: for (let y = -1; y < 2; y++) {
                if (x == 0 && y == 0) continue

                for (let ship of ships) {
                    if (ship.x == x && ship.y == y) continue outer
                }

                validSpaces.push({x: x, y: y})
            }
        }

        if (validSpaces.length == 0) return SpawnShipResult.noSpace

        let validSpace = validSpaces[Math.floor(Math.random() * validSpaces.length)];

        await GameStore.get().spawnShip(req.gameId, player, validSpace.x, validSpace.y);

        await EventService.get().updateGame((await GameStore.get().getGameByID(req.gameId))!);
        return undefined
    }
}

export enum SetShipResult {
    notInGame,
    notYourShip,
    shipNotFound,
}

export enum SpawnShipResult {
    notInGame,
    notYourIsland,
    islandNotFound,
    noSpace
}
