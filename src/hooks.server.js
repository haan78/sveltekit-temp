// @ts-ignore
import { DirSessionHandler } from './lib/session/Dir';
import path from 'path';
//import { MongoSessionHandler } from './lib/session/Mongo';



/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {    
    //const sh = new MongoSessionHandler(event,"mongodb://root:12345@127.0.0.1?authSource=admin","test");
    const sh = new DirSessionHandler(event,path.join(process.cwd(),'sessions'));
    if (event.url.pathname.startsWith('/page')) {
        const sd = await sh.get();
        if (sd === null) {
            return sh.reject("/login");
        }
    } else if ( event.url.pathname=='/enter' ) {
        const fd = await event.request.formData();
        const user = fd.get("user");
        const password = fd.get("password");
        if (user=="ali" && password == "123") {
            return await sh.send("/page",{user:user});
        } else {
            return sh.reject("/login");
        }
        
    } else if (event.url.pathname=='/exit') {               
        return await sh.kill('/login');;
    }
    return await resolve(event);
}