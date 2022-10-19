import jwt from 'jsonwebtoken';

type JwtPayload = import('jsonwebtoken').JwtPayload;

import type { Cookies } from '@sveltejs/kit';
import type { CookieSerializeOptions } from 'cookie';


export async function removeCookie(response:Response,cookies:Cookies,path:string = "/") {    
    const options:CookieSerializeOptions = {
        maxAge: -3600,
        path: path
    };
    const co = cookies.serialize("authorization_token","",options);
    cookies.set("authorization_token","",options);
    await cookies.delete("authorization_token");
    response.headers.set('set-cookie',co);
}

export interface Errors {
    exp?: string,
    token?: string,
    unauthorized?: string
}

export function createTokenAndSave(payload: JwtPayload, cookies: Cookies, key: string, time: number, path: string = "/"): void {
    payload.exp = Math.floor(Date.now() / 1000) + time;
    const nt: string = jwt.sign(payload, key);
    cookies.set("authorization_token", nt, {        
        httpOnly: true,
        secure: true,
        maxAge: time,
        sameSite: 'none',
        path: path

    });
}

export function creatTokenAsString(payload: JwtPayload,key: string, time: number):string {
    payload.exp = Math.floor(Date.now() / 1000) + time;
    return jwt.sign(payload, key);
}

export function validateToken(token:string, key: string):JwtPayload {
    const payload = <JwtPayload>jwt.verify(token, key, { ignoreExpiration: false });
    return payload;

}

export function validateCookie(cookies: Cookies,key: string):JwtPayload {
    if (cookies.get("authorization_token")) {
        const payload = <JwtPayload>jwt.verify(<string>cookies.get("authorization_token"), key, { ignoreExpiration: false });
        return payload;
    } else {
        throw new Error("there is no authorization token among cookies");
    }
}

export function checkToken( cookies: Cookies, urlParams: URLSearchParams, key: string, time: number, path: string = "/"): JwtPayload | null {
    const token: string = ((cookies.get("authorization_token") || urlParams.get("token")) || "").trim();
    if (token) {
        const payload = jwt.verify(token, key, { ignoreExpiration: false });
        (<JwtPayload>payload).exp = Math.floor(Date.now() / 1000) + time;

        const nt: string = jwt.sign(payload, key);

        cookies.set("authorization_token", nt, {
            httpOnly: true,
            secure: true,
            maxAge: time,
            sameSite: 'none',
            path: path
        });
        return <JwtPayload>payload;
    } else {
        return null;
    }
}
