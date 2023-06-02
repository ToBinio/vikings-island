import {Router} from "express";
import {clearInterval} from "timers";
import {handleRequest} from "../util/token";
import {EventService} from "./event.service";

export function getEventRouter(): Router {
    let router = Router();

    //todo delete -temp testing
    router.get('/', async (req, res) => {

        console.log('Got /events');

        res.set({
            'Cache-Control': 'no-cache',
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive'
        });

        res.flushHeaders();

        // Tell the client to retry every 10 seconds if connectivity is lost
        res.write('retry: 10000\n\n');
        let count = 0;


        let interval = setInterval(() => {
            console.log('Emit', ++count);
            res.write(`data: ${count}\n\n`);
        }, 1000)

        req.on("close", () => {
            clearInterval(interval);
        })
    });

    //todo handle errors
    router.get('/wait_list/:game', async (req, res) => {

        let token = handleRequest(req.query.token as string, res);

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

        let token = handleRequest(req.query.token as string, res);

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