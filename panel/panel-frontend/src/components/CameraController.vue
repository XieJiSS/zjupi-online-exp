<script lang="ts" setup>
import { onMounted, ref, defineProps } from "vue";
import axios from "axios";
import swal from "vue3-simple-alert-next";

import type { PanelAccessLinkCameraControlReqBody, CameraDirection, CameraOperation } from "../../../../dts/panel/panel-server";
import type { AxiosResp } from "types/type-helper";

const props = defineProps<{
  accessCode: string | null;
}>();

const speed = ref<number>(40);
const cameraControlDelayNotified = ref<"no" | "pending" | "yes">("no");

onMounted(async () => {
  if (typeof props.accessCode !== "string" || !props.accessCode) {
    console.error("param `code` is not valid");
    return;
  }
});

async function controlCamera(direction: CameraDirection, operation: CameraOperation) {
  if (cameraControlDelayNotified.value === "no") {
    cameraControlDelayNotified.value = "pending";
    await swal.alert("摄像头操控与回传存在 8-10 秒延迟，请耐心等待调整效果回馈至画面", "提示", "warning", {
      confirmButtonText: "好的",
    });
    cameraControlDelayNotified.value = "yes";
    return;
  } else if (cameraControlDelayNotified.value === "pending") {
    return;
  }
  const cameraSpeed = speed.value;
  let body: PanelAccessLinkCameraControlReqBody;
  if (operation === "start") {
    body = {
      direction,
      operation,
      speed: cameraSpeed,
    };
  } else {
    body = {
      direction: void 0,
      operation,
    };
  }
  const resp = (await axios.post<AxiosResp<void>>(
    `/api/panel/access/${props.accessCode}/camera-control`,
    body,
  )).data;
  if (!resp.success) {
    console.error(resp.message);
  }
}
</script>

<template>
  摄像头方向控制：
  <div class="camera-controller">
    <!-- @TODO: -->
    <!-- <div class="camera-controller-speed"></div> -->
    <div class="camera-controller-direction">
      <div class="camera-controller-up">
        <button class="btn camera-controller-up-button" @mousedown="controlCamera('up', 'start')"
          @mouseup="controlCamera('up', 'stop')">上</button>
      </div>
      <div class="camera-controller-left">
        <button class="btn camera-controller-left-button" @mousedown="controlCamera('left', 'start')"
          @mouseup="controlCamera('left', 'stop')">左</button>
      </div>
      <div class="camera-controller-down">
        <button class="btn camera-controller-down-button" @mousedown="controlCamera('down', 'start')"
          @mouseup="controlCamera('down', 'stop')">下</button>
      </div>
      <div class="camera-controller-right">
        <button class="btn camera-controller-right-button" @mousedown="controlCamera('right', 'start')"
          @mouseup="controlCamera('right', 'stop')">右</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.camera-controller {
  /* 2 row, 3 column, 32px * 32px for one grid */
  display: grid;
  grid-template-rows: repeat(2, 1fr);
  grid-template-columns: repeat(3, 1fr);

  width: 120px;
  height: 80px;
}

/* .camera-controller-speed {
  grid-column: 1 / 3;
  grid-row: 1;
} */

.camera-controller-direction {
  display: grid;
  grid-column: 1 / 3;
  grid-row: 1 / 2;
  margin-top: 6px;
}

.camera-controller-direction>div {
  display: flex;
  justify-content: center;
  align-items: center;
}

.camera-controller-up {
  grid-column: 2;
  grid-row: 1;
}

.camera-controller-left {
  grid-column: 1;
  grid-row: 2;
}

.camera-controller-down {
  grid-column: 2;
  grid-row: 2;
}

.camera-controller-right {
  grid-column: 3;
  grid-row: 2;
}

.camera-controller-direction>.btn {
  width: 100%;
  height: 100%;
  font-size: 20px;
  font-weight: bold;
  width: 34px;
  height: 38px;
}

.btn {
  position: relative;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  padding: 6px 6px;
  border: 1px solid #acb2b8;
  border-radius: 4px;
  background-color: #efefef;
  color: black;
  -webkit-user-drag: none;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  transition: 0.1s all;
  -webkit-transition: 0.1s all;
  -moz-transition: 0.1s all;
  -o-transition: 0.1s all;
}

.btn:hover {
  border: 1px solid #888a8d;
  background-color: rgba(0, 0, 0, .04);
}

.btn:active {
  background-color: rgba(0, 0, 0, .06);
}
</style>
