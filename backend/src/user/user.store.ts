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

    users: User[] = [];

    getAllUserNames(): string[] {
        let names = [];

        for (let user of this.users) {
            names.push(user.name);
        }

        return names;
    }

    addUser(name: string, hash: string): number {
        this.users.push({name, password: hash})
        return this.users.length - 1;
    }

    getUser(index: number): User {
        return this.users[index];
    }

}


interface User {
    name: string,
    password: string,
}