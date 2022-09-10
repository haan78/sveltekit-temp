<fieldset class="login">
    <legend>Login</legend>
    <form method="POST" action="/enter">
        <div>
            <label for="user">User</label><br/>
            <input id="user" type="text" name="user" />
        </div>
        <div>
            <label for="pass">Password</label><br/>
            <input id="pass" type="password" name="password" />
        </div>
        <button type="submit">ENTER</button>
    </form>
</fieldset>
<style>
    .login {
        width: 12em;
        padding: 1em;
    }
    .login > form > div > input {
        width: 100%;
    }
    .login > form > button {
        width: 100%;
    }
    .login > form > div {
        margin-bottom: 1em;
    }
</style>