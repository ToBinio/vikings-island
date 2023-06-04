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

            let currentGame = (await GameService.get().getGameById(gameId));

            if (currentGame == undefined) {
                this.stopGame(gameId);
                return
            }

            for (let island of currentGame.islands) {
                if (island.playerId == undefined) continue

                for (let player of currentGame.players) {
                    if (player.playerId != island.playerId) continue

                    player.gold += island.goldPerTick;
                }
            }

            for (let ship of currentGame.ships) {
                if (ship.goal_x == undefined || ship.goal_y == undefined) continue

                if (ship.goal_x == ship.x && ship.goal_y == ship.y) {
                    ship.goal_x = undefined;
                    ship.goal_y = undefined;

                    continue
                }

                let xOff = ship.goal_x - ship.x;
                let yOff = ship.goal_y - ship.y;

                if (Math.abs(xOff) > Math.abs(yOff)) {
                    let change = xOff / Math.abs(xOff);
                    ship.x += change;
                } else {
                    let change = yOff / Math.abs(yOff);
                    ship.y += change;
                }
            }

            await GameService.get().setGameById(currentGame);
            await EventService.get().updateGame(currentGame);
        }, game!.tick * 1000)

        this.games.push({gameId: gameId, interval: interval});
    }

    public stopGame(gameId: number) {
        for (let game of this.games) {
            if (game.gameId == gameId) {
                clearInterval(game.interval)
            }
        }
    }

}

interface GameLoopElement {
    gameId: number
    interval: NodeJS.Timer
}
