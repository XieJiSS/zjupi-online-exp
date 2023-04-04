<script lang="ts">
import Swal from "sweetalert2";
import { defineComponent } from "vue";

export default defineComponent({
  data() {
    return {};
  },
  async mounted() {
    try {
      const code = await this.$prompt("请输入访问码：", "", "Panel", "question", {
        allowOutsideClick: false,
      });
      if (!code) {
        return;
      }
      this.$router.push(`/access/${code}`);
    } catch (err) {
      if (err) {
        console.error(err);
      }
    }
  },
  async beforeRouteLeave() {
    // close swal
    Swal.close();
  },
});
</script>

<template></template>
