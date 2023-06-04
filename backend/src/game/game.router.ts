import {Router} from "express";
import {verifyRequest} from "../util/token";
import {GameService, SetShipResult, SpawnShipResult} from "./game.service";
import {UserService} from "../user/user.service";
import {ShipMoveRequest, ShipSpawnRequest} from "../../../types/ship";
import {JoinNewGameError} from "../newGame/newGame.service";

export function getGamesRouter(): Router {
    let router = Router();

    router.get("/", async (req, res) => {

        let token = await verifyRequest(req.headers.authorization, res, false);

        if (token == undefined) {
            return
        }

        let games = await GameService.get().getGameByUser(token.id);

        res.status(200).json(games);

        res.end();
    })

    router.get("/all", async (req, res) => {

        let token = await verifyRequest(req.headers.authorization, res, false);

        if (token == undefined) {
            return
        }

        let games = await GameService.get().getAllSimpleGames();

        res.status(200).json(games);

        res.end();
    })

    router.get("/:id", async (req, res) => {

        let token = await verifyRequest(req.headers.authorization, res, false);

        if (token == undefined) {
            return
        }

        let id = Number.parseInt(req.params.id);

        if (isNaN(id)) {
            res.status(406).send("game not found").end();
            return
        }

        let game = await GameService.get().getGameById(id);

        if (game == undefined) {
            res.status(406).send("game not found");
        } else {
            res.status(200).json(game);
        }

        res.end();
    })

    router.post("/ship/goal", async (req, res) => {

        let token = await verifyRequest(req.headers.authorization, res, false);

        if (token == undefined) {
            return
        }

        let result = await GameService.get().setShipGoal(req.body as ShipMoveRequest, token);

        if (result != undefined) {
            switch (result) {
                case SetShipResult.notYourShip: {
                    res.status(406).send("not your ship")
                    break;
                }
                case SetShipResult.notInGame: {
                    res.status(406).send("not in game")
                    break;
                }
                case SetShipResult.shipNotFound: {
                    res.status(406).send("ship not found")
                    break;
                }
            }
        } else {
            res.sendStatus(200);
        }

        res.end();
    })

    router.post("/ship/spawn", async (req, res) => {

        let token = await verifyRequest(req.headers.authorization, res, false);

        if (token == undefined) {
            return
        }

        let result = await GameService.get().spawnShip(req.body as ShipSpawnRequest, token);

        if (result != undefined) {
            switch (result) {
                case SpawnShipResult.noSpace: {
                    res.status(406).send("no space")
                    break;
                }
                case SpawnShipResult.notInGame: {
                    res.status(406).send("not in game")
                    break;
                }
                case SpawnShipResult.islandNotFound: {
                    res.status(406).send("island not found")
                    break;
                }
                case SpawnShipResult.notYourIsland: {
                    res.status(406).send("not your island")
                    break;
                }
            }
        } else {
            res.sendStatus(200);
        }

        res.end();
    })

    router.delete("/:id", async (req, res) => {

        let token = await verifyRequest(req.headers.authorization, res, true);

        if (token == undefined) {
            return
        }

        let id = Number.parseInt(req.params.id);

        if (isNaN(id)) {
            res.status(406).send("game not found").end();
            return
        }

        await GameService.get().deleteGame(id);

        res.sendStatus(200).end();
    })

    return router;
}