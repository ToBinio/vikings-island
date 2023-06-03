import {Router} from "express";
import {handleRequest} from "../util/token";
import {GameService} from "./game.service";
import {UserService} from "../user/user.service";

export function getGamesRouter(): Router {
    let router = Router();

    router.get("/", async (req, res) => {

        let token = handleRequest(req.headers.authorization, res);

        if (token == undefined) {
            return
        }

        let games = await GameService.get().getGameByUser(token.id);

        res.status(200).json(games);

        res.end();
    })

    router.get("/all", async (req, res) => {

        let token = handleRequest(req.headers.authorization, res);

        if (token == undefined) {
            return
        }

        let games = await GameService.get().getAllSimpleGames();

        res.status(200).json(games);

        res.end();
    })

    router.get("/:id", async (req, res) => {

        let token = handleRequest(req.headers.authorization, res);

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

        let token = handleRequest(req.headers.authorization, res);

        if (token == undefined) {
            return
        }

        let user = await UserService.get().getUser(token.id);

        if (user == undefined || !user.is_admin) {
            res.status(403).send("no admin").end();
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