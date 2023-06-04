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
            .select(["ships.id as ship_id", "player_id", "x", "y", "goal_x", "goal_y"])
            .execute()

        for (let ship of shipInfo) {
            gameData.ships.push({
                id: ship.ship_id,
                playerId: ship.player_id,
                x: ship.x,
                y: ship.y,
                goal_x: ship.goal_x,
                goal_y: ship.goal_y,
            })
        }

        let islandInfo = await db.selectFrom('games')
            .innerJoin("islands", "islands.game_id", "games.id")
            .where("games.id", "=", gameId)
            .select(["islands.id as island_id", "player_id", "x", "y", "gold_per_tick"])
            .execute()

        for (let island of islandInfo) {
            gameData.islands.push({
                id: island.island_id,
                playerId: island.player_id,
                x: island.x,
                y: island.y,
                goldPerTick: island.gold_per_tick
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
                .set({x: ship.x, y: ship.y, goal_x: ship.goal_x, goal_y: ship.goal_y})
                .where("ships.id", "=", ship.id)
                .execute())
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

    //todo no islands on same spot!
    async createGame(newGame: NewGame) {
        let gameResult = await db.insertInto("games")
            .values({name: newGame.name, tick: newGame.tick})
            .returning("games.id")
            .executeTakeFirst()

        let gameId = gameResult!.id;

        let colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00"];
        let positions = [{x: Math.floor(GameStore.gameSize / 2), y: 1}, {
            x: Math.floor(GameStore.gameSize / 2),
            y: GameStore.gameSize - 2
        }, {x: 1, y: Math.floor(GameStore.gameSize / 2)}, {
            x: GameStore.gameSize - 2,
            y: Math.floor(GameStore.gameSize / 2)
        }];

        for (let i = 0; i < newGame.players.length; i++) {
            let player_id = await db.insertInto("players")
                .values({game_id: gameId, color: colors[i], gold: 0, user_id: newGame.players[i]})
                .returning("players.id")
                .executeTakeFirst()

            await db.insertInto("ships")
                .values({
                    game_id: gameId,
                    player_id: player_id!.id,
                    x: getRandomInt(GameStore.gameSize),
                    y: getRandomInt(GameStore.gameSize)
                })
                .execute()

            await db.insertInto("islands")
                .values({
                    game_id: gameId,
                    player_id: player_id!.id,
                    x: positions[i].x,
                    y: positions[i].y,
                    gold_per_tick: 5
                })
                .execute()
        }

        for (let i = 0; i < 10; i++) {
            await db.insertInto("islands")
                .values({
                    game_id: gameId,
                    player_id: undefined,
                    x: getRandomInt(GameStore.gameSize),
                    y: getRandomInt(GameStore.gameSize),
                    gold_per_tick: 5
                })
                .execute()
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
