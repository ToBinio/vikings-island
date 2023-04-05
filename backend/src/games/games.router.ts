import {Router} from "express";
import {createGame, getAllGameInfos} from "./games.service";
import {GameCreateRequest, GameInfoResponse} from "../../../types/games";
import {TokenVerifyError, verifyToken} from "../util/token";

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

        res.status(200).send(getAllGameInfos() as GameInfoResponse);
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

        let newGameId = createGame(gameCreateRequest, token);

        res.status(200).json(newGameId);
    })

    return router;
}