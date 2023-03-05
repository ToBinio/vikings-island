import * as dotenv from "dotenv";
import express from "express";

dotenv.config();
const PORT: number = parseInt(process.env.PORT as string, 10);

let server = express()

//enable json in body
server.use(express.json())

server.get("/", (req, res) => {
    res.send("Hello from Server!");
})

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})