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
    gameListeners = new Map<string, GameListenerData>;

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
            if (value.newGame == gameId && value.token.id == userId) {
                return value
            }
        }

        return undefined
    }

    addGameEvent(data: GameListenerData): string {
        let uuid = uuidv4();

        this.gameListeners.set(uuid, data);

        return uuid
    }

    removeGameEvent(uuid: string) {
        this.gameListeners.delete(uuid);
    }

    getGameListenerData(userId: number, gameId: number): GameListenerData | undefined {
        for (let value of this.gameListeners.values()) {
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
    newGame: number
}

export interface GameListenerData {
    res: Response<any, Record<string, any>, number>,
    token: TokenData,
    game: number
}