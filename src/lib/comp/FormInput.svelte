<script lang="ts">
    import { onMount } from "svelte";
    let _message = "";

    export function message(message: string = "", time: number = 0) {
        if (message) {
            _message = message;
            if (time) {
                setTimeout(() => {
                    _message = "";
                }, time);
            }
        } else {
            _message = "";
        }
    }
    export let title = "";
    export let position = "top";

    onMount(() => {
        _message = "";
    });
</script>

<label class="FormInput" data-pos={position} title={title ?? ""}>
    <span class="lbl">
        <slot name="label" />
    </span>
    <span class="inp">
        <slot name="input" /> <br />
        {#if !_message}
            <i class="subline info"><slot name="info" /></i>
        {:else}
            <i class="subline alert">{_message}</i>
        {/if}
    </span>
</label>

<style>
    .FormInput {
        margin-bottom: 1em;
        display: flex;
        flex-wrap: nowrap;
        flex-direction: column;
        vertical-align: middle;
        align-items: flex-start;
        width: 100%;
        padding: var(--di-in-default);
    }

    .FormInput[data-pos=left] {
        flex-direction: row;
    }

    .FormInput[data-pos=left] > span.lbl {
        margin-right: var(--di-in-default);
    }

    .FormInput[data-pos=top] > span.lbl {
        margin-bottom: cal(var(--di-in-default)/2);
    }

    .FormInput > span.lbl {
        font-weight: bold;
    }

    .FormInput > span.inp {
        height: 1.5em;
    }

    .FormInput > span.inp > .subline {
        font-size: smaller;
    }

    .FormInput > span.inp > .subline.info {
        color: var(--cl-tx-info);
    }

    .FormInput > span.inp > .subline.alert {
        color: var(--cl-tx-bad);
        font-weight: bold;
    }
</style>
