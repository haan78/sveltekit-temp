
import { randomUUID } from 'crypto'
import { serialize,parse,CookieSerializeOptions } from 'cookie';
import type { Cookies, RequestEvent } from '@sveltejs/kit/types/internal';

import fs from 'fs';
import { join } from 'path';


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
            let op = SessionHandler.cookieSerializeOptions;
            if (remove) {
                op.maxAge = -1;
            }
            const cookie = serialize(SessionHandler.cookie_name,this.id,op);
            const response = Response.redirect(location,301);
            response.headers.set("set-cookie",cookie);
            return response;
        } else {
            return Response.redirect(location,302);
        }
        
                
    }

    private setCookieToEvent(cookies:Cookies,remove:boolean = false): void {
        let op = SessionHandler.cookieSerializeOptions;
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
        await this.setById(data,id);
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
        const response = new Response('', { status: 301, headers: { Location: location} });
        return this.setCookieToResponse(location,true);
    }

    public async accept(location:string) {
        const response = new Response('', { status: 301, headers: { Location: location} });
        if (this.id) {           
            return this.setCookieToResponse(location);
        } else {
            throw new Error("No Session ID");
        }
    }

    public reject(location:string) {
        return Response.redirect(location,302);
    }

    protected abstract getById(id: string): Promise<any>;
    public abstract setById(id: string, data:any): Promise<void>;
    public abstract deleteById(id: string): Promise<void>;
}

export class DirSessionHandler extends SessionHandler {
    private dir: string;
    constructor(event:RequestEvent,dir: string) {
        if (fs.existsSync(dir)) {
            fs.accessSync(dir, fs.constants.W_OK);
        } else {
            throw new Error(`Directory ${dir} is not exists`);
        }
        super(event);
        this.dir = dir;
        this.clear();
    }

    clear() {
        const end = (new Date()).getTime() - ( (DirSessionHandler.cookieSerializeOptions.maxAge ? DirSessionHandler.cookieSerializeOptions.maxAge : 600) * 1000);
        fs.readdir(this.dir,(err, files)=>{
            if (!err) {
                files.forEach((file)=>{
                    const fpath = join(this.dir,file);
                    fs.stat(fpath,(err,stats)=>{
                        if (!err) {
                            if (stats.atimeMs < end) {
                                fs.unlink(fpath,err=>{
                                    if (err) console.log(`session clear ${fpath} unlink ${err.message}`);
                                });
                            }
                        } else {
                            console.log(`session clear ${fpath} stats ${err.message}`);
                        }
                    });
                });
            } else {
                console.log(`session clear  ${this.dir} readdir ${err.message}`);
            }
        });
    }

    async getById(id: string) {        
        const path = join(this.dir,`${id}.json`);
        console.log(path);
        return new Promise<any>((resolve, reject) => {
            if (fs.existsSync(path)) {
                fs.access(path, fs.constants.R_OK, err => {
                    if (!err) {
                        fs.readFile(path, { encoding: 'utf-8', flag: 'r' }, (err, data) => {
                            if (!err) {
                                fs.lutimes(path,new Date(),new Date(),err=>{
                                    if (!err) {
                                        try {                                
                                            resolve(JSON.parse(data));
                                        } catch (ex) {
                                            reject(ex)
                                        }
                                    } else {
                                        reject(err);
                                    }
                                });
                            } else {
                                reject(err);
                            }
                        });
                    } else {
                        console.log("burdan");
                        reject(err);
                    }
                });
            } else {
                resolve(null);
            }
        });
    }

    async setById(data: any, id: string) {
        const path = join(this.dir,`${id}.json`);
        return new Promise<void>((resolve, reject) => {
            if (fs.existsSync(path)) {
                fs.access(path,fs.constants.W_OK,err=>{
                    if (!err) {
                        fs.writeFile(path,JSON.stringify(data),err=>{
                            if (!err) {
                                resolve();
                            } else {
                                reject(err);
                            }
                        });
                    } else {
                        reject(err);
                    }
                });
            } else {
                fs.writeFile(path,JSON.stringify(data),err=>{
                    if (!err) {
                        resolve();
                    } else {
                        reject(err);
                    }
                });
            }
            
        });
    }

    async deleteById(id: string): Promise<void> {
        const path = join(this.dir,`${id}.json`);
        return new Promise<void>((resolve, reject) => {
            if (fs.existsSync(path)) {
                fs.unlink(path,err=>{
                    if (!err) {
                        resolve();
                    } else {
                        reject(err);
                    }
                });
            } else {
                resolve();
            }            
        });
    }
}
