import {Router} from "express";
import {UserLogin, UserLoginError, UserRegister} from "./user.service";
import {UserLoginRequest, UserLoginResponse} from "../../../types/user";

export function getUserRouter(): Router {
    let router = Router();

    router.post("/register", (req, res) => {
        let token = UserRegister(req.body as UserLoginRequest);

        if (token) {
            res.status(200);
            res.send({token: token} as UserLoginResponse)
        } else {
            res.status(403)
        }

        res.end();
    })

    router.post("/login", (req, res) => {
        let token = UserLogin(req.body as UserLoginRequest);

        if (token == UserLoginError.userNameNotFound) {
            res.status(404);
        } else if (token == UserLoginError.wrongPassword) {
            res.status(401);
        } else {
            res.status(200);
            res.send({token: token} as UserLoginResponse)
        }

        res.end();
    })

    return router;
}