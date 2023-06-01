import {CreateNewGame, NewGame} from "../../../types/games";
import {v4 as uuidv4} from "uuid";
import {Response} from "express-serve-static-core";
import {TokenData} from "../util/token";

export class EventStore {

    static instance: EventStore | undefined;

    static get(): EventStore {
        if (EventStore.instance == undefined) {
            EventStore.instance = new EventStore();
        }

        return EventStore.instance;
    }

    waitListListeners = new Map<string, WaitListListenerData>;

    addWaitListEvent(data: WaitListListenerData): string {
        let uuid = uuidv4();

        this.waitListListeners.set(uuid, data);

        return uuid
    }

    removeWaitListEvent(uuid: string) {
        this.waitListListeners.delete(uuid);
    }

    getWaitListListenerData(userId: number, gameId: number): WaitListListenerData | undefined {
        for (let value of this.waitListListeners.values()) {
            if (value.game == gameId && value.token.id == userId) {
                return value
            }
        }

        return undefined
    }
}

export interface WaitListListenerData {
    res: Response<any, Record<string, any>, number>,
    token: TokenData,
    game: number
}
