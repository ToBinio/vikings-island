import {Router} from "express";
import {CreateNewGame, newGames} from "../../../types/games";
import {handleRequest} from "../util/token";
import {JoinGameCreationError, NewGameCreationError, NewGameService} from "./newGame.service";

export function getGamesRouter(): Router {
    let router = Router();

    router.get("/", (req, res) => {

        let token = handleRequest(req.headers.authorization, res);

        if (token == undefined) {
            return
        }

        res.status(200).send(NewGameService.get().getAllGames() as newGames);
    })

    router.get("/:id", (req, res) => {

        let token = handleRequest(req.headers.authorization, res);

        if (token == undefined) {
            return
        }

        let id = Number.parseInt(req.params.id);

        const game = NewGameService.get().getGame(id);

        if (game == undefined) {
            res.status(406).send("game not found");
        } else {
            res.status(200).send(game);
        }
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
        }

        res.status(200).json(newGame.ok!);
    })

    router.post("/join", (req, res) => {

        let token = handleRequest(req.headers.authorization, res);

        if (token == undefined) {
            return
        }

        let gameId: number = req.body;

        let newGame = NewGameService.get().joinGame(gameId, token);

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
        }

        res.sendStatus(200);
    })

    return router;
}