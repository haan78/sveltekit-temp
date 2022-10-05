<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";

    export let src: string = "";
    export let disabled = false;
    export let accept = "image/jpeg, image/png";
    export let name = "";
    export let info = {        
        type:"",
        size:0
    };
    
    let input: HTMLInputElement;
    let evnton = createEventDispatcher();
    let status = "loading";
    let errorMessage = "";
    let base64data: string;

    function setImage(b64data:string,filetype:string,filesize:number) {
        base64data = b64data;
        info.type = filetype;
        info.size = filesize;
        status = "ready";
        evnton("change", {base64data:base64data,type:info.type,size:info.size});
    }

    function setError(err:Error) {
        status = "error";
        errorMessage = err.message;
        evnton("error", err);
    }

    function imgchange(evt: Event) {
        if ((<HTMLInputElement>evt.target).files) {
            const fl: FileList = <FileList>(<HTMLInputElement>evt.target).files;
            if (fl.length) {
                setImage(URL.createObjectURL(fl[0]),fl[0].type,fl[0].size);
            }
        }
    }

    function load(src:string) {
        fetch(src)
            .then((response) => {
                if (response.status == 200) {
                    response
                        .blob()
                        .then((bdata) => {
                            console.log(bdata.type);
                            if (bdata.type.startsWith("image")) {                                
                                const reader = new FileReader();
                                reader.addEventListener("load", () => {                                    
                                    setImage(<string>reader.result,bdata.type,bdata.size);                                    
                                });
                                reader.readAsDataURL(bdata);
                            } else {
                                setError(new Error(`${bdata.type} is not an acceptable type`));
                            }
                        })
                        .catch((err) => {
                            setError(err);
                        });
                } else {
                    setError(new Error(response.statusText));                    
                }
            })
            .catch((err) => {
                setError(err);
            });
    }

    onMount(() => {
        errorMessage = "";
        if (src) {
            load(src);
        } else {
            status = "empty";
        }
    });
</script>

<div class={`ImageUpload ${disabled ? 'dis' : ''}`} on:click={() => { if (!disabled) input.click();}}>
    <input
        {name}
        {accept}
        type="file"        
        on:change={imgchange}
        style="display: none;"
        bind:this={input}
    />
    {#if status == "ready"}
        <slot name="ready" src={base64data} />
    {:else if status == "loading"}
        <slot name="loading" />
    {:else if status == "error"}
        <slot name="error" message={errorMessage} />
    {:else}
        <slot name="empty" />
    {/if}
</div>


<style>
    .ImageUpload {
        display: inline-block;
        cursor: pointer;
    }
    .ImageUpload.dis {
        cursor: not-allowed;
    }
</style>
