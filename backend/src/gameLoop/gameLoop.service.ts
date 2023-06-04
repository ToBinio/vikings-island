import {GameService} from "../game/game.service";
import {EventService} from "../event/event.service";
import {GameStore} from "../game/game.store";
import {getRandomValues} from "crypto";

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

                let badNeighbours = [];

                for (let otherShip of currentGame.ships) {
                    if (otherShip.playerId == ship.playerId) continue

                    if (Math.abs(otherShip.x - ship.x) <= 1 || Math.abs(otherShip.y - ship.y) <= 1) {
                        badNeighbours.push(otherShip)
                    }
                }

                if (badNeighbours) {
                    let neighbourToAttack = badNeighbours[Math.floor(Math.random() * badNeighbours.length)];
                    neighbourToAttack.life -= ship.damage;
                } else {
                    if (ship.goalX == undefined || ship.goalY == undefined) continue

                    if (ship.goalX == ship.x && ship.goalY == ship.y) {
                        ship.goalX = undefined;
                        ship.goalY = undefined;

                        continue
                    }

                    ship.ticksToMove--;

                    if (ship.ticksToMove >= 0) continue

                    let xOff = ship.goalX - ship.x;
                    let yOff = ship.goalY - ship.y;

                    if (Math.abs(xOff) > Math.abs(yOff)) {
                        let change = xOff / Math.abs(xOff);
                        ship.x += change;
                    } else {
                        let change = yOff / Math.abs(yOff);
                        ship.y += change;
                    }

                    ship.ticksToMove = ship.maxTicksToMove;
                }
            }

            for (let i = currentGame.ships.length - 1; i >= 0; i--) {

                let ship = currentGame.ships[i];

                if (ship.life <= 0) {
                    currentGame.ships.splice(i, 1);
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
