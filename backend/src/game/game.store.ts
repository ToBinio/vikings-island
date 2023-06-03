import {Game, GameData, NewGame} from "../../../types/games";
import {db} from "../db/db";

export class GameStore {

    static instance: GameStore | undefined;

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
            .select(["islands.id as island_id", "player_id", "x", "y"])
            .execute()

        for (let island of islandInfo) {
            gameData.islands.push({
                id: island.island_id,
                playerId: island.player_id,
                x: island.x,
                y: island.y,
            })
        }

        return gameData;
    }

    async setGameByID(game: GameData) {

        let promises = []

        for (let player of game.players) {
            promises.push(db.updateTable("players")
                .set({gold: player.gold})
                .where("players.id", "=", player.playerId)
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

    async createGame(newGame: NewGame) {
        let gameResult = await db.insertInto("games")
            .values({name: newGame.name, tick: newGame.tick})
            .returning("games.id")
            .executeTakeFirst()

        let gameId = gameResult!.id;

        let colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00"];

        for (let i = 0; i < newGame.players.length; i++) {
            let player_id = await db.insertInto("players")
                .values({game_id: gameId, color: colors[i], gold: 0, user_id: newGame.players[i]})
                .returning("players.id")
                .executeTakeFirst()

            await db.insertInto("ships")
                .values({game_id: gameId, player_id: player_id!.id, x: getRandomInt(16), y: getRandomInt(16)})
                .execute()
        }

        return gameId
    }

    async deleteGame(gameId: number) {
        await db.deleteFrom("games")
            .where("games.id", "=", gameId)
            .execute()
    }
}

function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}
