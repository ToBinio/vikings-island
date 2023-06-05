import {Router} from "express";
import {clearInterval} from "timers";
import {verifyRequest} from "../util/token";
import {EventService} from "./event.service";

export function getEventRouter(): Router {
    let router = Router();

    //todo handle errors
    router.get('/wait_list/:game', async (req, res) => {

        console.log(req.query.token)

        let token = await verifyRequest("Baear " + req.query.token as string, res,false);

        if (token == undefined) {
            return
        }

        let gameId = Number.parseInt(req.params.game);

        res.set({
            'Cache-Control': 'no-cache',
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive'
        });

        res.flushHeaders();

        res.write('retry: 1000\n\n');

        let uuid = EventService.get().addWaitListEvent({res: res, token: token, newGame: gameId});

        req.on("close", () => {
            EventService.get().removeWaitListEvent(uuid);
        })
    });

    //todo handle errors
    router.get('/game/:game', async (req, res) => {
        let token = await verifyRequest("Baear " + req.query.token as string, res,false);

        if (token == undefined) {
            return
        }

        let gameId = Number.parseInt(req.params.game);

        res.set({
            'Cache-Control': 'no-cache',
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive'
        });

        res.flushHeaders();

        res.write('retry: 1000\n\n');

        let uuid = EventService.get().addGameEvent({res: res, token: token, game: gameId});

        req.on("close", () => {
            EventService.get().removeGameEvent(uuid);
        })
    });

    return router;
}