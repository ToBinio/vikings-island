import {sign, verify} from "jsonwebtoken";
import {JWT_TOKEN} from "../index";

export function generateToken(token: TokenData): string {
    return sign(token, JWT_TOKEN);
}

function decodeToken(token: string): TokenData | undefined {
    let verifiedToken = verify(token, JWT_TOKEN);

    if (typeof verifiedToken === 'string') return undefined

    return verifiedToken as TokenData
}

export function verifyToken(authorizationHeader: string | undefined): TokenData | TokenVerifyError {
    if (authorizationHeader == undefined || authorizationHeader.split(" ").length < 2)
        return TokenVerifyError.MISSING

    let token = decodeToken(authorizationHeader!.split(" ")[1]);

    if (token == undefined)
        return TokenVerifyError.INVALID;

    return token;
}

export enum TokenVerifyError {
    MISSING,
    INVALID
}

export interface TokenData {
    name: string,
    id: number
}
