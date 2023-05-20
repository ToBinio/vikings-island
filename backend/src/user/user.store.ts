import {sequelizeConnection} from "../db/db";
import Account from "../db/models/account";

export class UserStore {

    static instance: UserStore | undefined;

    static get(): UserStore {
        if (UserStore.instance == undefined) {
            UserStore.instance = new UserStore();
        }

        return UserStore.instance;
    }

    private constructor() {
    }

    async getAllUserNames(): Promise<string[]> {
        let accounts = await Account.findAll();

        return accounts.map((account) => {
            return account.user_name
        })
    }

    async addUser(name: string, hash: string): Promise<User> {
        let account = await Account.create({user_name: name, password: hash});

        return {id: account.id, name: account.user_name, password: account.password}
    }

    async getUserByID(id: number): Promise<User | undefined> {
        let account = await Account.findByPk(id);

        if (account == null)
            return undefined

        return {id: account.id, name: account.user_name, password: account.password}
    }

    async getUserByName(name: string): Promise<User | undefined> {
        let accounts = await Account.findAll({
            where: {
                user_name: name
            }
        });

        if (accounts.length != 1) {
            return undefined
        }

        return {id: accounts[0].id, name: accounts[0].user_name, password: accounts[0].password}
    }

}


interface User {
    id: number
    name: string,
    password: string,
}