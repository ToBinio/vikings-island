import {UserLoginRequest} from "../../../types/user";
import {addUser, getAllUserNames, getUser} from "./user.store";
import {sign} from "jsonwebtoken";
import {JWT_TOKEN} from "../index";

export function UserRegister(loginRequest: UserLoginRequest): string | undefined {
    let allUserNames = getAllUserNames();

    let index = allUserNames.indexOf(loginRequest.userName);
    if (index != -1) return undefined;

    //todo hash once more
    addUser(loginRequest.userName, loginRequest.password);

    return generateToken(loginRequest.userName, index);
}

export function UserLogin(loginRequest: UserLoginRequest): string | UserLoginError {
    let allUserNames = getAllUserNames();

    let index = allUserNames.indexOf(loginRequest.userName);
    if (index == -1) return UserLoginError.userNameNotFound;

    let user = getUser(index);

    if (user.password != loginRequest.password) return UserLoginError.wrongPassword;

    return generateToken(user.name, index);
}

function generateToken(userName: string, id: number): string {
    return sign({name: userName, id: id}, JWT_TOKEN);
}

export enum UserLoginError {
    userNameNotFound,
    wrongPassword
}