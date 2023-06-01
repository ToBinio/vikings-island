import {CreateNewGame, NewGame} from "../../../types/games";
import {GameStore} from "./gameStore";
import {TokenData} from "../util/token";
import {Result} from "../../../types/util";
import {EventService} from "../event/event.service";

export class GameService {

    static instance: GameService | undefined;

    static get(): GameService {
        if (GameService.instance == undefined) {
            GameService.instance = new GameService();
        }

        return GameService.instance;
    }
}
