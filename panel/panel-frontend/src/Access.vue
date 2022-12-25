<script lang="ts">
import { defineComponent } from "vue";
import axios from "axios";

import type { PanelAccessRespData } from "../../../dts/panel/panel-server";
import type { AxiosResp, JSONTransform } from "types/type-helper";

interface VueAppData {
  ready: boolean;
  remoteClient: JSONTransform<PanelAccessRespData>["remoteClient"] | null;
  camera: JSONTransform<PanelAccessRespData>["camera"] | null;
  student: JSONTransform<PanelAccessRespData>["student"] | null;
}

export default defineComponent({
  data(): VueAppData {
    return {
      ready: false,
      remoteClient: null,
      camera: null,
      student: null,
    };
  },
  async mounted() {
    if (typeof this.$route.params.code !== "string") {
      console.error("mounted: param `code` is not a string");
      return;
    }
    const linkData = await this.fetchLinkData(this.$route.params.code);
    if (!linkData) {
      this.$alert("Failed to fetch link data", "Error", "error", {
        confirmButtonText: "OK",
      });
      return;
    }
    const { remoteClient, camera, student } = linkData;
    if (!remoteClient) {
      this.$alert("Remote client not found", "Error", "error", {
        confirmButtonText: "OK",
      });
      return;
    }
    if (!student) {
      this.$alert("This link is not assigned yet", "Error", "error", {
        confirmButtonText: "OK",
      });
      return;
    }
    this.remoteClient = remoteClient;
    this.camera = camera;
    this.student = student;
    this.ready = true;
  },
  methods: {
    async fetchLinkData(code: string) {
      if (!code) {
        return null;
      }

      try {
        const { data } = await axios.get<AxiosResp<PanelAccessRespData>>(`/api/panel/access/${code}`, {
          responseType: "json",
        });
        if (!data.success) {
          throw new Error(data.message)
        }
        return data.data;
      } catch (error) {
        console.error(error);
        return null;
      }
    },
  },
  props: {
    rustdeskHostname: {
      type: String,
      required: true,
    },
  },
});
</script>

<template>
  <div v-if="ready">
    <div class="grid-container" v-if="camera">
      <!-- two column, flex -->
      <div class="remote-client-area remote-client-grid" v-if="remoteClient">
        <div class="header-info">
          工控机连接凭据：
          <i class="fa fa-user icon" id="icon"></i>远程 ID:&nbsp;<span>{{ remoteClient.clientId }}</span>
          <span style="margin: 0 6px;">&nbsp;</span>
          <i class="fa fa-lock icon"></i>密码:&nbsp;<span>{{ remoteClient.password }}</span>
        </div>
        <iframe v-bind:src="`http://${rustdeskHostname}:5005/`" frameborder="0" scrolling="no"></iframe>
      </div>
      <div class="camera-area camera-grid">
        <iframe id="camera-iframe" v-bind:src="`http://${camera.ip}:4096/index.html`" frameborder="0"
          scrolling="no"></iframe>
      </div>
    </div>
    <div v-else>
      <div class="remote-client-area remote-client-full" v-if="remoteClient">
        <div class="header-info">
          工控机连接凭据：
          <i class="fa fa-user icon" id="icon"></i>远程 ID:&nbsp;<span>{{ remoteClient.clientId }}</span>
          <span style="margin: 0 6px;">&nbsp;</span>
          <i class="fa fa-lock icon"></i>密码:&nbsp;<span>{{ remoteClient.password }}</span>
        </div>
        <iframe v-bind:src="`http://${rustdeskHostname}:5005/`" frameborder="0" scrolling="no"></iframe>
      </div>
    </div>
  </div>
  <div v-else>
    <div class="loader">
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        style="margin: auto; background: rgba(0, 0, 0, 0); display: block;" width="200px" height="200px"
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
.grid-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 10px;
  height: 100%;
}

.grid-container>div {
  margin: 0 4px;
}

.camera-area iframe {
  height: 500px;
  width: 100%;
}

.remote-client-area iframe {
  height: calc(100vh - 20px);
  width: 100%;
}

.header-info {
  font-size: 16px;
  line-height: 18px;
  padding: 6px 0 6px 4px;
}

.remote-client-area .header-info {
  background-color: #2196f3;
  color: white;
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

.fa.icon {
  margin-right: 2px;
}
</style>
