import {UserLoginRequest} from "../../../types/user";
import {generateToken} from "../util/token";
import {PublicUserData, UserStore} from "./user.store";

export class UserService {

    static instance: UserService | undefined;

    static get(): UserService {
        if (UserService.instance == undefined) {
            UserService.instance = new UserService();
        }

        return UserService.instance;
    }

    private constructor() {
    }

    async register(loginRequest: UserLoginRequest): Promise<string | UserRegisterError> {
        if (!this.isUserNameValid(loginRequest.userName)) return UserRegisterError.userNameNotAllowed

        if ((await UserStore.get().getUserByName(loginRequest.userName)) != undefined)
            return UserRegisterError.userNameAlreadyTaken;

        let user = await UserStore.get().addUser(loginRequest.userName, loginRequest.password);

        return generateToken({name: user.name, id: user.id});
    }

    async login(loginRequest: UserLoginRequest): Promise<string | UserLoginError> {
        let user = await UserStore.get().getUserByName(loginRequest.userName);

        if (user == undefined)
            return UserLoginError.userNameNotFound;

        if (user.password != loginRequest.password) return UserLoginError.wrongPassword;

        return generateToken({name: user.name, id: user.id});
    }

    async getUser(userId: number): Promise<PublicUserData | undefined> {
        const user = await UserStore.get().getUserByID(userId);

        if (user == undefined) return undefined

        return {id: user.id, is_admin: user.is_admin, name: user.name}
    }

    isUserNameValid(userName: string): boolean {
        let exp = new RegExp("^[a-zA-Z0-9._]+$", "gm");
        return exp.test(userName)
    }
}

export enum UserLoginError {
    userNameNotFound,
    wrongPassword
}

export enum UserRegisterError {
    userNameAlreadyTaken,
    userNameNotAllowed
}

