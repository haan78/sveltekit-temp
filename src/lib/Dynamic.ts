interface Options {
    [key: string]:string | number | boolean | undefined
}

export interface JsOptions extends Options {
    async?:boolean
    defer?:boolean
}

export interface CssOptions extends Options {
    hreflang?:string,
    media?:string,
    crossorigin?:string,
    sizes?:string,
    title?:string,
    referrerpolicy?:string
}

export class Dynamic {
    private doc:Document;
    private list:Array<HTMLScriptElement|HTMLLinkElement>;
    private hash:string;
    
    constructor(document:Document = window.document) {
        this.doc = document;
        this.list = [];
        this.hash = "rnd" + (new Date()).getTime()
    }

    public js(url:string, options:JsOptions = {  }):Dynamic {
        const script:HTMLScriptElement = this.doc.createElement("script");
        script.async = options.async ?? false;
        //scr.defer = options.defer ?? false;
        script.defer = options.defer ?? false;
        script.setAttribute("src",url);
        script.setAttribute("type","text/javascript");
        const u = new URL(url);
        u.searchParams.append("v",this.hash);
        script.src = u.href;        
        this.list.push(script);
        return this;
    }

    public css(url:string, options:CssOptions = {}):Dynamic {
        const link:HTMLLinkElement = this.doc.createElement("link");
        link.setAttribute("rel","stylesheet");
        link.setAttribute("type","text/css");
        const u = new URL(url);
        u.searchParams.append("v",this.hash);
        link.href = u.href;
        Object.keys(options).forEach(k=>{
            if ( typeof options[k] === "string" ) {                
                link.setAttribute(k, (options[k] ?? "").toString());
            }
        });        
        this.list.push(link);
        return this;
    }

    private next(ind:number,success:()=>void,error:(message:string)=>void) {
        if (this.list.length > ind) {
            if (this.list[ind] instanceof HTMLScriptElement) {
                const elm:HTMLScriptElement = <HTMLScriptElement>this.list[ind];
                elm.onload = () => {
                    this.next(ind+1,success,error);
                };
                elm.onerror = () => {
                    error(`Load error ${ind}. ${elm.src} `);
                }
                this.doc.getElementsByTagName("head")[0].appendChild(elm);
            } else {
                const elm:HTMLLinkElement = <HTMLLinkElement>this.list[ind];
                elm.onload = ()=>{
                    this.next(ind+1,success,error);
                };
                elm.onerror = () => {
                    error(`Load error ${ind}. ${elm.href} `);
                };
                this.doc.getElementsByTagName("head")[0].appendChild(elm);
            }
            
        } else {
            success();
        }
    }

    public async load():Promise<void> {
        return new Promise<void>((resolve,reject)=>{
            this.next(0,()=>{
                resolve();
            },(message:string)=>{
                reject(new Error(message));
            });
        });
    }

};