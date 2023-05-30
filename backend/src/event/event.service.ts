import {CreateNewGame, NewGame} from "../../../types/games";
import {EventStore, LoginEventData} from "./event.store";
import {TokenData} from "../util/token";
import {Result} from "../../../types/util";
import {v4 as uuidv4} from 'uuid';
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

    addLobbyEvent(data: LoginEventData): string {
        return EventStore.get().addLobbyEvent(data)
    }

    removeLobbyEvent(uuid: string) {
        EventStore.get().removeLobbyEvent(uuid);
    }

    updateLobby(gameId: number) {
        let game = NewGameStore.get().getGameById(gameId)!;

        let data = JSON.stringify(game.players);

        for (let player of game.players) {
            let loginEventData = EventStore.get().getLoginEventData(player, gameId)!;

            loginEventData.res.write(`data: ${data}\n\n`);
        }
    }
}