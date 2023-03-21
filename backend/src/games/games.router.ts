import {Router} from "express";
import {getAllGameInfos} from "./games.service";
import {GameInfoResponse} from "../../../types/games";

export function getGamesRouter(): Router {
    let router = Router();

    router.get("/", (req, res) => {
        res.status(200);
        res.send(getAllGameInfos() as GameInfoResponse);
    })

    router.post("/", (req, res) => {
        res.status(200);
        res.send(getAllGameInfos() as GameInfoResponse);
    })


    return router;
}