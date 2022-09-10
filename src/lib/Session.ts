import fs from 'fs';
import { randomUUID } from 'crypto'
import { join } from 'path';
import { serialize,parse } from 'cookie';
import type { RequestEvent, ResponseHeaders } from '@sveltejs/kit/types/internal';

export type IHandlerSettings = {
    cookie_name:string;
    cookie_path:string;
    cookie_http_only:boolean;
    cookie_secure:boolean;
    timeout:number;
}

export const DefaultHandlerSettings:IHandlerSettings = {
    cookie_http_only:true,
    cookie_name:"SERVER_SESSION_ID",
    cookie_path:"/",
    cookie_secure:true,
    timeout:600
};

export type SetHeaders = (headers: ResponseHeaders) => void;

export abstract class SessionHandler {

    private id:string = "";
    private setheaders:SetHeaders;
    private locals:App.Locals;
    private data:any = null;
    public settings:IHandlerSettings = DefaultHandlerSettings;

    constructor(event:RequestEvent) {
        this.setheaders = event.setHeaders;
        this.locals = event.locals;
        const cookieData:Record<string,string> = parse( event.request.headers.get("cookie") || "");
        this.id = cookieData[this.settings.cookie_name] || "";
    }

    private setCookie(target:Response|SetHeaders ,remove:boolean = false):void {
        const cookie = serialize(this.settings.cookie_name,this.id,{
            httpOnly:this.settings.cookie_http_only,
            secure:this.settings.cookie_secure,
            maxAge:(remove ? -1 :  Math.floor(Date.now() / 1000) + this.settings.timeout),
            sameSite:true,
            path:this.settings.cookie_path
        });
        if ( target instanceof Response ) {
            target.headers.set("set-cookie",cookie);
        } else {
            target({"set-cookie":cookie});
        }
        
    }

    public async get():Promise<any> {          
        if ( this.id ) {
            this.data = await this.getById(this.id);
            if (this.data !== null) {
                this.setCookie(this.setheaders);
                this.locals["session"] = this.data;
            }            
            return this.data;
        } else {
            //return new Promise<any>((resolve)=>{ resolve(null)});
            return null;
        }
    }

    public async set(data:any):Promise<void> {
        const id = this.id || randomUUID();      
        await this.setById(data,id);
        this.id = id;
    }

    public async send(location:string,data:any):Promise<Response> {
        await this.set(data);
        const response = new Response('', { status: 301, headers: { Location: location} });
        this.setCookie(response);
        return response;
    }

    public async kill(location:string):Promise<Response> {
        const response = new Response('', { status: 301, headers: { Location: location} });
        if (this.id) {
            await this.deleteById(this.id);            
            this.setCookie(response,true);            
            this.id = "";
        }
        return response;
    }

    public async accept(location:string) {
        const response = new Response('', { status: 301, headers: { Location: location} });
        if (this.id) {           
            this.setCookie(response,true);            
            this.id = "";
        }
    }

    public reject(location:string) {
        return new Response('', { status: 302, headers: { Location: location} });
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
        const end = (new Date()).getTime() - ( this.settings.timeout * 1000);
        fs.readdir(this.dir,(err, files)=>{
            if (!err) {
                files.forEach((file)=>{
                    const fpath = join(this.dir,file);
                    fs.stat(fpath,(err,stats)=>{
                        if (!err) {
                            if (stats.atimeMs < end) {
                                fs.unlink(fpath,err=>{
                                    if (err) console.log(`${fpath} unlink ${err.message}`);
                                });
                            }
                        } else {
                            console.log(`${fpath} stats ${err.message}`);
                        }
                    });
                });
            } else {
                console.log(`${this.dir} readdir ${err.message}`);
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
