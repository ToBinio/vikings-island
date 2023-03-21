import {sign, verify} from "jsonwebtoken";
import {JWT_TOKEN} from "../index";

export function generateToken(token: TokenData): string {
    return sign(token, JWT_TOKEN);
}

export function decodeToken(token: string): TokenData | undefined {
    try {
        return verify(token, JWT_TOKEN) as TokenData;
    } catch (err) {
        return undefined
    }
}

export interface TokenData {
    name: string,
    id: number
}
