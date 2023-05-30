import cors from "cors";
import * as dotenv from "dotenv";
import express from "express";
import {getUserRouter} from "./user/user.router";
import {getGamesRouter} from "./newGame/newGame.router";
import {getEventRouter} from "./event/event.router";

dotenv.config();
const PORT: number = parseInt(process.env.PORT as string, 10);
export const JWT_TOKEN: string = process.env.JWT as string;

let server = express()

//enable json in body
server.use(express.json())

//enable cors
server.use(cors())

//default response
server.get("/", (req, res) => {
    res.send("Hello from Server!");
})

//add routers
server.use("/api/user/", getUserRouter())
server.use("/api/new_game/", getGamesRouter())
server.use("/api/events/", getEventRouter())

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})
