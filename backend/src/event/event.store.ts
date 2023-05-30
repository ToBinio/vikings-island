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

    loginEvents = new Map<string, LoginEventData>;

    addLobbyEvent(data: LoginEventData): string {
        let uuid = uuidv4();

        this.loginEvents.set(uuid, data);

        return uuid
    }

    removeLobbyEvent(uuid: string) {
        this.loginEvents.delete(uuid);
    }

    getLoginEventData(userId: number, gameId: number): LoginEventData | undefined {
        for (let value of this.loginEvents.values()) {
            if (value.game == gameId && value.token.id == userId) {
                return value
            }
        }

        return undefined
    }
}

export interface LoginEventData {
    res: Response<any, Record<string, any>, number>,
    token: TokenData,
    game: number
}
