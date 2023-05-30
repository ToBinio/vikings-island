import {Router} from "express";
import {CreateNewGame, newGames} from "../../../types/games";
import {handleRequest, TokenVerifyError, verifyToken} from "../util/token";
import {NewGameCreationError, NewGameService} from "./newGame.service";

export function getGamesRouter(): Router {
    let router = Router();

    router.get("/", (req, res) => {

        let token = handleRequest(req.headers.authorization, res);

        if (token == undefined) {
            return
        }

        res.status(200).send(NewGameService.get().getAllGames() as newGames);
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

    return router;
}