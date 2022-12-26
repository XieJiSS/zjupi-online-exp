<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  data() {
    return {};
  },
  async mounted() {
    try {
      const code = await this.$prompt("请输入访问码：", "");
      if (!code) {
        return;
      }
      this.$router.push(`/access/${code}`);
    } catch (err) {
      console.error(err);
    }
  },
});
</script>

<template>
</template>
