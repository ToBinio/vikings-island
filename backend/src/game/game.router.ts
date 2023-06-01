import {Router} from "express";
import {handleRequest} from "../util/token";
import {UserService} from "../user/user.service";
import {GameService} from "./game.service";

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

    return router;
}