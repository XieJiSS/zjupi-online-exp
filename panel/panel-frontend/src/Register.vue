<script>
// @ts-check

import pbkdf2 from "crypto-js/pbkdf2";
import axios from "axios";

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
    async submitRegister() {
      const { data } = await axios.post("/api/panel/admin/register", {
        username: this.username,
        password: this.passwordHash,
      }).catch(err => {
        console.error(err);
        return { data: { success: false, message: err.toString() } };
      });
      if (!data.success) {
        alert(data.message);
        return;
      }
      this.$router.push("/login");
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
  <h2>Admin Register</h2>
  <form>
    <div>
      <i class="fa fa-user icon" id="icon"></i><input type="text" v-model="username" id="username"
        placeholder="username">
    </div>
    <div>
      <i class="fa fa-lock icon"></i><input type="password" v-model="password" placeholder="password">
    </div>
    <div class="submit">
      <input class="submit-primitive" type="submit" value="REGISTER" v-on:click.prevent="submitRegister">
    </div>
  </form>
</template>

<style scoped>
@import "./assets/style/login-scoped.css";

h2 {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
}
</style>

<style>
@import "./assets/style/login-noscope.css";
</style>
