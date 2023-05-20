import {Router} from "express";
import {UserLoginError, UserRegisterError, UserService} from "./user.service";
import {UserLoginRequest} from "../../../types/user";

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

    return router;
}