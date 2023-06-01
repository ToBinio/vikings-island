import {CreateNewGame, NewGame} from "../../../types/games";
import {EventStore, LoginEventData} from "./event.store";
import {TokenData} from "../util/token";
import {Result} from "../../../types/util";
import {Response} from "express-serve-static-core";
import {NewGameStore} from "../newGame/newGameStore";
import {getSystemErrorMap} from "util";

export class EventService {

    static instance: EventService | undefined;

    static get(): EventService {
        if (EventService.instance == undefined) {
            EventService.instance = new EventService();
        }

        return EventService.instance;
    }

    addWaitListEvent(data: WaitListListenerData): string {
        return EventStore.get().addWaitListEvent(data)
    }

    removeWaitListEvent(uuid: string) {
        EventStore.get().removeWaitListEvent(uuid);
    }

    updateWaitList(newGameId: number, hasStarted: boolean) {
        let game = NewGameStore.get().getGameById(newGameId)!;

        let data: WaitListEvent = {players: game.players, hasStarted: hasStarted};
        let dataString = JSON.stringify(data);

        for (let player of game.players) {
            let loginEventData = EventStore.get().getWaitListListenerData(player, gameId);

            if (loginEventData == undefined) continue

            loginEventData.res.write(`data: ${dataString}\n\n`);
        }
    }
}