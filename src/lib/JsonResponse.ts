export default function(data:any,status:number = 200,charset="UTF-8"):Response {
    let r = new Response(JSON.stringify(data),{ status:status });    
    r.headers.set("Content-Type", `application/json;charset=${charset}`);
    return r;
}