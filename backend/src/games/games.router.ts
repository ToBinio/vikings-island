import {Router} from "express";
import {createGame, getAllGameInfos} from "./games.service";
import {GameCreateRequest, GameInfoResponse} from "../../../types/games";
import {TokenVerifyError, verifyToken} from "../util/token";

export function getGamesRouter(): Router {
    let router = Router();

    router.get("/", (req, res) => {
        res.status(200);
        res.send(getAllGameInfos() as GameInfoResponse);
    })

    router.post("/", (req, res) => {

        let token = verifyToken(req.headers.authorization);

        switch (token) {
            case TokenVerifyError.MISSING: {
                res.status(401).send()
                return;
            }
            case TokenVerifyError.INVALID: {
                res.status(403).send()
                return;
            }
        }

        let gameCreateRequest: GameCreateRequest = req.body;

        let newGameId = createGame(gameCreateRequest, token);

        res.status(200).send(newGameId);
    })

    return router;
}