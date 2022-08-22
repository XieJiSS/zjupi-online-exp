<script>
// @ts-check

import pbkdf2 from "crypto-js/pbkdf2";

export default {
  data() {
    return {
      username: "",
      password: "",
    };
  },
  computed: {
    passwordHash() {
      // @ts-ignore
      return this.calculatePasswordHash(this.password);
    }
  },
  methods: {
    submitLogin() {
      console.log(this.passwordHash);
      // @TODO: Verify & send login request to server
    },
    calculatePasswordHash(password) {
      const salt = "PI.ZJU_salt";
      const iterations = 1000;
      const keylen = 32;
      const digest = "sha256";
      return pbkdf2(password, salt, iterations, keylen, digest).toString();
    },
  },
};
</script>

<template>
  <h2>Admin Login</h2>
  <form>
    <div>
      <i class="fa fa-user icon" id="icon"></i><input type="text" v-model="username" id="username"
        placeholder="username">
    </div>
    <div>
      <i class="fa fa-lock icon"></i><input type="password" v-model="password" placeholder="password">
    </div>
    <div class="submit">
      <input class="submit-primitive" type="submit" value="LOGIN" v-on:click.prevent="submitLogin">
    </div>
  </form>
</template>

<style>
@import "./assets/style/login.css";

h2 {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
}
</style>
