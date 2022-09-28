// @ts-nocheck

/** @type {import('./$types').PageLoad} */
export async function load({ locals }) {
    console.log(process.env.APP_TEST);
    return locals.session;

}