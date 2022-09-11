import { DirSessionHandler } from './lib/Session';
import path from 'path';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    const dir = path.join(process.cwd(),'sessions');
    const dsh = new DirSessionHandler(event,dir); 
    if (event.url.pathname.startsWith('/page')) {
        const sd = await dsh.get();
        if (sd === null) {
            return dsh.reject("/login");
        }
    } else if ( event.url.pathname=='/enter' ) {
        const fd = await event.request.formData();
        const user = fd.get("user");
        const password = fd.get("password");
        if (user=="ali" && password == "123") {
            return await dsh.send("/page",{user:user});
        } else {
            return dsh.reject("/login");
        }
        
    } else if (event.url.pathname=='/exit') {               
        return await dsh.kill('/login');;
    }
    return await resolve(event);
}