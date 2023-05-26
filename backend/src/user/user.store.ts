import {db} from "../db/db";

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
        let accounts = await db.selectFrom('users')
            .select(["user_name"])
            .execute();

        return accounts.map((account) => {
            return account.user_name
        })
    }

    async addUser(name: string, hash: string): Promise<User> {
        let account = await db.insertInto('users')
            .values({user_name: name, password: hash})
            .returningAll()
            .executeTakeFirstOrThrow();

        return {id: account.id, name: account.user_name, password: account.password}
    }

    async getUserByID(id: number): Promise<User | undefined> {

        let account = await db.selectFrom('users')
            .where('id', '=', id)
            .selectAll()
            .executeTakeFirst();

        if (account == undefined)
            return undefined

        return {id: account.id, name: account.user_name, password: account.password}
    }

    async getUserByName(name: string): Promise<User | undefined> {
        let account = await db.selectFrom('users')
            .where('user_name', '=', name)
            .selectAll()
            .executeTakeFirst();

        if (account == undefined)
            return undefined

        return {id: account.id, name: account.user_name, password: account.password}
    }

}


interface User {
    id: number
    name: string,
    password: string,
}