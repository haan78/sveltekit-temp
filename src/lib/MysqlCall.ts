import { createConnection, type MysqlError } from 'mysql';
type Connection = import('mysql').Connection;
interface Param {
    id:string,
    name?:string,
    value:unknown,
    type:"in" | "out"
}

export interface Settings {
    host:string,
    user:string,
    password:string,
    database?:string,
    port?:number
    
}

export interface Result {
    outs:Record<string,unknown>,
    results:Array<Array<Record<string,unknown>>>
}

export async function insertOrUpdate(conn:Connection,table:string,params:Record<string,unknown>): Promise<void> {
    let values = "";
    let names = "";
    let updates = "";
    let varr:Array<unknown> = [];
    for(var k in params) {
        if (values) {
            values += ", ";
            updates += ", ";
            names += ", ";
        }
        values += "?";
        names += k;
        updates += k+" = VALUES("+k+")";
        varr.push(params[k]);
    }

    const sql = `INSERT INTO ${table} (${names}) VALUES (${values}) ON DUPLICATE KEY UPDATE ${updates}`;
    return new Promise<void>((resolve,reject)=>{
        conn.query(sql,varr,(_err,result)=>{
            if (!_err) {                
                resolve(result);
            } else {
                reject(_err);
            }
        });
    });
}

export class MysqlCall  {
    private params:Array<Param> = [];
    private connection:Connection;
    constructor (connection:Connection|string) {
        this.params = [];
        if ( typeof connection === "string" ) {
            const conn =  createConnection(connection);
            this.connection = createConnection({ 
                multipleStatements:true,
                host:conn.config.host, 
                user:conn.config.user,
                password:conn.config.password,
                port:conn.config.port,
                database:conn.config.database,
                ssl:conn.config.ssl,
                flags:conn.config.flags,
                connectTimeout:conn.config.connectTimeout,
                timezone:conn.config.timezone
            });
            conn.end();
            conn.destroy();
            this.connection.config.multipleStatements = true;
        } else {
            if (connection.config.multipleStatements) {
                this.connection = connection;       
            } else {
                throw new Error("multipleStatements must be enabled");
            }
            
        }        
    }


    public in<T extends typeof MysqlCall>(value:unknown):InstanceType<T>  {
        this.params.push({
            id:"p_"+(this.params.length+1),
            value:value,
            type:"in"
        });
        return this as InstanceType<T>;
    }

    public out<T extends typeof MysqlCall>(name:string,value:unknown = null):InstanceType<T> {
        this.params.push({
            id:"p_"+this.params.length,
            name:name,
            value:value,
            type:"out"
        });
        return this as InstanceType<T>;
    }

    static prmValStr(p:Param):string {
        if (p.value === null) {
            return 'NULL';
        } else if (typeof p.value === "string" && p.value.trim().length > 0) {
            return "'"+p.value.replace("'","\'")+"'";
        } else if ( p.value instanceof Date ) {
            return "'"+p.value.toISOString()+"'";
        } else if (typeof p.value == "boolean") {
            return p.value ? '1' : '0';
        } else if (typeof p.value == "object" ) {
            return "'"+JSON.stringify(p.value)+"'";
        } else if (typeof p.value == "number") {
            return p.value+"";
        } else {
            return 'null';
        }
    }

    public async call(name:string):Promise<Result> {
        let self = this;
        return new Promise<Result>((resolve,reject)=>{           
            self.connection.connect(function(err){
                if (!err) {
                    let sets = "";
                    let gets = "";                    
                    let puts = "";
                    self.params.forEach((elm,i)=>{
                        let v:string = MysqlCall.prmValStr(elm);
                        if (i>0) {
                            puts += ", ";
                        }                        
                        if (elm.type == "out") {                        
                            sets+=`${sets.length > 0 ? ', ': ''} @${elm.name} = ${v}`;
                            gets+=`${gets.length > 0 ? ', ': ''} @${elm.name}`;
                            puts+="@"+elm.name;
                    
                        } else {
                            puts += v;
                        }
                    });
                    let sql = "";
                    if ( sets.length > 0) {
                        sql = `SET ${sets}; CALL ${name}(${puts}); SELECT ${gets};`;
                    } else {
                        sql = `CALL ${name}(${puts});`;
                    }
                    //console.log(sql);
                    self.connection.query(sql,function(err,result){
                        self.connection.end();
                        if (!err) {
                            let outs:Record<string,unknown> = {};
                            let results:Array<Array<Record<string,unknown>>> = [];
                            if (Array.isArray(result)) {
                                result.forEach((r,i) => {
                                    if (i == result.length-1 && sets.length > 0) {
                                        if ( r.length > 0 ) {
                                            for (let k in r[0]) {
                                                outs[k.substring(1)] = r[0][k];
                                            }                                            
                                        }                                        
                                    } else if ( Array.isArray(r) ) {
                                        results.push(<Array<Record<string,unknown>>>r);
                                    }
                                });
                            }             
                            const res:Result = {
                                outs:outs,
                                results:results
                            };
                            resolve(res);
                        } else {
                            reject(err);
                        }
                    });
                } else {
                    reject(err);
                }
            });
        });
        
    }
}