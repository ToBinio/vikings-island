import {CreateNewGame, NewGame} from "../../../types/games";

export class NewGameStore {

    static instance: NewGameStore | undefined;

    static get(): NewGameStore {
        if (NewGameStore.instance == undefined) {
            NewGameStore.instance = new NewGameStore();
        }

        return NewGameStore.instance;
    }

    private constructor() {
    }

    games: NewGame[] = []

    idCount = 0;

    getAllGames(): NewGame[] {
        return this.games;
    }

    createGame(gameCreateRequest: CreateNewGame): number {

        let gameInfo: NewGame = {
            id: ++this.idCount,
            players: [],
            name: gameCreateRequest.name,
            tick: gameCreateRequest.timeStamp
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

    getGameById(gameId: number): NewGame | undefined {
        for (let game of this.games) {
            if (game.id == gameId)
                return game
        }

        return undefined
    }

    getGameByName(name: string): NewGame | undefined {
        for (let game of this.games) {
            if (game.name == name)
                return game
        }

        return undefined
    }
}
