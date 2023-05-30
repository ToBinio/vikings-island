import {Router} from "express";
import {GameCreateRequest, GameInfoResponse} from "../../../types/games";
import {TokenVerifyError, verifyToken} from "../util/token";
import {NewGameService} from "./newGame.service";

export function getGamesRouter(): Router {
    let router = Router();

    router.get("/", (req, res) => {

        let token = verifyToken(req.headers.authorization);

        switch (token) {
            case TokenVerifyError.MISSING: {
                res.sendStatus(401)
                return;
            }
            case TokenVerifyError.INVALID: {
                res.sendStatus(403);
                return;
            }
        }

        res.status(200).send(NewGameService.get().getAllGames() as GameInfoResponse);
    })

    router.post("/", (req, res) => {

        let token = verifyToken(req.headers.authorization);

        switch (token) {
            case TokenVerifyError.MISSING: {
                res.sendStatus(401)
                return;
            }
            case TokenVerifyError.INVALID: {
                res.sendStatus(403)
                return;
            }
        }

        let gameCreateRequest: GameCreateRequest = req.body;

        let newGameId = NewGameService.get().createGame(gameCreateRequest, token);

        res.status(200).json(newGameId);
    })

    return router;
}