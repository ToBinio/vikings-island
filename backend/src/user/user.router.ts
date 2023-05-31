import {Router} from "express";
import {UserLoginError, UserRegisterError, UserService} from "./user.service";
import {UserLoginRequest} from "../../../types/user";
import {handleRequest} from "../util/token";

export function getUserRouter(): Router {
    let router = Router();

    router.post("/register", async (req, res) => {
        let token = await UserService.get().register(req.body as UserLoginRequest);

        if (token == UserRegisterError.userNameAlreadyTaken) {
            res.status(403)

        } else if (token == UserRegisterError.userNameNotAllowed) {
            res.status(406)
        } else {
            res.status(200);
            res.send(token)
        }

        res.end();
    })

    router.post("/login", async (req, res) => {
        let token = await UserService.get().login(req.body as UserLoginRequest);

        if (token == UserLoginError.userNameNotFound) {
            res.status(404);
        } else if (token == UserLoginError.wrongPassword) {
            res.status(409);
        } else {
            res.status(200);
            res.send(token)
        }

        res.end();
    })

    router.get("/:id", async (req, res) => {

        let token = handleRequest(req.headers.authorization, res);

        if (token == undefined) {
            return
        }

        let id = Number.parseInt(req.params.id);

        let user = await UserService.get().getUser(id);

        if (user == undefined) {
            res.status(406).send("user not found");
        } else {
            res.status(200).send(user);
        }
    })

    return router;
}