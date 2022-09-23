
import { randomUUID } from 'crypto'
import { serialize,parse } from 'cookie';

export type CookieSerializeOptions = import("cookie").CookieSerializeOptions;
export type RequestEvent = import("@sveltejs/kit/types/internal").RequestEvent;
export type Cookies = import("@sveltejs/kit/types/internal").Cookies;


export abstract class SessionHandler {

    private id:string = "";
    public static cookie_name = "SK_SESSION_ID";
    public static cookieSerializeOptions:CookieSerializeOptions = {
        httpOnly:true,
        path:"/",
        secure:true,
        sameSite:true,
        maxAge:600
    };
    private eventCookies:Cookies;
    private locals:App.Locals;
    private data:any = null;

    constructor(event:RequestEvent) {
        this.eventCookies = event.cookies;
        this.locals = event.locals;
        const cookieData:Record<string,string> = parse( event.request.headers.get("cookie") || "");
        this.id = cookieData[SessionHandler.cookie_name] || "";
    }

    private setCookieToResponse(location:string,remove:boolean = false):Response {
        
        if (this.id) {
            let op = Object.assign({},SessionHandler.cookieSerializeOptions);
            if (remove) {
                op.maxAge = -1;
            }
            const cookie = serialize(SessionHandler.cookie_name,this.id,op);
            const response = new Response('', { status: 301, headers: { Location: location } });
            response.headers.set("set-cookie",cookie);
            return response;
        } else {        
            return new Response('', { status: 302, headers: { Location: location } });
        }
    }

    private setCookieToEvent(cookies:Cookies,remove:boolean = false): void {
        let op = Object.assign({},SessionHandler.cookieSerializeOptions);
        if (remove) {
            op.maxAge = -1;
        }
        cookies.set(SessionHandler.cookie_name,this.id,SessionHandler.cookieSerializeOptions);
    }

    public async get():Promise<any> {          
        if ( this.id ) {
            this.data = await this.getById(this.id);
            if (this.data !== null) {
                this.setCookieToEvent(this.eventCookies);
                this.locals["session"] = this.data;
            }            
            return this.data;
        } else {
            //return new Promise<any>((resolve)=>{ resolve(null)});
            return null;
        }
    }

    private async set(data:any):Promise<void> {
        const id = this.id || randomUUID();      
        await this.setById(id,data);
        this.id = id;
    }

    public async update(data:any):Promise<void> {
        await this.set(data);
        this.setCookieToEvent(this.eventCookies);
    }

    public async send(location:string,data:any):Promise<Response> {
        await this.set(data);
        return this.setCookieToResponse(location);
    }

    public async kill(location:string):Promise<Response> {
        if (this.id) {
            await this.deleteById(this.id);
        }
        return this.setCookieToResponse(location,true);
    }

    public async accept(location:string) {
        if (this.id) {           
            return this.setCookieToResponse(location);
        } else {
            throw new Error("No Session ID");
        }
    }

    public reject(location:string) {
        return new Response('', { status: 302, headers: { Location: location } });
    }

    protected abstract getById(id: string): Promise<any>;
    protected abstract setById(id: string, data:any): Promise<void>;
    protected abstract deleteById(id: string): Promise<void>;
}
