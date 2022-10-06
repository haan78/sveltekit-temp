<main>
    <FormContainer validate={validate} bind:form={form}>    
        <Auto bind:value={auto} name="auto" list={['Ali','Ali Veli','Deli','Barış','Barış Öztürk']}/>
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
        <div>
            <img style={`object-fit:${group}`} class="img1" src={src || "/siktir.jpg" } alt="Bulunamadi" on:click={ ()=>infile.open() }  /><br/>
            <Radio bind:group={group} name="raido" value="none">None</Radio>
        <Radio bind:group={group} name="raido" value="scale-down">scale-down</Radio>
        <Radio bind:group={group} name="raido" value="cover">cover</Radio>
        <Radio bind:group={group} name="raido" value="contain">contain</Radio>
        <Radio bind:group={group} name="raido" value="fill">fill</Radio>
        </div>
        
    <button type="submit" class="btn prm"><LogInIcon size="1x"></LogInIcon>Kaydet</button>
    <button type="button" class="btn bad"><ActivityIcon size="1x"></ActivityIcon>Kaydet</button>
    <button type="button" class="btn ugly"><SaveIcon size="1x"></SaveIcon> Kaydet</button>
    
    <button type="button" class="btn good">Kaydet</button>
    </FormContainer>
    <InputFile name="dosya2" bind:this={infile} bind:src={src} />

    
</main>
<script>
// @ts-nocheck
    import Auto from '$lib/comp/Auto.svelte';
    import FormInput from '$lib/comp/FormInput.svelte';
    import FormContainer from '$lib/comp/FormContainer.svelte';
    import { onMount } from 'svelte';    
    import { ActivityIcon,SaveIcon,LogInIcon } from 'svelte-feather-icons'
    import CheckBox from '$lib/comp/CheckBox.svelte';
    import Radio from '$lib/comp/Radio.svelte';
    import InputFile from '$lib/comp/InputFile.svelte';
    let form;
    let fi_soyad;
    let checkbox_val = true;
    let group = "A";
    let auto = "";
    let src = "";
    let infile;
    function validate() {
        return true;
        /*console.log("burda");
        fi_soyad.message("Beğenmedim",3000);
        return false;*/
    }
    onMount(()=>{
        
    });
</script>
<style>
    @import "$lib/comp/theme.css";
    @import "$lib/comp/Button.css";

    .img1 {
        width: 200px;
        height: 200px;
        border-radius: .8em;
        filter: drop-shadow(1em 1em .8em black);
        cursor: pointer;
        border: .2em silver solid;
    }


</style>