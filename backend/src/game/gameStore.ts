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

    async getAllGamesFromUser(user_id: number): Promise<Game[]> {
        return await db.selectFrom('games')
            .innerJoin("players", "players.game_id", "games.id")
            .innerJoin("users", "users.id", "players.user_id")
            .where("users.id", "=", user_id)
            .select(["games.id", "games.tick", "games.name"])
            .execute()
    }

    async getGameByID(gameId: number): Promise<GameData | undefined> {
        let game = await db.selectFrom('games')
            .innerJoin("players", "players.game_id", "games.id")
            .innerJoin("users", "users.id", "players.user_id")
            .where("games.id", "=", gameId)
            .selectAll()
            .execute()

        if (game.length == 0)
            return undefined

        let gameData: GameData = {
            id: game[0]!.game_id,
            name: game[0]!.name,
            tick: game[0]!.tick,
            players: []
        };

        for (let gameElement of game) {
            gameData.players.push({color: gameElement.color, gold: gameElement.gold, userId: gameElement.user_id})
        }

        return gameData;
    }

    async createGame(newGame: NewGame) {
        let gameResult = await db.insertInto("games")
            .values({name: newGame.name, tick: newGame.tick})
            .returning("games.id")
            .executeTakeFirst()

        let gameId = gameResult!.id;


        let colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00"];

        for (let i = 0; i < newGame.players.length; i++) {
            await db.insertInto("players")
                .values({game_id: gameId, color: colors[i], gold: 0, user_id: newGame.players[i]})
                .execute()
        }
    }
}
