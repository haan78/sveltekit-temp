// @ts-ignore
import { MongoSessionHandler } from './lib/session/Mongo';


/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {    
    const msh = new MongoSessionHandler(event,"mongodb://root:12345@127.0.0.1?authSource=admin","test");
    if (event.url.pathname.startsWith('/page')) {
        const sd = await msh.get();
        if (sd === null) {
            return msh.reject("/login");
        }
    } else if ( event.url.pathname=='/enter' ) {
        const fd = await event.request.formData();
        const user = fd.get("user");
        const password = fd.get("password");
        if (user=="ali" && password == "123") {
            return await msh.send("/page",{user:user});
        } else {
            return msh.reject("/login");
        }
        
    } else if (event.url.pathname=='/exit') {               
        return await msh.kill('/login');;
    }
    return await resolve(event);
}