import {GameData, NewGame} from "../../../types/games";
import {GameStore} from "./game.store";
import {GameLoopService} from "../gameLoop/gameLoop.service";
import {ShipMoveRequest, ShipSpawnRequest, ShipUpgradeRequest} from "../../../types/ship";
import {TokenData} from "../util/token";
import {EventService} from "../event/event.service";
import {IslandUpgradeRequest} from "../../../types/island";

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

        if (ship.player_id != player.id) return SetShipResult.notYourShip

        if (req.goalX < 0 || req.goalX > GameStore.gameSize - 1 || req.goalY < 0 || req.goalY > GameStore.gameSize - 1) return SetShipResult.locationNotInGame

        await GameStore.get().setShipGoal(req);
        await EventService.get().updateGame((await GameStore.get().getGameByID(req.gameId))!);
        return undefined
    }

    async spawnShip(req: ShipSpawnRequest, token: TokenData) {
        let player = await GameStore.get().getPlayerByUser(token.id, req.gameId);
        if (player == undefined) return SpawnShipResult.notInGame

        let island = await GameStore.get().getIsland(req.islandId);
        if (island == undefined) return SpawnShipResult.islandNotFound

        if (island.player_id != player.id) return SpawnShipResult.notYourIsland

        let validSpaces = [];

        let ships = await GameStore.get().getShips(req.gameId);

        for (let x = -1; x < 2; x++) {
            outer: for (let y = -1; y < 2; y++) {
                if (x == 0 && y == 0) continue

                for (let ship of ships) {
                    if (ship.x == island.x + x && ship.y == island.y + y) continue outer
                }

                validSpaces.push({x: island.x + x, y: island.y + y})
            }
        }

        if (validSpaces.length == 0) return SpawnShipResult.noSpace

        let validSpace = validSpaces[Math.floor(Math.random() * validSpaces.length)];

        let newPlayer = await GameStore.get().getPlayerByUser(token.id, req.gameId);
        if (newPlayer!.gold < 250) return SpawnShipResult.noGold

        await GameStore.get().updatePlayerGold(newPlayer!.id, newPlayer!.gold - 250);

        await GameStore.get().spawnShip(req.gameId, player.id, validSpace.x, validSpace.y);

        await EventService.get().updateGame((await GameStore.get().getGameByID(req.gameId))!);
        return undefined
    }

    async upgradeShipSpeed(req: ShipUpgradeRequest, token: TokenData) {

        const ship = await this.handleShipUpgrade(req, token);
        if (typeof ship != "object") return

        if (ship.max_ticks_to_move <= 1) return UpgradeShipResult.maxUpgrade

        await GameStore.get().upgradeShipSpeed(ship.id, ship.max_ticks_to_move - 1, ship.upgrade_count + 1);
        await EventService.get().updateGame((await GameStore.get().getGameByID(req.gameId))!);
        return undefined
    }

    async upgradeShipLife(req: ShipUpgradeRequest, token: TokenData) {

        const ship = await this.handleShipUpgrade(req, token);
        if (typeof ship != "object") return

        await GameStore.get().upgradeShipLife(ship.id, ship.max_life + 50, ship.upgrade_count + 1);
        await EventService.get().updateGame((await GameStore.get().getGameByID(req.gameId))!);
        return undefined
    }

    async upgradeShipDamage(req: ShipUpgradeRequest, token: TokenData) {

        const ship = await this.handleShipUpgrade(req, token);
        if (typeof ship != "object") return

        await GameStore.get().upgradeShipDamage(ship.id, ship.damage + 5, ship.upgrade_count + 1);
        await EventService.get().updateGame((await GameStore.get().getGameByID(req.gameId))!);
        return undefined
    }

    async upgradeShipHeal(req: ShipUpgradeRequest, token: TokenData) {

        const ship = await this.handleShipUpgrade(req, token);
        if (typeof ship != "object") return

        await GameStore.get().upgradeShipHeal(ship.id, ship.max_life, ship.upgrade_count + 1);
        await EventService.get().updateGame((await GameStore.get().getGameByID(req.gameId))!);
        return undefined
    }

    async upgradeIslandGold(req: IslandUpgradeRequest, token: TokenData) {

        const island = await this.handleIslandUpgrade(req, token);
        if (typeof island != "object") return

        await GameStore.get().upgradeIslandGold(island.id, island.gold_per_tick + 5, island.upgrade_count + 1);
        await EventService.get().updateGame((await GameStore.get().getGameByID(req.gameId))!);
        return undefined
    }

    async upgradeIslandLife(req: IslandUpgradeRequest, token: TokenData) {

        const island = await this.handleIslandUpgrade(req, token);
        if (typeof island != "object") return

        await GameStore.get().upgradeIslandLife(island.id, island.max_life + 50, island.upgrade_count + 1);
        await EventService.get().updateGame((await GameStore.get().getGameByID(req.gameId))!);
        return undefined
    }

    async upgradeIslandDamage(req: IslandUpgradeRequest, token: TokenData) {

        const island = await this.handleIslandUpgrade(req, token);
        if (typeof island != "object") return

        await GameStore.get().upgradeIslandDamage(island.id, island.damage + 5, island.upgrade_count + 1);
        await EventService.get().updateGame((await GameStore.get().getGameByID(req.gameId))!);
        return undefined
    }

    async upgradeIslandHeal(req: IslandUpgradeRequest, token: TokenData) {

        const island = await this.handleIslandUpgrade(req, token);
        if (typeof island != "object") return

        await GameStore.get().upgradeIslandHeal(island.id, island.max_life, island.upgrade_count + 1);
        await EventService.get().updateGame((await GameStore.get().getGameByID(req.gameId))!);
        return undefined
    }

    async handleShipUpgrade(req: ShipUpgradeRequest, token: TokenData) {
        let player = await GameStore.get().getPlayerByUser(token.id, req.gameId);
        if (player == undefined) return UpgradeShipResult.notInGame

        let ship = await GameStore.get().getShip(req.shipId);
        if (ship == undefined) return UpgradeShipResult.shipNotFound

        if (ship.player_id != player.id) return UpgradeShipResult.notYourShip

        let newPlayer = await GameStore.get().getPlayerByUser(token.id, req.gameId);

        let cost = (250 + 250 * ship.upgrade_count);

        if (newPlayer!.gold < cost) return UpgradeShipResult.noGold

        await GameStore.get().updatePlayerGold(newPlayer!.id, newPlayer!.gold - cost);

        return ship;
    }

    async handleIslandUpgrade(req: IslandUpgradeRequest, token: TokenData) {
        let player = await GameStore.get().getPlayerByUser(token.id, req.gameId);
        if (player == undefined) return UpgradeIslandResult.notInGame

        let island = await GameStore.get().getIsland(req.islandId);
        if (island == undefined) return UpgradeIslandResult.islandNotFound

        if (island.player_id != player.id) return UpgradeIslandResult.notYourIsland

        let newPlayer = await GameStore.get().getPlayerByUser(token.id, req.gameId);

        let cost = (250 + 250 * island.upgrade_count);

        if (newPlayer!.gold < cost) return UpgradeIslandResult.noGold

        await GameStore.get().updatePlayerGold(newPlayer!.id, newPlayer!.gold - cost);

        return island;
    }

}

export enum SetShipResult {
    notInGame,
    notYourShip,
    shipNotFound,
    locationNotInGame
}

export enum SpawnShipResult {
    notInGame,
    notYourIsland,
    islandNotFound,
    noSpace,
    noGold
}

export enum UpgradeShipResult {
    notInGame,
    notYourShip,
    shipNotFound,
    noGold,
    maxUpgrade
}

export enum UpgradeIslandResult {
    notInGame,
    notYourIsland,
    islandNotFound,
    noGold,
    maxUpgrade
}
