export interface UserLoginRequest {
    userName: string
    password: string
}

export interface UserLoginResponse {
    token: string
    id: number
}

export interface User {
    "id": 0,
    "name": "string",
    "is_admin": true
}

export type Users = User[];