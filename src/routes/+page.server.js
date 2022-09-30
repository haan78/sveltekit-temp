// @ts-nocheck

/** @type {import('./$types').PageLoad} */
export async function load({ locals }) {
    console.log("APP_TEST",import.meta.env.APP_TEST);
    return locals.session;

}

/** @type {import('./$types').Actions} */
export const actions = {
    default: async (evt) =>{
        const fd = await evt.request.formData();
        fd.forEach((v,k)=>{
            console.log([k,v]);
        });
    }
}