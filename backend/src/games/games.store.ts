import {GameCreateRequest, GameInfo} from "../../../types/games";
import {GamesService} from "./games.service";

export class GamesStore {

    static instance: GamesStore | undefined;

    static get(): GamesStore {
        if (GamesStore.instance == undefined) {
            GamesStore.instance = new GamesStore();
        }

        return GamesStore.instance;
    }

    private constructor() {
    }
    
    games: GameInfo[] = []

    idCount = 0;

    getAllGames(): GameInfo[] {
        return this.games;
    }

    createGame(gameCreateRequest: GameCreateRequest): number {

        let gameInfo: GameInfo = {
            id: ++this.idCount,
            players: [],
            name: gameCreateRequest.name,
            timestamp: gameCreateRequest.timeStamp
        }
        this.games.push(gameInfo)

        return this.idCount;
    }


    // false -> game could NOT be found
    // true  -> game could be found
    addPLayerToGame(gameId: number, playerId: number): boolean {
        const gameInfo = this.getGameById(gameId);

        if (gameInfo == undefined)
            return false

        gameInfo.players.push(playerId);

        return true;
    }

    getGameById(gameId: number): GameInfo | undefined {
        for (let game of this.games) {
            if (game.id == gameId)
                return game
        }

        return undefined
    }
}
