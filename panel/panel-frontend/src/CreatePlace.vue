<!-- @format -->

<script lang="ts" setup>
import { ComputedRef, computed, onMounted, ref } from "vue";
import type { Ref } from "vue";

import axios from "axios";
import type { AxiosResp, JSONTransform } from "types/type-helper";
import swal from "vue3-simple-alert-next";
import { NForm, NFormItem, NInput, NUpload, NButton } from "naive-ui";
import { useRouter } from "vue-router";
import {
  CameraDeviceModelResp,
  RClientDeviceModelResp,
  UnifiedDeviceModelWrapperResp,
  VirtualDeviceModelWrapperResp,
} from "../../../dts/db/api/devices-api";
import {
  PanelAdminPlaceCreateReqBody,
  PanelAdminPlaceDeviceListRespData,
  PanelAdminPlaceGetRespData,
} from "../../../dts/panel/panel-server";
import { FileInfo, SettledFileInfo } from "naive-ui/es/upload/src/interface";
const router = useRouter();

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

const placeId: Ref<string> = ref("");
const image: Ref<string> = ref("");

function handleFileSelect(data: {
  file: SettledFileInfo;
  fileList: SettledFileInfo[];
  event: ProgressEvent | Event | undefined;
}) {
  const { file } = data;
  if (!file.file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    if (e.target === null) {
      return;
    }
    image.value = e.target.result as string;
    console.log(image.value);
  };
  reader.readAsDataURL(file.file);
}

async function createPlace() {
  const resp = await axiosPost<void>(`/api/panel/admin/place/${placeId.value}/create`, {
    image: image.value,
  });

  if (!resp.success) {
    await swal.alert("Error: " + resp.message, "出错了", "error");
    return;
  }

  router.back();
}
</script>

<template>
  <div class="container">
    <n-card title="创建场所">
      <template #header-extra>
        <n-button size="small" @click="$router.back()">返回</n-button>
      </template>
      <n-form>
        <n-form-item label="场所名称">
          <n-input v-model:value="placeId" clearable />
        </n-form-item>
        <n-form-item label="户型图">
          <n-upload :default-upload="false" :on-change="handleFileSelect">
            <n-button>选择户型图</n-button>
          </n-upload>
        </n-form-item>
      </n-form>
      <n-button :disabled="!image" style="margin-top: 12px" @click="createPlace"> 创建场所 </n-button>
    </n-card>
  </div>
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
</style>
