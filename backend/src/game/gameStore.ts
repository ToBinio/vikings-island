import {CreateNewGame, NewGame} from "../../../types/games";

export class GameStore {

    static instance: GameStore | undefined;

    static get(): GameStore {
        if (GameStore.instance == undefined) {
            GameStore.instance = new GameStore();
        }

        return GameStore.instance;
    }
}
