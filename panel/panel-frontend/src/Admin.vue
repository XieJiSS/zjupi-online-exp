<!-- @format -->

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";
import type { Ref } from "vue";

import axios from "axios";
import type { AxiosResp, JSON } from "types/type-helper";

import type {
  PanelAdminRClientRespData, PanelAccessRespData, PanelAdminLinkEditReqBody,
  PanelAdminStudentDeleteReqBody, PanelAdminStudentAddReqBody,
  PanelAdminLinkAddReqBody, PanelAdminLinkDeleteReqBody,
  RemoteClientAttrs, StudentAttrs, AccessLinkAttrs, CameraAttrs, DBLogAttrs,
  PanelAdminLinkAssignToStudentReqBody,
  RemoteClientInterface, StudentInterface, AccessLinkInterface, CameraInterface, DBLogInterface,
  PanelAdminStudentRespData, PanelAdminLinkRespData, PanelAdminCameraRespData,
  PanelAdminLogRespData, PanelAdminCameraAssignToLinkReqBody, PanelAdminCameraRemoveFromLinkReqBody,
} from "../../../dts/panel/panel-server";

import { useRouter } from 'vue-router';
import swal from "vue3-simple-alert-next";

const router = useRouter();
const { alert: $alert, confirm: $confirm, prompt: $prompt, fire: $fire } = swal;

type AdminTab = "rclients" | "students" | "logs" | "cameras";
const tab = ref("rclients") as Ref<AdminTab>;

type DisplayKeymap = {
  rclient: Partial<Record<RemoteClientAttrs, string>>;
  link: Partial<Record<AccessLinkAttrs, string>>;
  camera: Partial<Record<CameraAttrs, string>>;
  student: Partial<Record<StudentAttrs, string>>;
  log: Partial<Record<DBLogAttrs, string>>;
};
const displayKeymap: DisplayKeymap = {
  rclient: {
    clientId: "上位机ID",
    ip: "上位机IP",
    password: "远控密码",
    online: "在线",
  },
  link: {
    linkPath: "访问码",
    validAfter: "生效时间",
    validUntil: "失效时间",
    isValid: "访问码有效",
  },
  student: {
    name: "学生姓名",
    phone: "学生手机"
  },
  camera: {
    cameraId: "摄像头",
    ip: "摄像头 IP",
  },
  log: {
    createdAt: "时间",
    text: "内容",
    source: "来源",
    level: "级别",
  }
};

interface VueAppData {
  tab: AdminTab;
  rclients: JSON.From<PanelAdminRClientRespData>[];
  rclientSearchCond: string;
  students: JSON.From<PanelAdminStudentRespData>[];
  links: JSON.From<PanelAdminLinkRespData>[];
  cameras: JSON.From<PanelAdminCameraRespData>[];
  selectedStatus: boolean[];
  logs: Partial<JSON.From<DBLogInterface>>[];
}

const rclients = ref([]) as Ref<VueAppData["rclients"]>;
const rclientSearchCond = ref("") as Ref<VueAppData["rclientSearchCond"]>;
const students = ref([]) as Ref<VueAppData["students"]>;
const links = ref([]) as Ref<VueAppData["links"]>;
const cameras = ref([]) as Ref<VueAppData["cameras"]>;
const logs = ref([]) as Ref<VueAppData["logs"]>;
const selectedStatus = ref([]) as Ref<VueAppData["selectedStatus"]>;

async function axiosGet<T>(url: string, params: Record<string, any> = {}): Promise<AxiosResp<T>> {
  const { data } = await axios.get<AxiosResp<T>>(url, {
    params,
  }).catch((err) => {
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

async function loadAllStudents() {
  const resp = await axiosGet<PanelAdminStudentRespData[]>("/api/panel/admin/students");
  if (!resp.data) {
    return;
  }
  students.value = resp.data;
}
async function loadAllLinks() {
  const resp = await axiosGet<PanelAdminLinkRespData[]>("/api/panel/admin/links");
  if (!resp.data) {
    return;
  }
  links.value = resp.data;
}
async function loadAllCameras() {
  const resp = await axiosGet<PanelAdminCameraRespData[]>("/api/panel/admin/cameras");
  if (!resp.data) {
    return;
  }
  cameras.value = resp.data;
}
async function loadAllRClients() {
  const resp = await axiosGet<PanelAdminRClientRespData[]>("/api/panel/admin/rclients");
  if (!resp.data) {
    return;
  }
  rclients.value = resp.data;
}
async function loadAllLogs() {
  const resp = await axiosGet<PanelAdminLogRespData[]>("/api/panel/admin/logs");
  if (!resp.data) {
    return;
  }
  logs.value = resp.data.reverse();
}
async function loadAll(alert: boolean = false) {
  await Promise.all([loadAllStudents(), loadAllLinks(), loadAllCameras(), loadAllRClients(), loadAllLogs()]);
  if (alert) {
    await $alert("刷新成功", "提示", "info");
  }
}
function clearSelected() {
  selectedStatus.value = [];
  const storedSelectedStatus = JSON.parse(localStorage.getItem(tab.value + "_selectedStatus") ?? "[]");
  if (storedSelectedStatus.length > 0) {
    localStorage.setItem(tab.value + "_selectedStatus", JSON.stringify([]));
  }
}
function toggleTab(newTab: AdminTab) {
  switch (newTab) {
    case "rclients":
      loadAllRClients();
      break;
    case "students":
      loadAllStudents();
      break;
    case "logs":
      loadAllLogs();
      break;
    case "cameras":
      loadAllCameras();
      break;
  }

  const storedSelectedStatus = JSON.parse(localStorage.getItem(newTab + "_selectedStatus") ?? "[]");

  if (storedSelectedStatus.length > 0) {
    let targetDataLength = 0;
    switch (newTab) {
      case "rclients":
        targetDataLength = rclients.value.length;
        break;
      case "students":
        targetDataLength = students.value.length;
        break;
      case "logs":
        targetDataLength = logs.value.length;
        break;
      case "cameras":
        targetDataLength = cameras.value.length;
        break;
    }

    if (storedSelectedStatus.length < targetDataLength) {
      for (let i = storedSelectedStatus.length; i < targetDataLength; i++) {
        storedSelectedStatus.push(false);
      }
    }

    localStorage.setItem(newTab + "_selectedStatus", JSON.stringify(storedSelectedStatus));
    selectedStatus.value = storedSelectedStatus;
  }
  tab.value = newTab;
  localStorage.setItem("tab", newTab);
}
async function logout() {
  await axiosPost("/api/panel/admin/logout");
  await router.push("/login");
}
async function searchClients() {
  const substr = await $prompt("Filter by id:");
  if (!substr) {
    return;
  }
  rclientSearchCond.value = substr;
}
function showAllClients() {
  rclientSearchCond.value = "";
}
function getCSVOfDisplayRClients() {
  const entry = location.origin + location.pathname + location.search + "#/access";
  let header = "入口网址为," + entry + "\r\n";
  for (const key of rclientKeys.value) {
    const text = getRClientDisplayKey(key);
    header += text + ",";
  }
  header = header.slice(0, -1);
  let body = "";
  /*
  <tr v-for="(rclient, i) in displayRClients">
    <td v-for="key in rclientKeys">{{
        getRClientDisplayValue(rclient, key)
    }}</td>
  </tr>
  */
  for (const rclient of displayRClients.value) {
    for (const key of rclientKeys.value) {
      const text = getRClientDisplayValue(rclient, key);
      body += text + ",";
    }
    body = body.slice(0, -1);
    body += "\r\n";
  }
  return header + "\r\n" + body;
}
function downloadCSV(csv: string, filename: string) {
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}
async function addStudent() {
  const name = await $prompt("请输入学生姓名：");
  const phone = (await $prompt("请输入学生手机号：")) || "";
  if (!name) {
    await $alert("格式错误：姓名不能为空值");
    return;
  }
  const body: PanelAdminStudentAddReqBody = { name, phone };
  const resp: AxiosResp<void> = await axiosPost("/api/panel/admin/student/addOne", body);
  if (!resp.success) {
    await $alert("Failed: " + resp.message);
    return;
  }
  await loadAllStudents();  // @TODO: 增量更新，需要服务端返回新增加学生的 id
}
async function importStudentsFromCSV() {
  const { value: file } = await $fire({
    title: "选择 CSV 文件",
    input: "file",
    inputAttributes: {
      accept: ".csv",
      placeholder: "选择 CSV 文件",
      "aria-label": "选择 CSV 文件",
    },
  });
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = async (e) => {
    const buf = e.target?.result as ArrayBuffer;
    let text = new TextDecoder("utf-8").decode(buf);
    if (text.includes("\ufffd")) {
      text = new TextDecoder("gb2312").decode(buf);
    }
    if (!text.trim()) {
      await $alert("文件内容为空");
      return;
    }
    const lines = text.trim().split("\n");
    const students: PanelAdminStudentAddReqBody[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      if (!line.trim()) continue;
      if (!/^[\s\S]*[,\t]\s*[\s\S]*$/.test(line.trim())) {
        console.error("Invalid line: " + line);
        await $alert("格式错误：请检查 CSV 文件并确认其单元格间采用英文逗号或 tab 分隔");
        return;
      }
      const cells = line.split(/[,\t]\s*/);
      if (cells.length !== 2) {
        await $alert("格式错误：请检查第" + (i + 1) + "行是否完整");
        return;
      }
      const [name, phone] = cells as [string, string];
      const code = extractLocationCode(phone);
      if (code) {
        await $alert("警告：第" + (i + 1) + "行手机号存在地区码前缀 " + code + "，可能导致短信发送失败");
      }
      students.push({ name, phone });
    }
    const resp: AxiosResp<void> = await axiosPost("/api/panel/admin/student/addMulti", students);
    if (!resp.success) {
      await $alert("Failed: " + resp.message);
      return;
    }
    await loadAllStudents();  // @TODO: 增量更新，需要服务端返回新增加学生的 id
  };
  reader.readAsArrayBuffer(file);
}
async function removeSelectedStudents() {
  if (tab.value !== "students") {
    await $alert("当前 tab 不支持该操作");
    return;
  }
  const deleteStudents: PanelAdminStudentDeleteReqBody[] = [];
  for (let i = 0; i < selectedStatus.value.length; i++) {
    if (selectedStatus.value[i]) {
      const student = students.value[i];
      if (!student)
        continue;
      deleteStudents.push({ studentId: student.studentId });
    }
  }
  const resp: AxiosResp<void> = await axiosPost<void>("/api/panel/admin/student/deleteMulti", deleteStudents);
  if (!resp.success) {
    await $alert("Failed: " + resp.message);
    return;
  }
  await loadAllStudents();
}
function extractLocationCode(phone: string): string {
  phone = phone.replace(/\s/g, "");
  if (/^\d+$/.test(phone)) {
    if (phone.startsWith("0086")) {
      return "0086";
    } else if (phone.startsWith("86")) {
      return "86";
    }
    return "";
  } else if (/^\+\d+$/.test(phone)) {
    const code = extractLocationCode(phone.slice(1));
    return "+" + (code || "?");
  } else if (phone.includes("(") || phone.includes(")")) {
    return phone.match(/\(([\s\S]*?)\)/)?.[1] || "";
  } else {
    return "";
  }
}
async function generateLinksForSelectedRClients() {
  if (tab.value !== "rclients") {
    await $alert("当前 tab 不支持该操作");
    return;
  }
  for (let i = 0; i < selectedStatus.value.length; i++) {
    if (selectedStatus.value[i]) {
      const link = rclients.value[i]!.link;
      if (!link) continue;
      const isValidAfter = link.validAfter ? Date.parse(link.validAfter) <= Date.now() : true;
      const isValidUntil = link.validUntil ? Date.parse(link.validUntil) >= Date.now() : true;
      const isValid = isValidAfter && isValidUntil;
      if (isValid) {
        await $alert("链接重复生成：请先删除ID为" + rclients.value[i]!.rclient.clientId + "的客户端的访问链接");
        return;
      }
    }
  }
  const [startDate, startTime] = (await $fire({
    title: "请选择链接生效时间点",
    html: `
          <input type="date" id="swal-input1" class="swal2-input" onfocus="this.showPicker()">
          <input type="time" id="swal-input2" class="swal2-input" onfocus="this.showPicker()">
        `,
    onBeforeOpen: () => {
      const input1 = document.getElementById("swal-input1") as HTMLInputElement;
      const input2 = document.getElementById("swal-input2") as HTMLInputElement;
      const now = new Date();
      const ISODateTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString();
      input1.value = ISODateTime.split("T")[0]!;
      input2.value = ISODateTime.split("T")[1]!.slice(0, 5);
    },
    preConfirm: () => {
      return [
        (document.getElementById("swal-input1") as HTMLInputElement).value,
        (document.getElementById("swal-input2") as HTMLInputElement).value,
      ];
    },
    inputValidator: (value) => {
      const [date, time] = value as unknown as string[];
      if (!date) {
        return "日期不能为空";
      } else if (!time) {
        return "时间不能为空";
      }
      return null;
    },
  })).value as string[];
  const [endDate, endTime] = (await $fire({
    title: "请选择链接失效时间点",
    html: `
          <input type="date" id="swal-input1" class="swal2-input" onfocus="this.showPicker()">
          <input type="time" id="swal-input2" class="swal2-input" onfocus="this.showPicker()">
        `,
    onBeforeOpen: () => {
      const input1 = document.getElementById("swal-input1") as HTMLInputElement;
      const input2 = document.getElementById("swal-input2") as HTMLInputElement;
      const now = new Date();
      const ISODateTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString();
      input1.value = ISODateTime.split("T")[0]!;
      input2.value = ISODateTime.split("T")[1]!.slice(0, 5);
    },
    preConfirm: () => {
      return [
        (document.getElementById("swal-input1") as HTMLInputElement).value,
        (document.getElementById("swal-input2") as HTMLInputElement).value,
      ];
    },
    inputValidator: (value) => {
      const [date, time] = value as unknown as string[];
      if (!date) {
        return "日期不能为空";
      } else if (!time) {
        return "时间不能为空";
      }
      return null;
    },
  })).value as string[];
  const links: PanelAdminLinkAddReqBody[] = [];
  const validAfter = new Date(startDate + " " + startTime);
  const validUntil = new Date(endDate + " " + endTime);
  if (validAfter >= validUntil) {
    await $alert("失效时间必须晚于生效时间");
    return;
  }
  for (let i = 0; i < selectedStatus.value.length; i++) {
    if (selectedStatus.value[i]) {
      links.push({
        clientId: rclients.value[i]!.rclient.clientId as string,
        validAfterTimeStamp: validAfter.getTime(),
        validUntilTimeStamp: validUntil.getTime(),
      });
    }
  }
  const resp: AxiosResp<void> = await axiosPost("/api/panel/admin/link/addMulti", links);
  if (!resp.success) {
    await $alert("Failed: " + resp.message);
    return;
  }
  await loadAll();
}
async function deleteLinksFromSelectedRClients() {
  if (tab.value !== "rclients") {
    await $alert("当前 tab 不支持该操作");
    return;
  }
  const links: PanelAdminLinkDeleteReqBody[] = [];
  for (let i = 0; i < selectedStatus.value.length; i++) {
    if (selectedStatus.value[i]) {
      const link = rclients.value[i]!.link;
      if (!link) {
        continue;
      }
      links.push({ linkId: link.linkId as number });
    }
  }
  const resp: AxiosResp<void> = await axiosPost("/api/panel/admin/link/deleteMulti", links);
  if (!resp.success) {
    await $alert("Failed: " + resp.message);
    return;
  }
  await loadAll();
}
async function assignStudentsToSelectedRClients() {
  if (tab.value !== "rclients") {
    await $alert("当前 tab 不支持该操作");
    return;
  }
  for (let i = 0; i < selectedStatus.value.length; i++) {
    if (selectedStatus.value[i]) {
      const student = rclients.value[i]!.student;
      if (student) {
        await $alert("访问码已被占用：需要删除并重新创建工控机" + rclients.value[i]!.rclient.clientId + "上的访问码");
        return;
      }
      const link = rclients.value[i]!.link;
      if (!link) {
        await $alert("未分配访问码：请先为工控机" + rclients.value[i]!.rclient.clientId + "分配访问码");
        return;
      }
    }
  }
  const pendingStudentIds: number[] = [];
  const assignInfos: PanelAdminLinkAssignToStudentReqBody[] = [];
  for (let i = 0; i < selectedStatus.value.length; i++) {
    if (selectedStatus.value[i]) {
      let html = `<input type="list" id="swal-input1" class="swal2-input" onfocus="this.showPicker()" list="student-list">`;
      html += `<datalist id="student-list">`;
      let choiceCount = 0;
      for (const student of students.value) {
        if (rclients.value.map(rclient => rclient.student?.studentId).includes(student.studentId)) {
          continue;
        }
        if (pendingStudentIds.includes(student.studentId as number)) {
          continue;
        }
        html += `<option value="${student.studentId}">${student.name}</option>`;
        choiceCount++;
      }
      html += `</datalist>`;
      if (choiceCount === 0) {
        break;  // no more students to assign
      }
      const studentId = (await $fire({
        title: `请选择要分配到工控机${rclients.value[i]!.rclient.clientId}的学生`,
        html,
        preConfirm: () => {
          const text = (document.getElementById("swal-input1") as HTMLInputElement).value;
          const id = Number(text);
          if (Number.isNaN(id) || text === "") {
            return null;
          }
          return id;
        },
      })).value as number | null;
      if (studentId === null) {
        await $alert("要分配的学生不能为空");
        return;
      }
      pendingStudentIds.push(studentId);
      assignInfos.push({
        linkId: rclients.value[i]!.link!.linkId,
        studentId,
      });
    }
  }
  const resp: AxiosResp<void> = await axiosPost("/api/panel/admin/link/assignToStudentMulti", assignInfos);
  if (!resp.success) {
    await $alert("Failed: " + resp.message);
    return;
  }
  await Promise.all([loadAllLinks(), loadAllRClients()]);
}
async function removeStudentsFromSelectedRClients() {
  // 无法直接清除分配，通过删除访问码方式实现
  await deleteLinksFromSelectedRClients();
}
function getRClientDisplayKey(key: string) {
  const [type, name] = key.split("#");
  if (type === "rclient") {
    // @ts-ignore
    return displayKeymap.rclient[name] ?? key;
  } else if (type === "link") {
    // @ts-ignore
    return displayKeymap.link[name] ?? key;
  } else if (type === "student") {
    // @ts-ignore
    return displayKeymap.student[name] ?? key;
  } else if (type === "camera") {
    // @ts-ignore
    return displayKeymap.camera[name] ?? key;
  } else {
    return key;
  }
}
function getRClientDisplayValue(rclientObj: JSON.From<PanelAdminRClientRespData>, key: string) {
  const [type, name] = key.split("#");
  let ret: string | boolean = "N/A";
  if (type === "rclient") {
    // @ts-ignore
    ret = rclientObj.rclient?.[name];
  } else if (type === "link") {
    // @ts-ignore
    ret = rclientObj.link?.[name];
  } else if (type === "student") {
    // @ts-ignore
    ret = rclientObj.student?.[name];
  } else if (type === "camera") {
    // @ts-ignore
    ret = rclientObj.camera?.[name];
  }
  ret = ret ?? "N/A";
  // is Date
  if (typeof ret === "string" && /^\d{4,}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(ret)) {
    const d = new Date(ret);
    const date = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    const time = `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
    ret = `${date} ${time}`;
  } else if (ret === true) {
    ret = "是";
  } else if (ret === false) {
    ret = "否";
  }
  return ret;
}
async function assignCamerasToSelectedLinks() {
  // links must be grabbed from rclients
  if (tab.value !== "rclients") {
    await $alert("当前 tab 不支持该操作");
    return;
  }
  for (let i = 0; i < selectedStatus.value.length; i++) {
    if (selectedStatus.value[i]) {
      const camera = rclients.value[i]!.camera;
      if (camera) {
        await $alert("工控机" + rclients.value[i]!.rclient.clientId + "已经被分配了摄像头");
        return;
      }
    }
  }
  const pendingCameraIds: string[] = [];
  const assignInfos: PanelAdminCameraAssignToLinkReqBody[] = [];
  for (let i = 0; i < selectedStatus.value.length; i++) {
    if (selectedStatus.value[i]) {
      let html = `<input type="list" id="swal-input1" class="swal2-input" onfocus="this.showPicker()" list="camera-list">`;
      html += `<datalist id="camera-list">`;
      let choiceCount = 0;
      const assignedCameraIds = rclients.value.map(rclient => rclient.camera?.cameraId).filter(id => id !== undefined && id !== null) as string[];
      for (const camera of cameras.value) {
        if (assignedCameraIds.includes(camera.cameraId)) {
          continue;
        }
        if (pendingCameraIds.includes(camera.cameraId)) {
          continue;
        }
        html += `<option value="${camera.cameraId}">${camera.cameraId} (${camera.ip})</option>`;
        choiceCount++;
      }
      html += `</datalist>`;
      if (choiceCount === 0) {
        break;  // no more students to assign
      }
      const cameraId = (await $fire({
        title: `请选择要分配到工控机${rclients.value[i]!.rclient.clientId}的远控摄像头`,
        html,
        preConfirm: () => {
          const text = (document.getElementById("swal-input1") as HTMLInputElement).value;
          return text;
        },
      })).value as string | null;
      if (cameraId === null) {
        await $alert("要分配的摄像头不能为空");
        return;
      }
      pendingCameraIds.push(cameraId);
      assignInfos.push({
        linkId: rclients.value[i]!.link!.linkId,
        cameraId,
      });
    }
  }
  const resp: AxiosResp<void> = await axiosPost("/api/panel/admin/camera/assignToLinkMulti", assignInfos);
  if (!resp.success) {
    await $alert("Failed: " + resp.message);
    return;
  }
  await loadAll();
}
async function removeCamerasFromSelectedLinks() {
  if (tab.value !== "rclients") {
    await $alert("当前 tab 不支持该操作");
    return;
  }
  const links: PanelAdminCameraRemoveFromLinkReqBody[] = [];
  for (let i = 0; i < selectedStatus.value.length; i++) {
    if (selectedStatus.value[i]) {
      const camera = rclients.value[i]!.camera;
      if (!camera) {
        await $alert("工控机" + rclients.value[i]!.rclient.clientId + "没有被分配摄像头");
        return;
      }
      const link = rclients.value[i]!.link;
      if (!link) {
        await $alert("非预期异常：无法为工控机" + rclients.value[i]!.rclient.clientId + "移除已分配的摄像头");
        return;
      }
      links.push({
        linkId: link.linkId,
      });
    }
  }
  const resp: AxiosResp<void> = await axiosPost("/api/panel/admin/camera/removeFromLinkMulti", links);
  if (!resp.success) {
    await $alert("Failed: " + resp.message);
    return;
  }
  await loadAll();
}

const displayRClients = computed(() => {
  return rclients.value.filter(({ rclient }: JSON.From<PanelAdminRClientRespData>) => {
    if (rclientSearchCond.value === "") return true;
    return rclient.clientId.toLowerCase().includes(rclientSearchCond.value.toLowerCase());
  });
});
const rclientKeys = computed(() => {
  const keys = ObjectKeys(displayKeymap.rclient).map(s => "rclient#" + s);
  keys.push("link#linkPath");
  keys.push("link#validAfter");
  keys.push("link#validUntil");
  keys.push("student#name");
  keys.push("student#phone");
  keys.push("camera#cameraId");
  return keys;
});


watch(rclients, () => {
  localStorage.removeItem("rclients_selectedStatus");
  if (tab.value === "rclients") {
    selectedStatus.value = Array.from({ length: rclients.value.length }, () => false);
  }
});
watch(displayRClients, () => {
  localStorage.removeItem("rclients_selectedStatus");
  if (tab.value === "rclients") {
    selectedStatus.value = Array.from({ length: displayRClients.value.length }, () => false);
  }
});
watch(students, () => {
  localStorage.removeItem("students_selectedStatus");
  if (tab.value === "students") {
    selectedStatus.value = Array.from({ length: students.value.length }, () => false);
  }
});
watch(cameras, () => {
  localStorage.removeItem("cameras_selectedStatus");
  if (tab.value === "cameras") {
    selectedStatus.value = Array.from({ length: cameras.value.length }, () => false);
  }
});
watch(logs, () => {
  localStorage.removeItem("logs_selectedStatus");
  if (tab.value === "logs") {
    selectedStatus.value = Array.from({ length: logs.value.length }, () => false);
  }
});

// for better typings
function ObjectKeys<T extends Object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}

onMounted(async () => {
  tab.value = localStorage.getItem("tab") as AdminTab || "rclients";
  await loadAll();
});
</script>

<template>
  <div class="admin-app">
    <div class="card">
      <div class="card-aside">
        <h5 class="card-aside-header">Select Tab</h5>
        <div class="card-tab-item" v-on:click="toggleTab('rclients')"
          v-bind:class="{ 'card-tab-item-active': tab == 'rclients' }">
          综合管理
        </div>
        <div class="card-tab-item" v-on:click="toggleTab('students')"
          v-bind:class="{ 'card-tab-item-active': tab == 'students' }">
          学员列表
        </div>
        <div class="card-tab-item" v-on:click="toggleTab('cameras')"
          v-bind:class="{ 'card-tab-item-active': tab == 'cameras' }">
          摄像头列表
        </div>
        <div class="card-tab-item" v-on:click="toggleTab('logs')"
          v-bind:class="{ 'card-tab-item-active': tab == 'logs' }">
          查看日志
        </div>
      </div>
      <div class="card-body card-body-has-sidebar">
        <div style="display: inline-block">
          <h5 class="card-title">ZJUPI 线上实验管理平台</h5>
          <h6 class="card-subtitle">管理界面</h6>
        </div>
        <div v-show="tab === 'rclients'">
          <div class="card-body-header">
            <a href="javascript:void(0);" class="btn" v-on:click="clearSelected"
              v-if="selectedStatus.filter((s) => s).length > 0">取消选中</a>
            <a href="javascript:void(0);" class="btn" v-on:click="searchClients"
              v-if="selectedStatus.filter((s) => s).length > 0">查找ID</a>
            <a href="javascript:void(0);" class="btn" v-on:click="showAllClients"
              v-if="displayRClients.length < rclients.length">显示全部</a>
            <a href="javascript:void(0);" class="btn" v-on:click="generateLinksForSelectedRClients"
              v-if="selectedStatus.filter((s) => s).length > 0">生成访问码</a>
            <a href="javascript:void(0);" class="btn" v-on:click="deleteLinksFromSelectedRClients"
              v-if="selectedStatus.filter((s) => s).length > 0">删除访问码</a>
            <a href="javascript:void(0);" class="btn" v-on:click="assignStudentsToSelectedRClients"
              v-if="selectedStatus.filter((s) => s).length > 0">绑定学生</a>
            <a href="javascript:void(0);" class="btn" v-on:click="removeStudentsFromSelectedRClients"
              v-if="selectedStatus.filter((s) => s).length > 0">解绑学生</a>
            <a href="javascript:void(0);" class="btn" v-on:click="assignCamerasToSelectedLinks"
              v-if="selectedStatus.filter((s) => s).length > 0">绑定摄像头</a>
            <a href="javascript:void(0);" class="btn" v-on:click="removeCamerasFromSelectedLinks"
              v-if="selectedStatus.filter((s) => s).length > 0">解绑摄像头</a>
            <a href="javascript:void(0);" class="btn align-right" v-on:click="logout">登出</a>
            <a href="javascript:void(0);" class="btn align-right"
              v-on:click="downloadCSV(getCSVOfDisplayRClients(), new Date().toISOString() + '.csv')"
              v-if="displayRClients.length > 0">导出为表格</a>
            <a href="javascript:void(0);" class="btn align-right" v-on:click="loadAll(true)">刷新</a>
          </div>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>选择</th>
                  <th v-for="text in rclientKeys">{{ getRClientDisplayKey(text) }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(rclient, i) in displayRClients">
                  <td>
                    <input type="checkbox" v-model="selectedStatus[i]" />
                  </td>
                  <td v-for="key in rclientKeys" v-bind:class="'table-rc-' + key">{{
                    getRClientDisplayValue(rclient, key)
                  }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-show="tab == 'students'">
          <div class="card-body-header">
            <a href="javascript:void(0);" class="btn" v-on:click="clearSelected"
              v-if="selectedStatus.filter((s) => s).length > 0">取消选中</a>
            <a href="javascript:void(0);" class="btn" v-on:click="addStudent">添加学生</a>
            <a href="javascript:void(0);" class="btn" v-on:click="importStudentsFromCSV">从 CSV 导入</a>
            <a href="javascript:void(0);" class="btn" v-on:click="removeSelectedStudents"
              v-if="selectedStatus.filter((s) => s).length > 0">删除选中学生</a>
            <a href="javascript:void(0);" class="btn align-right" v-on:click="logout">登出</a>
          </div>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>选择</th>
                  <th v-for="key in ObjectKeys(displayKeymap.student)">{{ displayKeymap.student[key] }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(student, i) in students">
                  <td>
                    <input type="checkbox" v-model="selectedStatus[i]" />
                  </td>
                  <td v-for="key in ObjectKeys(displayKeymap.student)" v-bind:class="'table-stu-' + key">{{
                    student[key]
                  }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-show="tab == 'logs'">
          <div class="card-body-header">
            <a href="javascript:void(0);" class="btn" v-on:click="clearSelected"
              v-if="selectedStatus.filter((s) => s).length > 0">取消选中</a>
            <a href="javascript:void(0);" class="btn align-right" v-on:click="logout">登出</a>
          </div>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>选择</th>
                  <th v-for="key in ObjectKeys(displayKeymap.log)">{{ displayKeymap.log[key] }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(log, i) in logs">
                  <td>
                    <input type="checkbox" v-model="selectedStatus[i]" />
                  </td>
                  <td v-for="key in ObjectKeys(displayKeymap.log)" v-bind:class="'table-log-' + key">{{
                    log[key]
                  }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-show="tab == 'cameras'">
          <div class="card-body-header">
            <a href="javascript:void(0);" class="btn" v-on:click="clearSelected"
              v-if="selectedStatus.filter((s) => s).length > 0">取消选中</a>
            <a href="javascript:void(0);" class="btn align-right" v-on:click="logout">登出</a>
          </div>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>选择</th>
                  <th v-for="key in ObjectKeys(displayKeymap.camera)">{{ displayKeymap.camera[key] }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(camera, i) in cameras">
                  <td>
                    <input type="checkbox" v-model="selectedStatus[i]" />
                  </td>
                  <td v-for="key in ObjectKeys(displayKeymap.camera)" v-bind:class="'table-cam-' + key">{{
                    camera[key]
                  }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "./assets/style/manage-scoped.css";
</style>

<style>
@import "./assets/style/manage-noscope.css";
@import "sweetalert2/dist/sweetalert2.min.css";

input[type="date"],
input[type="time"] {
  font-family: Courier, Consolas, "Courier New", monospace;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  cursor: pointer;
}

.table-log-source,
.table-log-level {
  font-family: Courier, Consolas, 'Courier New', monospace;
}
</style>
