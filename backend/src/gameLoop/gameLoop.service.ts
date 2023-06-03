import {GameService} from "../game/game.service";
import {EventService} from "../event/event.service";
import {GameStore} from "../game/game.store";

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

        let interval = setInterval(async () => {
            console.log("update Game: " + game!.id + " - " + game!.name);

            let currentGame = (await GameService.get().getGameById(gameId))!;

            for (let player of currentGame.players) {
                player.gold += player.playerId;
            }

            await GameService.get().setGameById(currentGame);
            await EventService.get().updateGame(currentGame);
        }, game!.tick * 1000)

        this.games.push({gameId: gameId, interval: interval});
    }

}

interface GameLoopElement {
    gameId: number
    interval: NodeJS.Timer
}