<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  data() {
    return {};
  },
  async mounted() {
    const code = await this.$prompt("Please enter the access code", "");
    if (!code) {
      return;
    }
    this.$router.push(`/access/${code}`);
  },
});
</script>

<template>
</template>
