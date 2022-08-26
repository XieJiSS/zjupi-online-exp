// @ts-check

import { createApp } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";

import App from "./App.vue";
import Access from "./Access.vue";
import Admin from "./Admin.vue";
import Login from "./Login.vue";
import Register from "./Register.vue";

import "./assets/style/font-awesome.css";

const routes = [
  { path: "/access/:code", component: Access },
  { path: "/admin", component: Admin },
  { path: "/login", component: Login },
  { path: "/pizju_register", component: Register },
  { path: "/", component: Login },
];

const router = createRouter({
  history: createWebHashHistory(),
  // @ts-ignore
  routes,
});

// @ts-ignore
createApp(App).use(router).mount(".app");
