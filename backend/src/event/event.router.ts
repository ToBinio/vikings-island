import {Router} from "express";
import {clearInterval} from "timers";

export function getEventRouter(): Router {
    let router = Router();

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

    return router;
}