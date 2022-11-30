<script lang="ts">
import { defineComponent } from "vue"
import axios from "axios"

import type { PanelAccessRespData } from "../../../dts/panel/panel-server"
import type { AxiosResp } from "types/type-helper"

export default defineComponent({
  async beforeRouteUpdate(newRoutes) {
    if (typeof newRoutes.params.code !== "string") {
      console.error("beforeRouteUpdate: param `code` is not a string")
      return
    }
    this.ready = false
    const linkData = await this.fetchLinkData(newRoutes.params.code);
    if (!linkData) {
      this.$alert("Failed to fetch link data", "Error", "error", {
        confirmButtonText: "OK",
        onAfterClose: () => {
          this.$router.push({ name: "panel" })
        },
      })
      return;
    }
    const { remoteClient, camera, student } = linkData;
    this.remoteClient = remoteClient
    this.camera = camera
    this.student = student
    this.ready = true
  },
  data() {
    return {
      ready: false,
      remoteClient: {
        clientId: null,
        password: null,
        ip: null,
      },
      camera: {
        cameraId: null,
        ip: null,
      },
      student: {
        name: null,
      },
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
        onAfterClose: () => {
          this.$router.push({ name: "panel" })
        },
      })
      return;
    }
    const { remoteClient, camera, student } = linkData;
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
    <div v-if="student && student.name">Welcome, {{ student.name }}!</div>
    <div class="flex-container">
      <!-- two column, flex -->
      <div v-if="remoteClient && remoteClient.clientId">
        <h2>Remote Client</h2>
        <div>
          <i class="fa fa-user icon" id="icon"></i><span>{{ remoteClient.clientId }}</span>
        </div>
        <div>
          <i class="fa fa-lock icon"></i><span>{{ remoteClient.password }}</span>
        </div>
        <iframe src="http://10.115.10.123:5005/" frameborder="0" scrolling="no" width="100%"
          height="90%"></iframe>
      </div>
      <div v-if="camera && camera.ip">
        <h2>Camera</h2>
        <iframe v-bind:src="'/api/camera-control/rtmp/' + camera.cameraId" frameborder="0" scrolling="no"
          width="100%" height="100%"></iframe>
      </div>
    </div>
  </div>
  <div v-else>
    <div class="loader"></div>
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
</style>
