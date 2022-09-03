import jwt, { JwtPayload } from 'jsonwebtoken';

import cookie from 'cookie';


export function removeCookie(response:Response):void {
    const co = cookie.serialize("authorization_token","",{
        httpOnly: true,
        secure:true,
        maxAge: -1,
        sameSite: 'none',
        path:"/okc_cihaz"
    });
    response.headers.set("set-cookie",co);
}

export interface Errors {
    exp?:string,
    token?:string,
    unauthorized?:string
}

export function tokenAuth(headers:Headers,urlParams:URLSearchParams,headerfnc:Function,key:string,time:number,errors:Errors) : JwtPayload {
    const cookieData:Record<string,string> = cookie.parse( headers.get("cookie") || "");
    const token:string = ((cookieData["authorization_token"] || urlParams.get("token") ) || "" ).trim();
    if ( token!="" ) {
        const payload = jwt.verify(token,key);
        if ((<JwtPayload>payload).exp) {       
            (<JwtPayload>payload).exp = Math.floor(Date.now() / 1000) + time;
            
            const nt:string = jwt.sign(payload,key);
            
            const newcookie = cookie.serialize("authorization_token",nt,{
                httpOnly: true,
                secure:true,
                maxAge: time,
                sameSite: 'none',
                path:"/okc_cihaz"
            });           
            headerfnc({ "set-cookie":newcookie });
            return <JwtPayload>payload;
        } else {
            throw new Error( errors.exp || "Exp is required in token");
        }
    } else {
        throw new Error(errors.unauthorized || "unauthorized");
    }
}
