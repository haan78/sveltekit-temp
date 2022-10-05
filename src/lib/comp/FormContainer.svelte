<script lang="ts">
    export let method = "POST";
    export let action = "";
    export let enctype = "multipart/form-data";
    export let form:HTMLFormElement | null = null;

    export let validate:() => Promise<Boolean>;

    async function submit(evt: Event) {
        if ( !await validate() ) {
            evt.preventDefault();
            return false;
        }
        return true;
    }
</script>

<form method={method} action={action} enctype={enctype} on:submit={submit} bind:this={form} ><slot></slot></form>
