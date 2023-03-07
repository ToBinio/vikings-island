export interface UserLoginRequest {
    userName: string
    password: string
}

export interface UserLoginResponse {
    token: string
}