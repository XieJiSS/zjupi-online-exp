declare module "*.vue" {
  import Vue, { DefineComponent } from "vue";
  const component: DefineComponent & typeof Vue;
  export default component;
}
