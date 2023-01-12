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
const showDetailModal = ref(false);
const placeId = ref("");
const place: Ref<JSONTransform<PanelAdminPlaceGetRespData> | null> = ref(null);

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

const detailDevice: Ref<UnifiedDeviceModelWrapperResp | null> = ref(null);

const typeValue = ref("");

const idLabel = ref("");
const idValue = ref("");

const stateLabel = ref("");
const stateValue = ref("");
const stateConfigurable = ref(false);

const showDetailValue = ref(false);
const valueLabel = ref("");
const valueValue = ref("");
const valueConfigurable = ref(false);

const stateOptions = [
  {
    label: "开",
    value: "on",
  },
  {
    label: "关",
    value: "off",
  },
];

function showDeviceDetail(device: UnifiedDeviceModelWrapperResp) {
  console.log("showDeviceDetail", device);
  switch (device.type) {
    case "camera":
      typeValue.value = "摄像头";
      idLabel.value = "摄像头 ID";
      idValue.value = device.device.id;
      stateLabel.value = "状态";
      stateValue.value = device.device.state ? "在线" : "离线";
      showDetailValue.value = false;

      stateConfigurable.value = false;
      valueConfigurable.value = false;
      break;
    case "rclient":
      typeValue.value = "电脑";
      idLabel.value = "电脑 ID";
      idValue.value = device.device.id;
      stateLabel.value = "状态";
      stateValue.value = device.device.state ? "在线" : "离线";
      showDetailValue.value = false;

      stateConfigurable.value = false;
      valueConfigurable.value = false;
      break;
    case "lamp":
      typeValue.value = "灯";
      idLabel.value = "灯 ID";
      idValue.value = device.device.id;
      stateLabel.value = "状态";
      stateValue.value = device.device.state ? "开" : "关";
      showDetailValue.value = true;
      valueLabel.value = "亮度";
      valueValue.value = String(device.device.value);

      stateConfigurable.value = true;
      valueConfigurable.value = true;
      break;
    case "doorlock":
      typeValue.value = "门锁";
      idLabel.value = "门锁 ID";
      idValue.value = device.device.id;
      stateLabel.value = "状态";
      stateValue.value = device.device.state ? "开" : "关";
      showDetailValue.value = false;

      stateConfigurable.value = true;
      valueConfigurable.value = false;
      break;
    case "sensor":
      typeValue.value = "传感器";
      idLabel.value = "传感器 ID";
      idValue.value = device.device.id;
      stateLabel.value = "状态";
      stateValue.value = device.device.state ? "工作" : "关机";
      showDetailValue.value = true;
      valueLabel.value = "传感值";
      valueValue.value = String(device.device.value);

      stateConfigurable.value = true;
      valueConfigurable.value = true;
      break;
    case "switch":
      typeValue.value = "开关";
      idLabel.value = "开关 ID";
      idValue.value = device.device.id;
      stateLabel.value = "状态";
      stateValue.value = device.device.state ? "开" : "关";
      showDetailValue.value = false;

      stateConfigurable.value = true;
      valueConfigurable.value = false;
      break;
  }
  detailDevice.value = device;
  showDetailModal.value = true;
}

async function updateDeviceState(state: boolean | string) {
  if (!detailDevice.value) {
    return;
  }
  if (typeof state === "string") {
    if (state === "on") {
      state = true;
    } else if (state === "off") {
      state = false;
    } else {
      return;
    }
  }
  showDetailModal.value = false;
  const body: PanelAdminPlaceDeviceUpdateReqBody = {
    state,
  };
  const resp = await axiosPost<void>(
    `/api/panel/admin/place/${placeId.value}/device/${detailDevice.value.type}/${detailDevice.value.device.id}/update`,
    body
  );
  if (!resp.success) {
    await $alert("Error: " + resp.message, "出错了", "error");
    return;
  }
  await $alert("修改成功", "成功", "success");
  loadAllDevices();
}

async function updateDeviceValue(value: string) {
  if (!detailDevice.value) {
    return;
  }
  showDetailModal.value = false;
  const body: PanelAdminPlaceDeviceUpdateReqBody = {
    value: parseFloat(value) || 0,
  };
  const resp = await axiosPost<void>(
    `/api/panel/admin/place/${placeId.value}/device/${detailDevice.value.type}/${detailDevice.value.device.id}/update`,
    body
  );
  if (!resp.success) {
    await $alert("Error: " + resp.message, "出错了", "error");
    return;
  }
  await $alert("修改成功", "成功", "success");
  loadAllDevices();
}

async function deleteDevice(device: UnifiedDeviceModelWrapperResp) {
  const resp = await axiosPost<void>(
    `/api/panel/admin/place/${placeId.value}/device/${device.type}/${device.device.id}/delete`
  );
  if (!resp.success) {
    await $alert("Error: " + resp.message, "出错了", "error");
    return;
  }
  await $alert("删除成功", "成功", "success");
  loadAllDevices();
}

</script>

<template>
  <div class="container">
    <n-card title="场所设备列表">
      <template #header-extra>
        <n-button size="small" @click="$router.back()">返回</n-button>
      </template>
      <n-table v-if="unifiedDevices.length" :bordered="false" :single-line="false" size="small">
        <thead>
          <tr>
            <th>类别</th>
            <th>设备名称</th>
            <th>设备状态</th>
            <th>数值</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(device, i) in unifiedDevices">
            <td>{{ device.type }}</td>
            <td v-for="key in ['id', 'state', 'value'] as (keyof typeof device.device)[]">
              {{ key === "state" ? ["离线", "在线"][Number(device.device[key])] : device.device[key] }}
            </td>
            <td>
              <n-space size="small">
                <n-button size="small" @click="showDeviceDetail(device)">详情</n-button>
                <n-button v-if="device.type !== 'rclient' && device.type !== 'camera'" size="small"
                  @click="deleteDevice(device)">删除</n-button>
              </n-space>
            </td>
          </tr>
        </tbody>
      </n-table>
    </n-card>
  </div>
  <n-modal v-model:show="showDetailModal">
    <n-card class="card-modal" title="设备详情" :bordered="false" size="huge" role="dialog" aria-modal="true">
      <n-form>
        <n-form-item label="设备种类">
          <n-input v-model:value="typeValue" disabled />
        </n-form-item>
        <n-form-item :label="idLabel">
          <n-input v-model:value="idValue" disabled />
        </n-form-item>
        <n-form-item :label="stateLabel">
          <n-select v-if="stateConfigurable" v-model:value="stateValue" :options="stateOptions" />
          <n-select v-if="!stateConfigurable" v-model:value="stateValue" :options="stateOptions" disabled />
          <n-button v-if="stateConfigurable" size="medium"
            @click="updateDeviceState(stateValue)">保存</n-button>
        </n-form-item>
        <n-form-item v-if="showDetailValue" :label="valueLabel">
          <n-input v-if="valueConfigurable" v-model:value="valueValue" />
          <n-input v-if="!valueConfigurable" v-model:value="valueValue" disabled />
          <n-button v-if="valueConfigurable" size="medium"
            @click="updateDeviceValue(valueValue)">保存</n-button>
        </n-form-item>
      </n-form>
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

<style>
.n-base-selection.n-base-selection--disabled .n-base-selection-label .n-base-selection-input {
  color: var(--n-text-color) !important;
}

input[disabled] {
  color: black !important;
}
</style>
