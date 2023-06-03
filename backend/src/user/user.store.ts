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

    async addUser(name: string, hash: string): Promise<UserData> {
        let account = await db.insertInto('users')
            .values({user_name: name, password: hash, is_admin: false})
            .returningAll()
            .executeTakeFirstOrThrow();

        return {id: account.id, name: account.user_name, password: account.password, is_admin: account.is_admin}
    }

    async getUserByID(id: number): Promise<UserData | undefined> {

        let account = await db.selectFrom('users')
            .where('id', '=', id)
            .selectAll()
            .executeTakeFirst();

        if (account == undefined)
            return undefined

        return {id: account.id, name: account.user_name, password: account.password, is_admin: account.is_admin}
    }

    async getAllUsers(): Promise<UserData[]> {
        return await db.selectFrom('users')
            .select(["user_name as name", "password", "id", "is_admin"])
            .execute();
    }

    async getUserByName(name: string): Promise<UserData | undefined> {
        let account = await db.selectFrom('users')
            .where('user_name', '=', name)
            .selectAll()
            .executeTakeFirst();

        if (account == undefined)
            return undefined

        return {id: account.id, name: account.user_name, password: account.password, is_admin: account.is_admin}
    }

    async updateUserPassword(userId: number, password: string) {
        await db.updateTable("users")
            .set({password: password})
            .where("users.id", "=", userId)
            .execute()
    }

    async deleteUser(userId: number) {
        await db.deleteFrom("users")
            .where("users.id","=",userId)
            .execute()
    }
}


export interface UserData {
    id: number
    name: string,
    password: string,

    is_admin: boolean
}

export interface PublicUserData {
    id: number
    name: string,

    is_admin: boolean
}