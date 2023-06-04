import {Game, GameData, NewGame} from "../../../types/games";
import {db} from "../db/db";
import {ShipMoveRequest} from "../../../types/ship";
import {TokenData} from "../util/token";

export class GameStore {

    static instance: GameStore | undefined;

    static readonly gameSize = 17;

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

    async getPlayerByUser(userId: number, gameId: number): Promise<number | undefined> {
        return (await db.selectFrom('players')
            .where("players.user_id", "=", userId)
            .where("players.game_id", "=", gameId)
            .select(["players.id"])
            .executeTakeFirst())?.id
    }

    async getGameByID(gameId: number): Promise<GameData | undefined> {

        let gameInfo = await db.selectFrom('games')
            .where("games.id", "=", gameId)
            .selectAll()
            .executeTakeFirst()

        if (gameInfo == undefined)
            return undefined

        let gameData: GameData = {
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

                    upgrade_count: ship.max_life,
                })
                .where("ships.id", "=", ship.id)
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

            await db.insertInto("ships")
                .values({
                    game_id: gameId,
                    player_id: player_id!.id,
                    x: getRandomInt(GameStore.gameSize),
                    y: getRandomInt(GameStore.gameSize),

                    ticks_to_move: 5,
                    max_ticks_to_move: 5,

                    life: 100,
                    max_life: 100,

                    damage: 25,

                    upgrade_count: 0
                })
                .execute()

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

        outer: while (islands.length < 6) {

            let x = getRandomInt(GameStore.gameSize - 4) + 2;
            let y = getRandomInt(GameStore.gameSize - 4) + 2;

            for (let island of islands) {
                if (((island.x - x) ** 2 + (island.y - y) ** 2) < 7) {
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

                    life: 200,
                    max_life: 200,
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

    async getShip(shipId: number) {
        return await db.selectFrom("ships")
            .where("ships.id", "=", shipId)
            .selectAll()
            .executeTakeFirst()
    }
}

function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}
