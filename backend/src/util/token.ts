import {Response} from "express-serve-static-core";
import {sign, verify} from "jsonwebtoken";
import {JWT_TOKEN} from "../index";
import {UserService} from "../user/user.service";

export function generateToken(token: TokenData): string {
    return sign(token, JWT_TOKEN);
}

function decodeToken(token: string): TokenData | undefined {
    try {
        return verify(token, JWT_TOKEN) as TokenData;
    } catch (err) {
        return undefined
    }
}

export function verifyToken(authorizationHeader: string | undefined): TokenData | TokenVerifyError {
    if (authorizationHeader == undefined || authorizationHeader.split(" ").length < 2)
        return TokenVerifyError.MISSING

    let token = decodeToken(authorizationHeader!.split(" ")[1]);

    if (token == undefined)
        return TokenVerifyError.INVALID;

    return token;
}

export async function verifyRequest(authorizationHeader: string | undefined, res: Response<any, Record<string, any>, number>, requersAdmin: boolean): Promise<TokenData | undefined> {
    let token = verifyToken(authorizationHeader);

    switch (token) {
        case TokenVerifyError.MISSING: {
            res.status(403).send("missing JWT token")
            return undefined;
        }
        case TokenVerifyError.INVALID: {
            res.status(403).send("invalid JWT token")
            return undefined;
        }
    }

    if (requersAdmin) {
        let tokenUser = await UserService.get().getUser(token.id);

        if (tokenUser == undefined || !tokenUser.is_admin) {
            res.status(403).send("missing admin permissions").end();
            return undefined
        }
    }

    return token
}

export enum TokenVerifyError {
    MISSING,
    INVALID
}

export interface TokenData {
    name: string,
    id: number
}
