export interface ScriptOptions {
    async?:boolean
    defer?:boolean
}

export interface LinkOption {
    rel?:"stylesheet",
    hreflang?:string,
    type?:string,
    media?:string,
    crossorigin?:string,
    sizes?:any,
    title?:string
}

export async function script(url:string,options:ScriptOptions = {}) : Promise<void> {
    const scr = document.createElement('script');
    scr.async = options.async ?? false;
    scr.defer = options.defer ?? false;
    scr.setAttribute("src",url);
    scr.setAttribute("type","text/javascript");
    return new Promise<void>((resolve,reject)=>{
        scr.addEventListener("load",()=>{
            //console.log(evt);            
            resolve();
        });
        scr.addEventListener("error",()=>{
            reject(new Error(scr.src + " can't load"));
        })
        document.getElementsByTagName("head")[0].appendChild(scr);
    });
}

export async function link(url:string,options:LinkOption = {}) : Promise<void> {
    
}