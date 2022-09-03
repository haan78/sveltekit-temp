import { createConnection,Connection } from 'mysql';
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

export class MysqlCall  {
    private params:Array<Param> = [];
    private conInfo={
        host:"",
        user:"",
        password:"",
        database:"",
        port:0,
        multipleStatements:true
    }
    constructor (settings:Settings|string) {
        this.params = [];
        if (typeof settings == "string") {
            settings.split("|").forEach((elm, i) => {
                if (i == 0) this.conInfo.host = elm.trim();
                else if (i == 1) this.conInfo.user = elm.trim();
                else if (i == 2) this.conInfo.password = elm.trim();
                else if (i == 3) this.conInfo.database = elm.trim();
                else if (i == 4) this.conInfo.port = parseInt(elm.trim());
            });
        } else {
            this.conInfo.host = settings.host;
            this.conInfo.user = settings.user;
            this.conInfo.password = settings.password;            
            this.conInfo.database = settings.database || "";
            this.conInfo.port = settings.port || 3306;
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

    public call(name:string):Promise<Result> {
        let self = this;
        return new Promise<Result>((resolve,reject)=>{
            const conn : Connection = createConnection(this.conInfo);
            conn.connect(function(err){
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
                    conn.query(sql,function(err,result){
                        if (!err) {
                            let outs:Record<string,unknown> = {};
                            let results:Array<Array<Record<string,unknown>>> = [];
                            if (Array.isArray(result)) {
                                result.forEach((r,i) => {
                                    if (i == result.length-1 && sets.length > 0) {
                                        outs = <Record<string,unknown>>r;
                                    } else if ( Array.isArray(r) ) {
                                        results.push(<Array<Record<string,unknown>>>r);
                                    }
                                });
                            }                            
                            conn.end();
                            resolve({
                                outs:outs,
                                results:results
                            });
                        } else {
                            conn.end();
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