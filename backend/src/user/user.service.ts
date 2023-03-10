import {UserLoginRequest} from "../../../types/user";
import {addUser, getAllUserNames, getUser} from "./user.store";
import {sign} from "jsonwebtoken";
import {JWT_TOKEN} from "../index";

export function UserRegister(loginRequest: UserLoginRequest): string | UserRegisterError {
    if (!isUserNameValid(loginRequest.userName)) return UserRegisterError.userNameNotAllowed

    let allUserNames = getAllUserNames();
    if (allUserNames.includes(loginRequest.userName)) return UserRegisterError.userNameAlreadyTaken;

    //todo hash once more
    let index = addUser(loginRequest.userName, loginRequest.password);

    return generateToken(loginRequest.userName, index);
}

export function UserLogin(loginRequest: UserLoginRequest): string | UserLoginError {
    let allUserNames = getAllUserNames();

    let index = allUserNames.indexOf(loginRequest.userName);
    if (index == -1) return UserLoginError.userNameNotFound;

    let user = getUser(index);

    //todo hash once more
    if (user.password != loginRequest.password) return UserLoginError.wrongPassword;

    return generateToken(user.name, index);
}

function generateToken(userName: string, id: number): string {
    return sign({name: userName, id: id}, JWT_TOKEN);
}

function isUserNameValid(userName: string): boolean {
    let exp = new RegExp("^[a-zA-Z1-9._]+$", "gm");
    return exp.test(userName)
}

export enum UserLoginError {
    userNameNotFound,
    wrongPassword
}

export enum UserRegisterError {
    userNameAlreadyTaken,
    userNameNotAllowed
}