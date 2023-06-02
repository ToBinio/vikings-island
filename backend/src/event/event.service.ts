import {EventStore, GameListenerData, WaitListListenerData} from "./event.store";
import {NewGameStore} from "../newGame/newGame.store";
import {WaitListEvent} from "../../../types/waitList";
import {GameStore} from "../game/game.store";
import {GameData} from "../../../types/games";

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
            let loginEventData = EventStore.get().getWaitListListenerData(player, newGameId);

            if (loginEventData == undefined) continue

            loginEventData.res.write(`data: ${dataString}\n\n`);
        }
    }

    addGameEvent(data: GameListenerData): string {
        return EventStore.get().addGameEvent(data)
    }

    removeGameEvent(uuid: string) {
        EventStore.get().removeGameEvent(uuid);
    }

    async updateGame(game: GameData) {
        let dataString = JSON.stringify(game);

        for (let player of game!.players) {
            let loginEventData = EventStore.get().getGameListenerData(player.userId, game.id);

            if (loginEventData == undefined) continue

            loginEventData.res.write(`data: ${dataString}\n\n`);
        }
    }
}