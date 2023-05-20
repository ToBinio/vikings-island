import {UserLoginRequest} from "../../../types/user";
import {generateToken} from "../util/token";
import {UserStore} from "./user.store";

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

    register(loginRequest: UserLoginRequest): string | UserRegisterError {
        if (!this.isUserNameValid(loginRequest.userName)) return UserRegisterError.userNameNotAllowed

        let allUserNames = UserStore.get().getAllUserNames();
        if (allUserNames.includes(loginRequest.userName)) return UserRegisterError.userNameAlreadyTaken;

        let index = UserStore.get().addUser(loginRequest.userName, loginRequest.password);

        return generateToken({name: loginRequest.userName, id: index});
    }

    login(loginRequest: UserLoginRequest): string | UserLoginError {
        let allUserNames = UserStore.get().getAllUserNames();

        let index = allUserNames.indexOf(loginRequest.userName);
        if (index == -1) return UserLoginError.userNameNotFound;

        let user = UserStore.get().getUser(index);

        if (user.password != loginRequest.password) return UserLoginError.wrongPassword;

        return generateToken({name: user.name, id: index});
    }

    isUserNameValid(userName: string): boolean {
        let exp = new RegExp("^[a-zA-Z1-9._]+$", "gm");
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

