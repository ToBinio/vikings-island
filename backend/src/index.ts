import cors from "cors";
import * as dotenv from "dotenv";
import express from "express";
import {getUserRouter} from "./user/user.router";
import {getGamesRouter} from "./games/games.router";
import db, {sequelizeConnection} from "./db/db";
import dbInit from "./db/db";

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
server.use("/api/games/", getGamesRouter())

dbInit().then(() => {
    console.log(`DB init`);

    server.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`);
    })
})

