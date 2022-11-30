// @ts-check

import { createApp } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";
import VueSimpleAlert from "vue3-simple-alert-next";

import type { RouteRecordRaw } from "vue-router";

import App from "./App.vue";
import Access from "./Access.vue";
import Admin from "./Admin.vue";
import Login from "./Login.vue";
import Register from "./Register.vue";

import "./assets/style/font-awesome.css";

const routes: RouteRecordRaw[] = [
  { path: "/access/:code", component: Access },
  { path: "/admin", component: Admin },
  { path: "/login", component: Login },
  { path: "/pizju_register", component: Register },
  { path: "/", component: Login },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

createApp(App).use(router).use(VueSimpleAlert).mount(".app");

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $alert: typeof VueSimpleAlert.alert;
    $confirm: typeof VueSimpleAlert.confirm;
    $prompt: typeof VueSimpleAlert.prompt;
    $fire: typeof VueSimpleAlert.fire;
  }
}

const x: import("../../../dts/panel/panel-server").RemoteClientInterface = {
  clientId: 0,
  aha: "x",
};
