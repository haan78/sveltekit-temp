<script>
// @ts-nocheck

    import { onMount } from 'svelte';
    let _message = "";

    export function message(message,time) {
        if (message) {
            _message = message;
            if (time) {
                setTimeout(()=>{
                    _message = "";
                },time)
            }
        } else {
            _message = "";    
        }
        
    }
    export let reqired = false;
    export let caption = "";
    export let title = "";
    export let info = "";
    export let position = "top";
    export let width = "100%";

    onMount(()=>{

    });
</script>
<div class="FormInput" style={'width:'+width}>
    <label title={title||caption}>
        <span data-pos={position}>{reqired ? '*' : ''}{caption}</span>
        <slot></slot>
        <div>
            {#if info && !_message}
            <i role={"info"}>{info}</i>
            {/if}
            {#if _message}
            <i role="alert">{_message}</i>
            {/if}
        </div>

        
    </label>
</div>


<style>

    .FormInput {
        display: inline-block;
    }
    .FormInput > label {
        display: block;
        margin-bottom: 1em;
    }

    .FormInput > label > span[data-pos=top] {
        display: block;
    }

    .FormInput > label > span[data-pos=left] {
        display: inline-block;
        margin-right: .5em;
    }

    .FormInput > label > div {
        display: block;        
        white-space: normal;
        width: 100%;
        height: 1.5em;
    }

    .FormInput > label > div > i {
        font-size: smaller;
    }

    .FormInput > label > div > i[role=alert] {
        color: var(--cl-bad);
        font-weight: bold;
    }

</style>
