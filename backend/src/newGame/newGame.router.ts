import {Router} from "express";
import {CreateNewGame, NewGames} from "../../../types/games";
import {verifyRequest} from "../util/token";
import {JoinNewGameError, LeaveNewGameError, NewGameCreationError, NewGameService} from "./newGame.service";

export function getNewGamesRouter(): Router {
    let router = Router();

    router.get("/", async (req, res) => {

        let token = await verifyRequest(req.headers.authorization, res, false);

        if (token == undefined) {
            return
        }

        res.status(200).json(NewGameService.get().getAllGames() as NewGames).end();
    })

    router.get("/:id", async (req, res) => {

        let token = await verifyRequest(req.headers.authorization, res, false);

        if (token == undefined) {
            return
        }

        let id = Number.parseInt(req.params.id);

        if (isNaN(id)) {
            res.status(406).send("user not found").end();
            return
        }

        const game = NewGameService.get().getGame(id);

        if (game == undefined) {
            res.status(406).send("game not found");
        } else {
            res.status(200).send(game);
        }

        res.end();
    })

    router.post("/", async (req, res) => {

        let token = await verifyRequest(req.headers.authorization, res, false);

        if (token == undefined) {
            return
        }

        let gameCreateRequest: CreateNewGame = req.body;

        let newGame = NewGameService.get().createGame(gameCreateRequest, token);

        if (newGame.ok == undefined) {
            switch (newGame.err!) {
                case NewGameCreationError.gameNameAlreadyTaken: {
                    res.status(406).send("game name already Taken")
                    break;
                }
                case NewGameCreationError.gameTickToShort: {
                    res.status(406).send("game tick to short")
                    break;
                }
            }
        } else {
            res.status(200).json(newGame.ok!);
        }

        res.end();
    })

    router.post("/join/:id", async (req, res) => {

        let token = await verifyRequest(req.headers.authorization, res, false);

        if (token == undefined) {
            return
        }

        let id = Number.parseInt(req.params.id);

        if (isNaN(id)) {
            res.status(406).send("game not found").end();
            return
        }

        let newGame = await NewGameService.get().joinGame(id, token);

        if (newGame.ok == undefined) {
            switch (newGame.err!) {
                case JoinNewGameError.gameFull: {
                    res.status(406).send("game already full")
                    break;
                }
                case JoinNewGameError.gameNotFound: {
                    res.status(406).send("game not found")
                    break;
                }
                case JoinNewGameError.alreadyJoined: {
                    res.status(406).send("already joined")
                    break;
                }
            }
        } else {
            res.sendStatus(200);
        }

        res.end();
    })

    router.post("/leave/:id", async (req, res) => {

        let token = await verifyRequest(req.headers.authorization, res, false);

        if (token == undefined) {
            return
        }

        let id = Number.parseInt(req.params.id);

        if (isNaN(id)) {
            res.status(406).send("game not found").end();
            return
        }

        let game = NewGameService.get().leaveGame(id, token);

        if (game.ok == undefined) {
            switch (game.err!) {
                case LeaveNewGameError.neverJoined: {
                    res.status(406).send("user never joined")
                    break;
                }
                case LeaveNewGameError.gameNotFound: {
                    res.status(406).send("game not found")
                    break;
                }
            }
        } else {
            res.sendStatus(200);
        }

        res.end();
    })

    return router;
}