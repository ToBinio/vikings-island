let users: User[] = [];

export function getAllUserNames(): string[] {
    let names = [];

    for (let user of users) {
        names.push(user.name);
    }

    return names;
}

export function addUser(name: string, hash: string): number {
    users.push({name, password: hash})
    return users.length - 1;
}

export function getUser(index: number): User {
    return users[index];
}


interface User {
    name: string,
    password: string,
}