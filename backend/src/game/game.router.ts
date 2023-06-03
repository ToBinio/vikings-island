import {Router} from "express";
import {verifyRequest} from "../util/token";
import {GameService} from "./game.service";
import {UserService} from "../user/user.service";

export function getGamesRouter(): Router {
    let router = Router();

    router.get("/", async (req, res) => {

        let token = await verifyRequest(req.headers.authorization, res,false);

        if (token == undefined) {
            return
        }

        let games = await GameService.get().getGameByUser(token.id);

        res.status(200).json(games);

        res.end();
    })

    router.get("/all", async (req, res) => {

        let token = await verifyRequest(req.headers.authorization, res,false);

        if (token == undefined) {
            return
        }

        let games = await GameService.get().getAllSimpleGames();

        res.status(200).json(games);

        res.end();
    })

    router.get("/:id", async (req, res) => {

        let token = await verifyRequest(req.headers.authorization, res,false);

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

    router.delete("/:id", async (req, res) => {

        let token = await verifyRequest(req.headers.authorization, res,true);

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