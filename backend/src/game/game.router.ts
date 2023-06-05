import {Router} from "express";
import {verifyRequest} from "../util/token";
import {GameService, SetShipResult, SpawnShipResult, UpgradeIslandResult, UpgradeShipResult} from "./game.service";
import {ShipMoveRequest, ShipSpawnRequest} from "../../../types/ship";
import {Response} from "express-serve-static-core";

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
                case SetShipResult.locationNotInGame: {
                    res.status(406).send("location not in game")
                    break;
                }
            }
        } else {
            res.status(200).send({});
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
            res.status(200).send({});
        }

        res.end();
    })

    router.post("/ship/upgrade/speed", async (req, res) => {

        let token = await verifyRequest(req.headers.authorization, res, false);

        if (token == undefined) {
            return
        }

        let result = await GameService.get().upgradeShipSpeed(req.body, token);

        resolveShipUpgradeRes(res, result);
    })

    router.post("/ship/upgrade/life", async (req, res) => {

        let token = await verifyRequest(req.headers.authorization, res, false);

        if (token == undefined) {
            return
        }

        let result = await GameService.get().upgradeShipLife(req.body, token);

        resolveShipUpgradeRes(res, result);
    })

    router.post("/ship/upgrade/damage", async (req, res) => {

        let token = await verifyRequest(req.headers.authorization, res, false);

        if (token == undefined) {
            return
        }

        let result = await GameService.get().upgradeShipDamage(req.body, token);

        resolveShipUpgradeRes(res, result);
    })


    router.post("/ship/upgrade/heal", async (req, res) => {

        let token = await verifyRequest(req.headers.authorization, res, false);

        if (token == undefined) {
            return
        }

        let result = await GameService.get().upgradeShipHeal(req.body, token);

        resolveShipUpgradeRes(res, result);
    })

    router.post("/island/upgrade/gold", async (req, res) => {

        let token = await verifyRequest(req.headers.authorization, res, false);

        if (token == undefined) {
            return
        }

        let result = await GameService.get().upgradeIslandGold(req.body, token);

        resolveIslandUpgradeRes(res, result);
    })

    router.post("/island/upgrade/life", async (req, res) => {

        let token = await verifyRequest(req.headers.authorization, res, false);

        if (token == undefined) {
            return
        }

        let result = await GameService.get().upgradeIslandLife(req.body, token);

        resolveIslandUpgradeRes(res, result);
    })

    router.post("/island/upgrade/damage", async (req, res) => {

        let token = await verifyRequest(req.headers.authorization, res, false);

        if (token == undefined) {
            return
        }

        let result = await GameService.get().upgradeIslandDamage(req.body, token);

        resolveIslandUpgradeRes(res, result);
    })

    router.post("/island/upgrade/heal", async (req, res) => {

        let token = await verifyRequest(req.headers.authorization, res, false);

        if (token == undefined) {
            return
        }

        let result = await GameService.get().upgradeIslandHeal(req.body, token);

        resolveIslandUpgradeRes(res, result);
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

        res.status(200).send({});
    })

    return router;
}

function resolveShipUpgradeRes(res: Response<any, Record<string, any>, number>, result: UpgradeShipResult | undefined) {
    if (result != undefined) {
        switch (result) {
            case UpgradeShipResult.maxUpgrade: {
                res.status(406).send("max upgrade")
                break;
            }
            case UpgradeShipResult.notInGame: {
                res.status(406).send("not in game")
                break;
            }
            case UpgradeShipResult.shipNotFound: {
                res.status(406).send("ship not found")
                break;
            }
            case UpgradeShipResult.notYourShip: {
                res.status(406).send("not your ship")
                break;
            }
            case UpgradeShipResult.noGold: {
                res.status(406).send("no gold")
                break;
            }
        }
    } else {
        res.status(200).send({});
    }

    res.end();
}

function resolveIslandUpgradeRes(res: Response<any, Record<string, any>, number>, result: UpgradeIslandResult | undefined) {
    if (result != undefined) {
        switch (result) {
            case UpgradeIslandResult.maxUpgrade: {
                res.status(406).send("max upgrade")
                break;
            }
            case UpgradeIslandResult.notInGame: {
                res.status(406).send("not in game")
                break;
            }
            case UpgradeIslandResult.islandNotFound: {
                res.status(406).send("island not found")
                break;
            }
            case UpgradeIslandResult.notYourIsland: {
                res.status(406).send("not your island")
                break;
            }
            case UpgradeIslandResult.noGold: {
                res.status(406).send("no gold")
                break;
            }
        }
    } else {
        res.status(200).send({});
    }

    res.end();
}