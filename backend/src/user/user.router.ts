import {Router} from "express";
import {UserLoginError, UserRegisterError, UserService} from "./user.service";
import {UserLoginRequest} from "../../../types/user";
import {verifyRequest} from "../util/token";
import {UserStore} from "./user.store";

export function getUserRouter(): Router {
    let router = Router();

    router.post("/register", async (req, res) => {
        let data = await UserService.get().register(req.body as UserLoginRequest);

        if (data == UserRegisterError.userNameAlreadyTaken) {
            res.status(403)

        } else if (data == UserRegisterError.userNameNotAllowed) {
            res.status(406)
        } else {
            res.status(200);
            res.json(data)
        }

        res.end();
    })

    router.post("/login", async (req, res) => {
        let data = await UserService.get().login(req.body as UserLoginRequest);

        if (data == UserLoginError.userNameNotFound) {
            res.status(404);
        } else if (data == UserLoginError.wrongPassword) {
            res.status(409);
        } else {
            res.status(200);
            res.json(data)
        }

        res.end();
    })

    router.get("/:id", async (req, res) => {

        let token = await verifyRequest(req.headers.authorization, res, false);

        if (token == undefined) {
            return
        }

        let id = Number.parseInt(req.params.id);

        if (isNaN(id)) {
            res.status(406).send("user not found").end();
            return
        }

        let user = await UserService.get().getUser(id);

        if (user == undefined) {
            res.status(406).send("user not found");
        } else {
            res.status(200).json(user);
        }

        res.end();
    })

    router.delete("/:id", async (req, res) => {

        let token = await verifyRequest(req.headers.authorization, res, true);

        if (token == undefined) {
            return
        }


        let id = Number.parseInt(req.params.id);

        if (isNaN(id)) {
            res.status(406).send("user not found").end();
            return
        }

        await UserService.get().deleteUser(id);

        res.sendStatus(200).end();
    })

    router.get("/", async (req, res) => {

        let token = await verifyRequest(req.headers.authorization, res, false);

        if (token == undefined) {
            return
        }

        let user = await UserService.get().getAllUsers();

        res.status(200).json(user).end();
    })

    router.post("/password/:id", async (req, res) => {

        let token = await verifyRequest(req.headers.authorization, res, true);

        if (token == undefined) {
            return
        }

        let user = await UserService.get().getUser(token.id);

        let id = Number.parseInt(req.params.id);

        if (isNaN(id)) {
            res.status(406).send("user not found").end();
            return
        }

        await UserService.get().changePassword(id, req.body)

        res.status(200).end(user);
    })

    return router;
}