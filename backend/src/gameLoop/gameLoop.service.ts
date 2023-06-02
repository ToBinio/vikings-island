import {GameService} from "../game/game.service";
import {EventService} from "../event/event.service";

export class GameLoopService {

    static instance: GameLoopService | undefined;

    static get(): GameLoopService {
        if (GameLoopService.instance == undefined) {
            GameLoopService.instance = new GameLoopService();
        }

        return GameLoopService.instance;
    }

    games: GameLoopElement[] = []

    public async startGame(gameId: number) {

        for (let game of this.games) {
            if (game.gameId == gameId) {
                return
            }
        }

        const game = await GameService.get().getSimpleGameById(gameId);

        if (game == undefined) return

        console.log("starting Game: " + game!.id + " - " + game!.name);

        let interval = setInterval(() => {
            console.log("update Game: " + game!.id + " - " + game!.name);
            EventService.get().updateGame(gameId);
        }, game!.tick * 1000)

        this.games.push({gameId: gameId, interval: interval});
    }

}

interface GameLoopElement {
    gameId: number
    interval: NodeJS.Timer
}
