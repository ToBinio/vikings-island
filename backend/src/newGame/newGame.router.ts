import {Router} from "express";
import {CreateNewGame, NewGames} from "../../../types/games";
import {handleRequest} from "../util/token";
import {JoinGameCreationError, LeaveGameCreationError, NewGameCreationError, NewGameService} from "./newGame.service";

export function getNewGamesRouter(): Router {
    let router = Router();

    router.get("/", (req, res) => {

        let token = handleRequest(req.headers.authorization, res);

        if (token == undefined) {
            return
        }

        res.status(200).json(NewGameService.get().getAllGames() as NewGames).end();
    })

    router.get("/:id", (req, res) => {

        let token = handleRequest(req.headers.authorization, res);

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

    router.post("/", (req, res) => {

        let token = handleRequest(req.headers.authorization, res);

        if (token == undefined) {
            return
        }

        let gameCreateRequest: CreateNewGame = req.body;

        let newGame = NewGameService.get().createGame(gameCreateRequest, token);

        if (newGame.ok == undefined) {
            switch (newGame.err!) {
                case NewGameCreationError.gameNameAlreadyTaken: {
                    res.sendStatus(406)
                    break;
                }
            }
        } else {
            res.status(200).json(newGame.ok!);
        }

        res.end();
    })

    router.post("/join/:id", async (req, res) => {

        let token = handleRequest(req.headers.authorization, res);

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
                case JoinGameCreationError.gameFull: {
                    res.status(406).send("game already full")
                    break;
                }
                case JoinGameCreationError.gameNotFound: {
                    res.status(406).send("game not found")
                    break;
                }
            }
        } else {
            res.sendStatus(200);
        }

        res.end();
    })

    router.post("/leave/:id", (req, res) => {

        let token = handleRequest(req.headers.authorization, res);

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
                case LeaveGameCreationError.neverJoined: {
                    res.status(406).send("user never joined")
                    break;
                }
                case LeaveGameCreationError.gameNotFound: {
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