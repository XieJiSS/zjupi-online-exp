<script lang="ts">
import { defineComponent } from "vue"
import axios from "axios"

import type { PanelAccessRespData } from "../../../dts/panel/panel-server"
import type { AxiosResp } from "types/type-helper"

interface VueAppData {
  ready: boolean;
  remoteClient: PanelAccessRespData["remoteClient"] | null;
  camera: PanelAccessRespData["camera"] | null;
  student: PanelAccessRespData["student"] | null;
  hostname: string;
}

export default defineComponent({
  data(): VueAppData {
    return {
      ready: false,
      remoteClient: null,
      camera: null,
      student: null,
      hostname: location.hostname,
    }
  },
  async mounted() {
    if (typeof this.$route.params.code !== "string") {
      console.error("mounted: param `code` is not a string")
      return
    }
    const linkData = await this.fetchLinkData(this.$route.params.code);
    if (!linkData) {
      this.$alert("Failed to fetch link data", "Error", "error", {
        confirmButtonText: "OK",
      })
      return;
    }
    const { remoteClient, camera, student } = linkData;
    if (!remoteClient) {
      this.$alert("Remote client not found", "Error", "error", {
        confirmButtonText: "OK",
      })
      return;
    }
    if (!student) {
      this.$alert("This link is not assigned yet", "Error", "error", {
        confirmButtonText: "OK",
      })
      return;
    }
    this.remoteClient = remoteClient
    this.camera = camera
    this.student = student
    this.ready = true
  },
  methods: {
    async fetchLinkData(code: string): Promise<PanelAccessRespData | null> {
      if (!code) {
        return null
      }
      try {
        const { data } = await axios.get<AxiosResp<PanelAccessRespData>>(`/api/panel/access/${code}`, {
          responseType: "json",
        })
        if (!data.success) {
          throw new Error(data.message)
        }
        return data.data
      } catch (error) {
        console.error(error)
        return null
      }
    },
  },
});
</script>

<template>
  Hi!
  <div v-if="ready">
    <div v-if="student">Welcome, {{ student.name }}!</div>
    <div class="flex-container" v-if="camera">
      <!-- two column, flex -->
      <div v-if="remoteClient">
        <h2>Remote Client</h2>
        <div style="font-size: 16px; line-height: 18px;">
          工控机连接凭据：
          <i class="fa fa-user icon" id="icon"></i><span>{{ remoteClient.clientId }}</span>
          <span style="margin: 0 6px;"></span>
          <i class="fa fa-lock icon"></i><span>{{ remoteClient.password }}</span>
        </div>
        <iframe v-bind:src="`http://${hostname}:5005/`" frameborder="0" scrolling="no" width="100%"
          height="calc(100% - 20px);"></iframe>
      </div>
      <div>
        <h2>Camera</h2>
        <iframe v-bind:src="`http://${camera.ip}:4096/index.html`" frameborder="0" scrolling="no"
          width="100%" height="100%"></iframe>
      </div>
    </div>
    <div v-else>
      <div v-if="remoteClient">
        <h2>Remote Client</h2>
        <div style="font-size: 16px; line-height: 18px;">
          工控机连接凭据：
          <i class="fa fa-user icon" id="icon"></i><span>{{ remoteClient.clientId }}</span>
          <span style="margin: 0 6px;"></span>
          <i class="fa fa-lock icon"></i><span>{{ remoteClient.password }}</span>
        </div>
        <iframe v-bind:src="`http://${hostname}:5005/`" frameborder="0" scrolling="no" width="100%"
          height="calc(100% - 20px);"></iframe>
      </div>
    </div>
  </div>
  <div v-else>
    <div class="loader">
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        style="margin: auto; background: rgb(241, 242, 243); display: block;" width="200px" height="200px"
        viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
        <path fill="none" stroke="#85a2b6" stroke-width="8"
          stroke-dasharray="42.76482137044271 42.76482137044271"
          d="M24.3 30C11.4 30 5 43.3 5 50s6.4 20 19.3 20c19.3 0 32.1-40 51.4-40 C88.6 30 95 43.3 95 50s-6.4 20-19.3 20C56.4 70 43.6 30 24.3 30z"
          stroke-linecap="round" style="transform:scale(0.8);transform-origin:50px 50px">
          <animate attributeName="stroke-dashoffset" repeatCount="indefinite" dur="1s" keyTimes="0;1"
            values="0;256.58892822265625"></animate>
        </path>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.flex-container {
  display: flex;
  flex-direction: row;
}

.flex-container>div {
  margin: 0 2px;
}

.loader {
  z-index: 1;
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
}

.loader>svg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
