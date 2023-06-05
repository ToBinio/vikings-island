import {Game, GameData, NewGame} from "../../../types/games";
import {db} from "../db/db";
import {ShipMoveRequest} from "../../../types/ship";
import {GameLoopService} from "../gameLoop/gameLoop.service";

export class GameStore {

    static instance: GameStore | undefined;

    static readonly gameSize = 33;

    static get(): GameStore {
        if (GameStore.instance == undefined) {
            GameStore.instance = new GameStore();
        }

        return GameStore.instance;
    }

    async getAllGames(): Promise<Game[]> {
        return await db.selectFrom('games')
            .selectAll()
            .execute()
    }

    async getAllGamesFromUser(userId: number): Promise<Game[]> {
        return await db.selectFrom('games')
            .innerJoin("players", "players.game_id", "games.id")
            .innerJoin("users", "users.id", "players.user_id")
            .where("users.id", "=", userId)
            .select(["games.id", "games.tick", "games.name"])
            .execute()
    }

    async getPlayerByUser(userId: number, gameId: number) {
        return await db.selectFrom('players')
            .where("players.user_id", "=", userId)
            .where("players.game_id", "=", gameId)
            .selectAll()
            .executeTakeFirst()
    }

    async updatePlayerGold(playerId: number, gold: number) {
        return await db.updateTable('players')
            .where("players.id", "=", playerId)
            .set({gold: gold})
            .execute()
    }

    async getGameByID(gameId: number): Promise<GameData | undefined> {

        let gameInfo = await db.selectFrom('games')
            .where("games.id", "=", gameId)
            .selectAll()
            .executeTakeFirst()

        if (gameInfo == undefined)
            return undefined

        let gameData: GameData = {
            hasWon: undefined,
            id: gameInfo.id,
            name: gameInfo.name,
            tick: gameInfo.tick,
            players: [],
            ships: [],
            islands: []
        };

        let playerInfo = await db.selectFrom('games')
            .innerJoin("players", "players.game_id", "games.id")
            .innerJoin("users", "users.id", "players.user_id")
            .where("games.id", "=", gameId)
            .select(["players.id as player_id", "color", "gold", "user_id"])
            .execute()

        for (let player of playerInfo) {
            gameData.players.push({
                color: player.color,
                gold: player.gold,
                userId: player.user_id,
                playerId: player.player_id
            })
        }

        let shipInfo = await db.selectFrom('games')
            .innerJoin("ships", "ships.game_id", "games.id")
            .where("games.id", "=", gameId)
            .selectAll()
            .select(["ships.id as ship_id"])
            .execute()

        for (let ship of shipInfo) {
            gameData.ships.push({
                id: ship.ship_id,
                playerId: ship.player_id,

                x: ship.x,
                y: ship.y,
                goalX: ship.goal_x,
                goalY: ship.goal_y,

                maxTicksToMove: ship.max_ticks_to_move,
                ticksToMove: ship.ticks_to_move,

                life: ship.life,
                max_life: ship.max_life,

                damage: ship.damage,

                upgrade_count: ship.upgrade_count
            })
        }

        let islandInfo = await db.selectFrom('games')
            .innerJoin("islands", "islands.game_id", "games.id")
            .where("games.id", "=", gameId)
            .selectAll()
            .select(["islands.id as island_id"])
            .execute()

        for (let island of islandInfo) {
            gameData.islands.push({
                id: island.island_id,
                playerId: island.player_id,
                x: island.x,
                y: island.y,
                goldPerTick: island.gold_per_tick,

                damage: island.damage,

                max_life: island.max_life,
                life: island.life,

                upgrade_count: island.upgrade_count
            })
        }

        gameData.hasWon = GameLoopService.get().calcWinner(gameData);

        return gameData;
    }

    //todo write all back
    async setGameByID(game: GameData) {

        let promises = []

        for (let player of game.players) {
            promises.push(db.updateTable("players")
                .set({gold: player.gold})
                .where("players.id", "=", player.playerId)
                .execute())
        }

        for (let ship of game.ships) {
            promises.push(db.updateTable("ships")
                .set({
                    x: ship.x,
                    y: ship.y,
                    goal_x: ship.goalX,
                    goal_y: ship.goalY,

                    ticks_to_move: ship.ticksToMove,
                    max_ticks_to_move: ship.maxTicksToMove,

                    life: ship.life,
                    max_life: ship.max_life,

                    damage: ship.damage,

                    upgrade_count: ship.upgrade_count,
                })
                .where("ships.id", "=", ship.id)
                .execute())
        }

        for (let island of game.islands) {
            promises.push(db.updateTable("islands")
                .set({
                    x: island.x,
                    y: island.y,

                    player_id: island.playerId,

                    life: island.life,
                    max_life: island.max_life,

                    damage: island.damage,

                    upgrade_count: island.upgrade_count,

                    gold_per_tick: island.goldPerTick,
                })
                .where("islands.id", "=", island.id)
                .execute())
        }

        let shipIds = await db.selectFrom("ships")
            .where("game_id", "=", game.id)
            .select(["ships.id"])
            .execute();

        outer: for (let shipId of shipIds) {
            for (let ship of game.ships) {
                if (ship.id == shipId.id) {
                    continue outer
                }
            }

            promises.push(db.deleteFrom("ships")
                .where("ships.id", "=", shipId.id)
                .execute());
        }

        await Promise.all(promises)
    }

    async getSimpleGameByID(gameId: number): Promise<Game | undefined> {
        return db.selectFrom('games')
            .where("games.id", "=", gameId)
            .selectAll()
            .executeTakeFirst()
    }

    async getAllSimpleGames(): Promise<Game[] | undefined> {
        return db.selectFrom('games')
            .selectAll()
            .execute()
    }

    async createGame(newGame: NewGame) {
        let gameResult = await db.insertInto("games")
            .values({name: newGame.name, tick: newGame.tick})
            .returning("games.id")
            .executeTakeFirst()

        let gameId = gameResult!.id;

        let colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00"];
        let positions = [
            {x: Math.floor(GameStore.gameSize / 2), y: 2}, {
                x: Math.floor(GameStore.gameSize / 2),
                y: GameStore.gameSize - 3
            }, {x: 2, y: Math.floor(GameStore.gameSize / 2)}, {
                x: GameStore.gameSize - 3,
                y: Math.floor(GameStore.gameSize / 2)
            }];

        for (let i = 0; i < newGame.players.length; i++) {
            let player_id = await db.insertInto("players")
                .values({game_id: gameId, color: colors[i], gold: 500, user_id: newGame.players[i]})
                .returning("players.id")
                .executeTakeFirst()

            await db.insertInto("islands")
                .values({
                    game_id: gameId,
                    player_id: player_id!.id,

                    x: positions[i].x,
                    y: positions[i].y,

                    gold_per_tick: 5,

                    life: 200,
                    max_life: 200,
                    damage: 10,

                    upgrade_count: 0
                })
                .execute()
        }

        let islands = []

        outer: while (islands.length < 10) {

            let x = getRandomInt(GameStore.gameSize - 4) + 2;
            let y = getRandomInt(GameStore.gameSize - 4) + 2;

            for (let island of islands) {
                if (((island.x - x) ** 2 + (island.y - y) ** 2) < 10) {
                    continue outer
                }
            }

            await db.insertInto("islands")
                .values({
                    game_id: gameId,
                    player_id: undefined,

                    x: x,
                    y: y,

                    gold_per_tick: 5,

                    life: 100,
                    max_life: 100,
                    damage: 10,

                    upgrade_count: 0
                })
                .execute()

            islands.push({x: x, y: y})
        }

        return gameId
    }

    async deleteGame(gameId: number) {
        await db.deleteFrom("games")
            .where("games.id", "=", gameId)
            .execute()
    }

    async setShipGoal(req: ShipMoveRequest) {
        await db.updateTable("ships")
            .set({goal_x: req.goalX, goal_y: req.goalY})
            .where("ships.id", "=", req.shipId)
            .execute()
    }

    async upgradeShipSpeed(shipId: number, newSpeed: number, newUpgradeCount: number) {
        await db.updateTable("ships")
            .set({max_ticks_to_move: newSpeed, upgrade_count: newUpgradeCount})
            .where("ships.id", "=", shipId)
            .execute()

        await db.updateTable("ships")
            .set({ticks_to_move: newSpeed})
            .where("ships.id", "=", shipId)
            .where("ships.ticks_to_move", ">", newSpeed)
            .execute()
    }

    async upgradeShipLife(shipId: number, newLife: number, newUpgradeCount: number) {
        await db.updateTable("ships")
            .set({max_life: newLife, upgrade_count: newUpgradeCount})
            .where("ships.id", "=", shipId)
            .execute()
    }

    async upgradeShipDamage(shipId: number, newDamage: number, newUpgradeCount: number) {
        await db.updateTable("ships")
            .set({damage: newDamage, upgrade_count: newUpgradeCount})
            .where("ships.id", "=", shipId)
            .execute()
    }

    async upgradeShipHeal(shipId: number, maxLife: number, newUpgradeCount: number) {
        await db.updateTable("ships")
            .set({life: maxLife, upgrade_count: newUpgradeCount})
            .where("ships.id", "=", shipId)
            .execute()
    }

    async upgradeIslandGold(islandId: number, maxGold: number, newUpgradeCount: number) {
        await db.updateTable("islands")
            .set({gold_per_tick: maxGold, upgrade_count: newUpgradeCount})
            .where("islands.id", "=", islandId)
            .execute()
    }

    async upgradeIslandLife(islandId: number, maxLife: number, newUpgradeCount: number) {
        await db.updateTable("islands")
            .set({max_life: maxLife, upgrade_count: newUpgradeCount})
            .where("islands.id", "=", islandId)
            .execute()
    }

    async upgradeIslandDamage(islandId: number, maxDamage: number, newUpgradeCount: number) {
        await db.updateTable("islands")
            .set({damage: maxDamage, upgrade_count: newUpgradeCount})
            .where("islands.id", "=", islandId)
            .execute()
    }

    async upgradeIslandHeal(islandId: number, maxLife: number, newUpgradeCount: number) {
        await db.updateTable("islands")
            .set({life: maxLife, upgrade_count: newUpgradeCount})
            .where("islands.id", "=", islandId)
            .execute()
    }

    async getShip(shipId: number) {
        return await db.selectFrom("ships")
            .where("ships.id", "=", shipId)
            .selectAll()
            .executeTakeFirst()
    }

    async getShips(gameId: number) {
        return await db.selectFrom("ships")
            .where("game_id", "=", gameId)
            .selectAll()
            .execute()
    }

    async getIsland(islandId: number) {
        return await db.selectFrom("islands")
            .where("islands.id", "=", islandId)
            .selectAll()
            .executeTakeFirst()
    }

    async spawnShip(gameId: number, playerId: number, x: number, y: number) {
        await db.insertInto("ships")
            .values({
                game_id: gameId,
                player_id: playerId,
                x: x,
                y: y,

                ticks_to_move: 5,
                max_ticks_to_move: 5,

                life: 100,
                max_life: 100,

                damage: 25,

                upgrade_count: 0
            })
            .execute()
    }
}

function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}
