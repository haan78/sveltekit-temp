<main>
    <FormContainer validate={validate}>    
        <FormInput>
            <span slot="label" >Ad</span>
            <input name="ad" type="text" slot="input"/>
        </FormInput>
        <br/>
        <FormInput bind:this={fi_soyad} position="left" >
            <span slot="label" >Soyad</span>
            <input name="soyad" type="text" slot="input"/>
            <span slot="info">Selam</span>
        </FormInput>
        <br/>
        <input type="date" name="tarih1" /><br/>
        <input type="datetime-local" name="tarih3" /><br/>
        <input type="text" name="giris" placeholder="Selam" /><br/>
        <FormInput>
            <span slot="label" >Liste</span>
            <select slot="input">
                <option>OP1</option>
                <option>OP2</option>
                <option>OP3</option>
            </select>
        </FormInput>
        <br/>
        <CheckBox bind:checked={checkbox_val} position="left" name="cb1">{(checkbox_val ? "EVET" : "HAYIR")}</CheckBox>

        <br/>
    <button type="submit" class="btn prm"><LogInIcon size="1x"></LogInIcon>Kaydet</button>
    <button type="button" class="btn bad"><ActivityIcon size="1x"></ActivityIcon>Kaydet</button>
    <button type="button" class="btn ugly"><SaveIcon size="1x"></SaveIcon> Kaydet</button>
    
    <button type="button" class="btn good">Kaydet</button>
    </FormContainer>
    
</main>
<script>
// @ts-nocheck
    
    import FormInput from '$lib/comp/FormInput.svelte';
    import FormContainer from '$lib/comp/FormContainer.svelte';
    import { onMount } from 'svelte';    
    import { ActivityIcon,SaveIcon,LogInIcon } from 'svelte-feather-icons'
    import CheckBox from '$lib/comp/CheckBox.svelte';
    let fi_soyad;
    let checkbox_val = true;
    function validate() {
        console.log("burda");
        fi_soyad.message("Beğenmedim",3000);
        return false;
    }
    onMount(()=>{

    });
</script>
<style>
    @import "$lib/comp/theme.css";
    @import "$lib/comp/Button.css";
</style>