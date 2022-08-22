<script>
// @ts-check

import axios from 'axios'

export default {
  async beforeRouteUpdate(newRoutes) {
    this.ready = false
    const { remoteClient, camera, student } = await this.fetchStudentData(newRoutes.params.code)
    this.remoteClient = remoteClient
    this.camera = camera
    this.student = student
    this.ready = true
  },
  data() {
    return {
      ready: false,
      remoteClient: {
        id: null,
        password: null,
        relayAddr: null,
      },
      camera: {
        name: null,
        ip: null,
      },
      student: {
        name: null,
      },
    };
  },
  async mounted() {
    const { remoteClient, camera, student } = await this.fetchStudentData(this.$route.params.code)
    this.remoteClient = remoteClient
    this.camera = camera
    this.student = student
    this.ready = true
  },
  methods: {
    async fetchStudentData(code) {
      try {
        const { data } = await axios.get(`/api/link/${code}/all`, {
          responseType: "json",
        })
        if (!data.success) {
          throw new Error(data.message)
        }
        return data.data
      } catch (error) {
        console.error(error)
        return {
          remoteClient: null,
          camera: null,
          student: null,
        }
      }
    },
  },
}
</script>

<template>
  Hi!
  <div v-if="ready">
    <div v-if="student && student.name">Welcome, {{ student.name }}!</div>
    <div class="flex-container">
      <!-- two column, flex -->
      <div v-if="remoteClient && remoteClient.id">
        <h2>Remote Client</h2>
        <div>
          <i class="fa fa-user icon" id="icon"></i><span>{{ remoteClient.id }}</span>
        </div>
        <div>
          <i class="fa fa-lock icon"></i><span>{{ remoteClient.password }}</span>
        </div>
        <iframe src="http://{{ remoteClient.relayAddr }}" frameborder="0" scrolling="no" width="100%"
          height="90%"></iframe>
      </div>
      <div v-if="camera && camera.ip">
        <h2>Camera</h2>
        <iframe src="/api/camera-control/rtmp/{{ camera.id }}" frameborder="0" scrolling="no" width="100%"
          height="100%"></iframe>
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
