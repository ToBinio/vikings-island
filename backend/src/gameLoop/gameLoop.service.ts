import {GameService} from "../game/game.service";
import {EventService} from "../event/event.service";
import {GameData} from "../../../types/games";

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

            ships: for (let ship of currentGame.ships) {

                let badShipNeighbours = [];

                for (let otherShip of currentGame.ships) {
                    if (otherShip.playerId == ship.playerId) continue

                    if (Math.abs(otherShip.x - ship.x) <= 1 && Math.abs(otherShip.y - ship.y) <= 1) {
                        badShipNeighbours.push(otherShip)
                    }
                }

                let badIslandNeighbours = [];

                for (let otherIsland of currentGame.islands) {
                    if (otherIsland.playerId == ship.playerId) continue

                    if (Math.abs(otherIsland.x - ship.x) <= 1 && Math.abs(otherIsland.y - ship.y) <= 1) {
                        badIslandNeighbours.push(otherIsland)
                    }
                }

                if (badShipNeighbours.length != 0) {
                    let neighbourToAttack = badShipNeighbours[Math.floor(Math.random() * badShipNeighbours.length)];
                    neighbourToAttack.life -= ship.damage;
                } else if (badIslandNeighbours.length != 0) {
                    let neighbourToAttack = badIslandNeighbours[Math.floor(Math.random() * badIslandNeighbours.length)];
                    neighbourToAttack.life -= ship.damage;
                } else {
                    if (ship.goalX == undefined || ship.goalY == undefined) continue

                    if (ship.goalX == ship.x && ship.goalY == ship.y) {
                        ship.goalX = undefined;
                        ship.goalY = undefined;

                        continue
                    }

                    ship.ticksToMove--;

                    if (ship.ticksToMove > 0) continue

                    let xOff = ship.goalX - ship.x;
                    let yOff = ship.goalY - ship.y;

                    let newX = ship.x;
                    let newY = ship.y;

                    if (Math.abs(xOff) > Math.abs(yOff)) {
                        newX += xOff / Math.abs(xOff);
                    } else {
                        newY += yOff / Math.abs(yOff);
                    }

                    for (let otherShip of currentGame.ships) {
                        if (otherShip.id != ship.id && otherShip.x == newX && otherShip.y == newY) {
                            continue ships;
                        }
                    }

                    for (let otherIsland of currentGame.islands) {
                        if (otherIsland.x == newX && otherIsland.y == newY) {
                            continue ships;
                        }
                    }

                    ship.x = newX;
                    ship.y = newY;

                    ship.ticksToMove = ship.maxTicksToMove;
                }
            }

            for (let island of currentGame.islands) {
                if (island.life <= 0) {
                    let shipNeighbours = [];

                    for (let otherShip of currentGame.ships) {
                        if (Math.abs(otherShip.x - island.x) <= 1 && Math.abs(otherShip.y - island.y) <= 1) {
                            shipNeighbours.push(otherShip)
                        }
                    }

                    let captureShip = shipNeighbours[Math.floor(Math.random() * shipNeighbours.length)];

                    island.playerId = captureShip.playerId;

                    island.life = island.max_life
                } else if (island.playerId != undefined) {
                    let shipNeighbours = [];

                    for (let otherShip of currentGame.ships) {
                        if (Math.abs(otherShip.x - island.x) <= 1 && Math.abs(otherShip.y - island.y) <= 1) {
                            if (otherShip.playerId != island.playerId) {
                                shipNeighbours.push(otherShip)
                            }
                        }
                    }

                    if (shipNeighbours.length > 0) {
                        let shipToDamage = shipNeighbours[Math.floor(Math.random() * shipNeighbours.length)];

                        shipToDamage.life -= island.damage;
                    }
                }
            }

            for (let i = currentGame.ships.length - 1; i >= 0; i--) {
                let ship = currentGame.ships[i];

                if (ship.life <= 0) {
                    currentGame.ships.splice(i, 1);
                }
            }

            currentGame.hasWon = GameLoopService.get().calcWinner(currentGame);

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

    public calcWinner(gameData: GameData): number | undefined {
        let currentWinner = undefined;

        for (let island of gameData.islands) {

            if (island.playerId == undefined) continue

            if (currentWinner == undefined) {
                currentWinner = island.playerId;
            } else {
                if (currentWinner != island.playerId) {
                    return undefined
                }
            }
        }
        
        return currentWinner;
    }
}

interface GameLoopElement {
    gameId: number
    interval: NodeJS.Timer
}
