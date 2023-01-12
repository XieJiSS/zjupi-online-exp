/** @format */

import { createApp } from "vue";

import { createRouter, createWebHashHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

import naive from "naive-ui";
import VueSimpleAlert from "vue3-simple-alert-next";

import App from "./App.vue";
import Access from "./Access.vue";
import AccessRedirect from "./AccessRedirect.vue";
import Admin from "./Admin.vue";
import Login from "./Login.vue";
import Register from "./Register.vue";
import CreatePlace from "./CreatePlace.vue";
import ManagePlace from "./ManagePlace.vue";
import ShowDevices from "./ShowDevices.vue";

import "./assets/style/font-awesome.css";

const routes: RouteRecordRaw[] = [
  {
    path: "/access/:code",
    component: Access,
    props: {
      rustdeskHostname: import.meta.env.VITE_RUSTDESK_HOSTNAME,
    },
  },
  { path: "/access", component: AccessRedirect },
  { path: "/admin", component: Admin },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/admin/createPlace", component: CreatePlace },
  { path: "/admin/managePlace/:place", component: ManagePlace },
  { path: "/admin/showDevices/:place", component: ShowDevices },
  { path: "/", component: Login },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

createApp(App).use(router).use(naive).use(VueSimpleAlert).mount(".app");

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $alert: typeof VueSimpleAlert.alert;
    $confirm: typeof VueSimpleAlert.confirm;
    $prompt: typeof VueSimpleAlert.prompt;
    $fire: typeof VueSimpleAlert.fire;
  }
}
