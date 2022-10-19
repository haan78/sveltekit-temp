type Header = Record<string,string>;


export interface RequestJWT {
    payload:Record<string,string|number>,
    secret:string,
    time:number
}

export class JsonRequest {
    public static encoding = 'UTF-8';    
    private _auth:string;

    constructor() {
        this._auth = "";
    }

    public bearer(token: string):JsonRequest {
        this._auth = `Bearer ${token}`;
        return this;
    }

    public basic(user:string,password:string):JsonRequest {        
        //this._auth = "Basic "+Buffer.from(user+":"+password, "binary").toString("base64");
        this._auth = "Basic "+btoa(user+":"+password);
        return this;
    }

    public json(url: string, data: unknown = null): Promise<unknown> {

        const headers:Header = {
            "Content-Type":`application/json; charset=${JsonRequest.encoding}`
        }

        if (this._auth!=="") {            
            headers["authorization"] = this._auth;
        }

        return new Promise((resolve, reject) => {
            fetch(url, {
                method: (data === null ? 'GET' : 'POST'),
                cache: 'no-cache',
                headers: headers,
                body: (data === null ? null : JSON.stringify(data))
            }).then(response =>{
                response.json().then(json=>{
                    resolve(json);
                }).catch(error=>{
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    }
}