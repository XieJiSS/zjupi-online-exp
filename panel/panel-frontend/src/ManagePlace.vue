<!-- @format -->

<script lang="ts" setup>
import { ComputedRef, computed, onMounted, ref, watch } from "vue";
import type { Ref } from "vue";

import axios from "axios";
import type { AxiosResp, JSONTransform } from "types/type-helper";
import swal from "vue3-simple-alert-next";
import { useRoute, useRouter } from "vue-router";
import type {
  CameraDeviceModelResp,
  DevicePosition,
  DeviceEnum,
  RClientDeviceModelResp,
  UnifiedDeviceModelWrapperResp,
  VirtualDeviceModelWrapperResp,
  VirtualDeviceType,
} from "../../../dts/db/api/devices-api";
import type {
  PanelAdminPlaceDeviceGetRespData,
  PanelAdminPlaceDeviceListRespData,
  PanelAdminPlaceDeviceUpdateReqBody,
  PanelAdminPlaceGetRespData,
} from "../../../dts/panel/panel-server";
import { NCard, NButton, NModal, NForm, NFormItem, NInput, NSelect } from "naive-ui";
const router = useRouter();

const { alert: $alert, confirm: $confirm, prompt: $prompt, fire: $fire } = swal;

interface VueAppData {
  _devices: JSONTransform<PanelAdminPlaceDeviceListRespData>;
  unifiedDevices: JSONTransform<UnifiedDeviceModelWrapperResp>[];
  devices: {
    device: JSONTransform<UnifiedDeviceModelWrapperResp>;
    position: DevicePosition;
  }[];
  place: JSONTransform<PanelAdminPlaceGetRespData>;
}

const error = ref(false);
const ready = ref(false);
const editing = ref(false);
const editingDevice: Ref<{ id: string; type: DeviceEnum } | null> = ref(null);
const showNewDeviceModal = ref(false);
const placeId = ref("");
const place: Ref<JSONTransform<PanelAdminPlaceGetRespData> | null> = ref(null);
const newDeviceId = ref("");
const newDeviceType: Ref<VirtualDeviceType | ""> = ref("");

const _devices = ref([]) as Ref<VueAppData["_devices"]>;
const unifiedDevices: ComputedRef<VueAppData["unifiedDevices"]> = computed(() => {
  const unified: VueAppData["unifiedDevices"] = [];
  for (const device of _devices.value) {
    if (device.type === "camera") {
      unified.push({
        type: "camera" as DeviceEnum,
        device: {
          id: (device.device as CameraDeviceModelResp).cameraId,
          state: (device.device as CameraDeviceModelResp).online,
          value: 0,
        },
      });
    } else if (device.type === "rclient") {
      unified.push({
        type: "rclient" as DeviceEnum,
        device: {
          id: (device.device as RClientDeviceModelResp).clientId,
          state: (device.device as RClientDeviceModelResp).online,
          value: 0,
        },
      });
    } else {
      unified.push(device as VirtualDeviceModelWrapperResp);
    }
  }
  return unified;
});
const devices: Ref<VueAppData["devices"]> = ref([]);
watch(unifiedDevices, async (newVal, oldVal) => {
  console.log("unifiedDevices changed", newVal, oldVal);
  ready.value = false;

  let isPrefix = true;
  let isAppending = true;

  if (newVal.length < oldVal.length) {
    for (let i = 0; i < newVal.length; i++) {
      if (newVal[i]!.type !== oldVal[i]!.type || newVal[i]!.device.id !== oldVal[i]!.device.id) {
        isPrefix = false;
        break;
      }
    }
  } else {
    isPrefix = false;
  }

  if (newVal.length > oldVal.length) {
    for (let i = 0; i < oldVal.length; i++) {
      if (newVal[i]!.type !== oldVal[i]!.type || newVal[i]!.device.id !== oldVal[i]!.device.id) {
        isAppending = false;
        break;
      }
    }
  } else {
    isAppending = false;
  }

  if (isPrefix) {
    console.log("isPrefix");
    const diff = oldVal.length - newVal.length;
    for (let i = 0; i < diff; i++) {
      devices.value.pop();
    }
  }

  if (isAppending) {
    console.log("isAppending");
    const diff = newVal.length - oldVal.length;
    for (let i = 0; i < diff; i++) {
      const device = newVal[newVal.length - diff + i]!;
      devices.value.push({
        device,
        position: (await getPositionByDevice(device.device.id, device.type)) ?? {
          x: 0,
          y: 0,
        },
      });
    }
  }

  if (!isPrefix && !isAppending) {
    console.log("isNotPrefixOrAppending");
    devices.value = [];
    for (const device of newVal) {
      devices.value.push({
        device,
        position: (await getPositionByDevice(device.device.id, device.type)) ?? {
          x: 0,
          y: 0,
        },
      });
    }
  }

  ready.value = true;
  drawDevicesOnCanvas(document.getElementById("place-canvas") as HTMLCanvasElement);
});

async function getPositionByDevice(deviceId: string, type: DeviceEnum) {
  const resp = await axios.get<AxiosResp<PanelAdminPlaceDeviceGetRespData>>(
    `/api/panel/admin/place/${placeId.value}/device/${type}/${deviceId}/get`
  );
  if (resp.data.success) {
    return resp.data.data.position;
  } else {
    return null;
  }
}

onMounted(async () => {
  const route = useRoute();
  console.log(route.params);

  if (typeof route.params.place !== "string") {
    await $alert("Error: 没有提供 place 参数", "出错了", "error");
    return;
  }

  placeId.value = route.params.place;
  const resp = await axios.get<AxiosResp<PanelAdminPlaceGetRespData>>(`/api/panel/admin/place/${placeId.value}/get`);
  if (!resp.data.success) {
    $alert("Error: " + resp.data.message, "出错了", "error");
    error.value = true;
    return;
  }
  place.value = resp.data.data;
  await loadAllDevices();
  ready.value = true;

  console.log(devices.value);
});

async function axiosGet<T>(url: string, params: Record<string, any> = {}): Promise<AxiosResp<T>> {
  const { data } = await axios
    .get<AxiosResp<T>>(url, {
      params,
    })
    .catch((err) => {
      console.error(err);
      return { data: { success: false, message: err.toString() } as AxiosResp<T> };
    });
  if (!data.success && data.message === "Authentication required") {
    await router.push("/login");
    return data;
  }
  return data;
}
async function axiosPost<T>(url: string, body: Record<string, any> = {}): Promise<AxiosResp<T>> {
  const { data } = await axios.post<AxiosResp<T>>(url, body).catch((err) => {
    console.error(err);
    return { data: { success: false, message: err.toString() } as AxiosResp<T> };
  });
  if (!data.success && data.message === "Authentication required") {
    await router.push("/login");
    return data;
  }
  return data;
}

async function loadAllDevices() {
  const resp = await axiosGet<PanelAdminPlaceDeviceListRespData>(`/api/panel/admin/place/${placeId.value}/device/list`);
  if (!resp.success) {
    await $alert("Error: " + resp.message, "出错了", "error");
    return;
  }
  _devices.value = resp.data;
}

async function createDevice(deviceId: string, type: VirtualDeviceType) {
  const resp = await axiosPost<void>(`/api/panel/admin/place/${placeId.value}/device/${type}/${deviceId}/create`, {
    type,
    deviceId,
  });
  if (!resp.success) {
    await $alert("Error: " + resp.message, "出错了", "error");
    return false;
  }
  _devices.value = [];
  await loadAllDevices();
  return true;
}

async function handleCreateNewDevice() {
  showNewDeviceModal.value = false;
  if (newDeviceId.value === "") {
    await $alert("请输入设备 ID", "出错了", "error");
    return;
  }
  if (newDeviceType.value === "") {
    await $alert("请选择设备类型", "出错了", "error");
    return;
  }
  const newDevice = {
    id: newDeviceId.value,
    type: newDeviceType.value,
  };
  const succ = await createDevice(newDeviceId.value, newDeviceType.value);
  if (succ) {
    editing.value = true;
    editingDevice.value = newDevice;
  }
}

const newDevicePos: Ref<DevicePosition | null> = ref(null);

async function handleCanvasClick(event: MouseEvent) {
  event.preventDefault();
  if (!editing.value || !editingDevice.value) {
    await $alert("Error: 当前没有任何设备处于被编辑状态", "出错了", "error");
    return;
  }

  const canvas = event.target as HTMLCanvasElement;

  const xPixel = event.offsetX;
  const yPixel = event.offsetY;
  console.log(xPixel, yPixel);

  const x = xPixel / canvas.width;
  const y = yPixel / canvas.height;
  console.log(x, y);

  newDevicePos.value = {
    x,
    y,
  };
}

async function savePosition(event: MouseEvent) {
  event.preventDefault();
  if (!editingDevice.value) {
    await $alert("Error: 当前没有任何设备处于被编辑状态", "出错了", "error");
    return;
  }
  if (!newDevicePos.value) {
    await $alert("Error: 请在画布上点击以设定位置", "出错了", "error");
    return;
  }

  const body: PanelAdminPlaceDeviceUpdateReqBody = {
    position: newDevicePos.value,
  };
  const resp = await axiosPost<void>(
    `/api/panel/admin/place/${placeId.value}/device/${editingDevice.value.type}/${editingDevice.value.id}/update`,
    body
  );
  if (!resp.success) {
    await $alert("Error: " + resp.message, "出错了", "error");
    return;
  }
  await $alert("保存成功", "成功", "success");
  editing.value = false;
  editingDevice.value = null;
  _devices.value = [];
  await loadAllDevices();
}

const DEVICE_IMAGE_TEXT: Record<DeviceEnum, string> = {
  camera: "摄像",
  rclient: "电脑",
  lamp: "灯",
  doorlock: "门锁",
  sensor: "传感",
  switch: "开关",
};

const VIRT_DEVICE_OPTIONS: { value: VirtualDeviceType; label: string }[] = [
  {
    value: "lamp" as VirtualDeviceType,
    label: "灯",
  },
  {
    value: "doorlock" as VirtualDeviceType,
    label: "门锁",
  },
  {
    value: "sensor" as VirtualDeviceType,
    label: "传感器",
  },
  {
    value: "switch" as VirtualDeviceType,
    label: "开关",
  },
];

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function drawDevicesOnCanvas(canvas: HTMLCanvasElement) {
  console.log("addDevicesToCanvas");
  if (!ready.value) {
    await sleep(40);
  }
  const ctx = canvas.getContext("2d")!;
  const { width, height } = canvas;
  ctx.font = "16px Arial";
  ctx.fillStyle = "black";
  for (const device of devices.value) {
    // use text
    const { x, y } = device.position;
    ctx.fillText(DEVICE_IMAGE_TEXT[device.device.type], x * width, y * height);
    console.log("draw", device.device.type, x, y);
  }
  ctx.fill();
}

async function drawImageAsCanvasBg(canvas: HTMLCanvasElement, image: HTMLImageElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }
  const { width } = canvas;
  const { naturalWidth, naturalHeight } = image;
  const xRatio = width / naturalWidth;
  const newCanvasHeight = naturalHeight * xRatio;

  canvas.setAttribute("height", newCanvasHeight.toString());
  const { height } = canvas;
  ctx.drawImage(image, 0, 0, width, height);
}

function loadImageDataUrl(data: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      resolve(image);
    };
    image.onerror = (err) => {
      reject(err);
    };
    image.src = data;
  });
}

watch(place, async (newVal) => {
  if (!newVal) {
    return;
  }
  const canvas = document.getElementById("place-canvas") as HTMLCanvasElement;
  const image = await loadImageDataUrl(newVal.image);
  await drawImageAsCanvasBg(canvas, image);
});
</script>

<template>
  <div class="container">
    <n-card title="场所布局">
      <template #header-extra>
        <n-button size="small" @click="$router.back()">返回</n-button>
      </template>
      <n-button @click="showNewDeviceModal = true">创建设备</n-button>
      <canvas id="place-canvas" width="350" height="200" v-bind:class="editing ? 'canvas-clickable' : ''"
        @click="handleCanvasClick"></canvas>
      <n-button v-if="editing" type="primary" @click="savePosition">确认位置</n-button>
    </n-card>
  </div>
  <n-modal v-model:show="showNewDeviceModal">
    <n-card class="card-model" title="新建设备" :bordered="false" size="huge" role="dialog" aria-modal="true">
      <n-form>
        <n-form-item label="设备类型">
          <n-select v-model:value="newDeviceType" :options="VIRT_DEVICE_OPTIONS" clearable />
        </n-form-item>
        <n-form-item label="设备名称">
          <n-input v-model:value="newDeviceId" clearable />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-button type="primary" @click="handleCreateNewDevice">新建</n-button>
      </template>
    </n-card>
  </n-modal>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding-top: 10vh;
}

.n-card {
  max-width: 450px;
}

.card-modal {
  width: 400px;
}

.canvas-clickable {
  cursor: pointer;
}

#place-canvas {
  margin-top: 12px;
}
</style>
