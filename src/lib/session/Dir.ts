import fs from 'fs';
import { join } from 'path';
import {SessionHandler} from './Session';
import type { RequestEvent } from './Session';

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
        this.clearOldRecords();
    }

    async clearOldRecords(): Promise<void> {
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