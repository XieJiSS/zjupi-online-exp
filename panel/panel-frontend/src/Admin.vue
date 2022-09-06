<script lang="ts">
import { defineComponent } from "vue";
import axios from "axios";
import type { AxiosResponse } from "axios";
import type {
  AddStudentInfo, AddLinkInfo, DeleteLinkInfo, AssignLinkToStudentInfo,
  RClientResponseData, StudentResponseData, LinkResponseData, CameraResponseData,
  RClientAttributes, StudentAttributes, LinkAttributes, CameraAttributes,
} from "../../../types/panel/panel-server";

interface ResponseBase {
  success: boolean;
  message: string;
}

type AxiosResponseType<T> = ResponseBase & AxiosResponse<T>;

type VueAppTab = "rclients" | "students" | "logs";
type VueAppRClients = RClientResponseData[];
type VueAppStudents = StudentResponseData[];
type VueAppLinks = LinkResponseData[];
type VueAppCameras = CameraResponseData[];
type VueAppRClientAttr = RClientAttributes;
type VueAppStudentAttr = StudentAttributes;
type VueAppLinkAttr = LinkAttributes;
type VueAppCameraAttr = CameraAttributes;

interface VueAppData {
  tab: VueAppTab;
  displayKeymap: {
    rclient: Partial<Record<VueAppRClientAttr, string>>;
    link: Partial<Record<VueAppLinkAttr, string>>;
    camera: Partial<Record<VueAppCameraAttr, string>>;
    student: Partial<Record<VueAppStudentAttr, string>>;
  };
  rclients: VueAppRClients;
  rclientSearchCond: string;
  students: VueAppStudents;
  links: VueAppLinks;
  cameras: VueAppCameras;
  selectedStatus: boolean[];
}

export default defineComponent({
  data(): VueAppData {
    return {
      tab: "rclients",
      displayKeymap: {
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
          cameraId: "摄像头标识符",
          ip: "摄像头 IP",
        },
      },
      rclients: [],  // union selected - combination of (RemoteClient, AccessLink, Camera, Student)
      rclientSearchCond: "",
      students: [],
      links: [],
      cameras: [],
      // logs: [], // @TODO:
      selectedStatus: [],
    };
  },
  methods: {
    async axiosGet(url: string, params: Record<string, any> = {}): Promise<AxiosResponseType<any>> {
      const { data } = await axios
        .get(url, {
          params,
        })
        .catch((err) => {
          console.error(err);
          return { data: { success: false, message: err.toString() } };
        });
      if (!data.success && data.message === "Authentication required") {
        await this.$router.push("/login");
        return data;
      }
      return data;
    },
    async axiosPost(url: string, body: Record<string, any> = {}): Promise<AxiosResponseType<any>> {
      const { data } = await axios.post(url, body).catch((err) => {
        console.error(err);
        return { data: { success: false, message: err.toString() } };
      });
      if (!data.success && data.message === "Authentication required") {
        await this.$router.push("/login");
        return data;
      }
      return data;
    },
    async loadAllStudents() {
      const resp: AxiosResponseType<VueAppStudents> = await this.axiosGet("/api/panel/admin/students");
      if (!resp.data) {
        return;
      }
      this.students = resp.data;
    },
    async loadAllLinks() {
      const resp: AxiosResponseType<VueAppLinks> = await this.axiosGet("/api/panel/admin/links");
      if (!resp.data) {
        return;
      }
      this.links = resp.data;
    },
    async loadAllCameras() {
      const resp: AxiosResponseType<VueAppCameras> = await this.axiosGet("/api/panel/admin/cameras");
      if (!resp.data) {
        return;
      }
      this.cameras = resp.data;
    },
    async loadAllRClients() {
      const resp: AxiosResponseType<VueAppRClients> = await this.axiosGet("/api/panel/admin/rclients");
      if (!resp.data) {
        return;
      }
      this.rclients = resp.data;
    },
    async loadAll(alert: boolean = false) {
      await Promise.all([this.loadAllStudents(), this.loadAllLinks(), this.loadAllCameras(), this.loadAllRClients()]);
      if (alert) {
        await this.$alert("刷新成功", "提示", "info");
      }
    },
    toggleTab(tab: VueAppTab) {
      const selectedStatus = JSON.parse(localStorage?.getItem(tab + "_selectedStatus") ?? "[]");
      if (selectedStatus.length > 0) {
        let targetDataLength = 0;
        switch (tab) {
          case "rclients":
            targetDataLength = this.rclients.length;
            break;
          case "students":
            targetDataLength = this.students.length;
            break;
          case "logs":
            targetDataLength = 0; // @TODO:
            break;
        }
        if (selectedStatus.length < targetDataLength) {
          for (let i = selectedStatus.length; i < targetDataLength; i++) {
            selectedStatus.push(false);
          }
        }
        localStorage?.setItem(this.tab + "_selectedStatus", JSON.stringify(this.selectedStatus));
        this.selectedStatus = selectedStatus;
      }
      this.tab = tab;
      localStorage?.setItem("tab", tab);
    },
    async logout() {
      await this.axiosPost("/api/panel/admin/logout");
      await this.$router.push("/login");
    },
    async searchClients() {
      const substr = await this.$prompt("Filter by id:");
      if (!substr) {
        return;
      }
      this.rclientSearchCond = substr;
    },
    showAllClients() {
      this.rclientSearchCond = "";
    },
    async addStudent() {
      const name = await this.$prompt("请输入学生姓名：");
      const phone = await this.$prompt("请输入学生手机号：");
      if (!name || !phone) {
        await this.$alert("格式错误：不能为空值");
        return;
      }
      const body: AddStudentInfo = { name, phone };
      const resp: AxiosResponseType<void> = await this.axiosPost("/api/panel/admin/student/addOne", body);
      if (!resp.success) {
        await this.$alert("Failed: " + resp.message);
        return;
      }
      await this.loadAllStudents();  // @TODO: 增量更新，需要服务端返回新增加学生的 id
    },
    async importStudentsFromCSV() {
      const { value: file } = await this.$fire({
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
          await this.$alert("文件内容为空");
          return;
        }
        const lines = text.trim().split("\n");
        const students: AddStudentInfo[] = [];
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (!line.trim()) continue;
          if (!/^[\s\S]*[,\t]\s*[\s\S]*$/.test(line.trim())) {
            console.error("Invalid line: " + line);
            await this.$alert("格式错误：请检查 CSV 文件并确认其单元格间采用英文逗号或 tab 分隔");
            return;
          }
          const cells = line.split(/[,\t]\s*/);
          if (cells.length !== 2) {
            await this.$alert("格式错误：请检查第" + (i + 1) + "行是否完整");
            return;
          }
          const [name, phone] = cells;
          const code = extractLocationCode(phone);
          if (code) {
            await this.$alert("警告：第" + (i + 1) + "行手机号存在地区码前缀 " + code + "，可能导致短信发送失败");
          }
          students.push({ name, phone });
        }
        const resp: AxiosResponseType<void> = await this.axiosPost("/api/panel/admin/student/addMulti", students);
        if (!resp.success) {
          await this.$alert("Failed: " + resp.message);
          return;
        }
        await this.loadAllStudents();  // @TODO: 增量更新，需要服务端返回新增加学生的 id
      };
      reader.readAsArrayBuffer(file);
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
    },
    async generateLinksForSelected() {
      for (let i = 0; i < this.selectedStatus.length; i++) {
        if (this.selectedStatus[i]) {
          const link = this.rclients[i].link;
          const isValid = link?.validAfter <= new Date() && link?.validUntil >= new Date();
          if (link && isValid) {
            await this.$alert("链接重复生成：请先删除ID为" + this.rclients[i].rclient.clientId + "的客户端的访问链接");
            return;
          }
        }
      }
      const [startDate, startTime] = (await this.$fire({
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
          input1.value = ISODateTime.split("T")[0];
          input2.value = ISODateTime.split("T")[1].slice(0, 5);
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
        },
      })).value as string[];
      const [endDate, endTime] = (await this.$fire({
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
          input1.value = ISODateTime.split("T")[0];
          input2.value = ISODateTime.split("T")[1].slice(0, 5);
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
        },
      })).value as string[];
      const links: AddLinkInfo[] = [];
      const validAfter = new Date(startDate + " " + startTime);
      const validUntil = new Date(endDate + " " + endTime);
      if (validAfter >= validUntil) {
        await this.$alert("失效时间必须晚于生效时间");
        return;
      }
      for (let i = 0; i < this.selectedStatus.length; i++) {
        if (this.selectedStatus[i]) {
          links.push({
            clientId: this.rclients[i].rclient.clientId,
            validAfterTimeStamp: validAfter.getTime(),
            validUntilTimeStamp: validUntil.getTime(),
          });
        }
      }
      const resp: AxiosResponseType<VueAppLinks> = await this.axiosPost("/api/panel/admin/link/addMulti", links);
      if (!resp.success) {
        await this.$alert("Failed: " + resp.message);
        return;
      }
      await Promise.all([this.loadAllLinks(), this.loadAllRClients()]);
    },
    async removeLinksForSelected() {
      const links: DeleteLinkInfo[] = [];
      for (let i = 0; i < this.selectedStatus.length; i++) {
        if (this.selectedStatus[i]) {
          const link = this.rclients[i].link;
          if (!link) {
            continue;
          }
          links.push({ linkId: link.linkId });
        }
      }
      const resp: AxiosResponseType<void> = await this.axiosPost("/api/panel/admin/link/deleteMulti", links);
      if (!resp.success) {
        await this.$alert("Failed: " + resp.message);
        return;
      }
      await Promise.all([this.loadAllLinks(), this.loadAllRClients()]);
    },
    async assignStudentsForSelected() {
      for (let i = 0; i < this.selectedStatus.length; i++) {
        if (this.selectedStatus[i]) {
          const student = this.rclients[i].student;
          if (student) {
            await this.$alert("访问码已被占用：需要重新创建ID" + this.rclients[i].rclient.clientId + "上的访问码");
            return;
          }
          const link = this.rclients[i].link;
          if (!link) {
            await this.$alert("未分配访问码：请先为ID" + this.rclients[i].rclient.clientId + "分配访问码");
            return;
          }
        }
      }
      const pendingStudentIds: number[] = [];
      const assignInfos: AssignLinkToStudentInfo[] = [];
      for (let i = 0; i < this.selectedStatus.length; i++) {
        if (this.selectedStatus[i]) {
          let html = `<input type="list" id="swal-input1" class="swal2-input" onfocus="this.showPicker()" list="student-list">`;
          html += `<datalist id="student-list">`;
          let choiceCount = 0;
          for (const student of this.students) {
            if (this.rclients.map(rclient => rclient.student?.studentId).includes(student.studentId)) {
              continue;
            }
            if (pendingStudentIds.includes(student.studentId)) {
              continue;
            }
            html += `<option value="${student.studentId}">${student.name}</option>`;
            choiceCount++;
          }
          html += `</datalist>`;
          if (choiceCount === 0) {
            break;  // no more students to assign
          }
          const studentId = (await this.$fire({
            title: `请选择要为工控机${this.rclients[i].rclient.clientId}分配的学生`,
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
            await this.$alert("请选择要分配的学生");
            return;
          }
          pendingStudentIds.push(studentId);
          assignInfos.push({
            linkId: this.rclients[i].link!.linkId,
            studentId,
          });
        }
      }
      const resp: AxiosResponseType<void> = await this.axiosPost("/api/panel/admin/link/assignToStudentMulti", assignInfos);
      if (!resp.success) {
        await this.$alert("Failed: " + resp.message);
        return;
      }
      await Promise.all([this.loadAllLinks(), this.loadAllRClients()]);
    },
    async removeStudentsForSelected() {
      // 无法直接清除分配，通过删除访问码方式实现
      await this.removeLinksForSelected();
    },
    getRClientDisplayKey(key: string) {
      const [type, name] = key.split("#");
      if (type === "rclient") {
        return this.displayKeymap.rclient[name] ?? key;
      } else if (type === "link") {
        return this.displayKeymap.link[name] ?? key;
      } else if (type === "student") {
        return this.displayKeymap.student[name] ?? key;
      } else if (type === "camera") {
        return this.displayKeymap.camera[name] ?? key;
      } else {
        return key;
      }
    },
    getRClientDisplayValue(rclientObj: RClientResponseData, key: string) {
      const [type, name] = key.split("#");
      let ret: any = "N/A";
      if (type === "rclient") {
        ret = rclientObj?.rclient?.[name];
      } else if (type === "link") {
        ret = rclientObj?.link?.[name];
      } else if (type === "student") {
        ret = rclientObj?.student?.[name];
      } else if (type === "camera") {
        ret = rclientObj?.camera?.[name];
      }
      ret = ret ?? "N/A";
      // is Date
      if (/^\d{4,}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(ret)) {
        ret = new Date(ret).toLocaleString();
      } else if (ret === true) {
        ret = "是";
      } else if (ret === false) {
        ret = "否";
      }
      return ret;
    },
  },
  watch: {
    rclients() {
      localStorage?.removeItem("rclients_selectedStatus");
      if (this.tab === "rclients") {
        this.selectedStatus = Array.from({ length: this.rclients.length }, () => false);
      }
    },
    displayRClients() {
      localStorage?.removeItem("rclients_selectedStatus");
      if (this.tab === "rclients") {
        this.selectedStatus = Array.from({ length: this.displayRClients.length }, () => false);
      }
    },
    students() {
      localStorage?.removeItem("students_selectedStatus");
      if (this.tab === "students") {
        this.selectedStatus = Array.from({ length: this.students.length }, () => false);
      }
    },
    cameras() {
      localStorage?.removeItem("cameras_selectedStatus");
      // if(this.tab === "cameras") {  // @TODO:
      //   this.selectedStatus = Array.from({ length: this.cameras.length }, () => false);
      // }
    },
    logs() {
      localStorage?.removeItem("logs_selectedStatus");
      if (this.tab === "logs") {
        // this.selectedStatus = Array.from({ length: this.logs.length }, () => false); // @TODO:
      }
    },
  },
  computed: {
    displayRClients() {
      return this.rclients.filter(({ rclient }) => {
        if (this.rclientSearchCond === "") return true;
        return rclient?.clientId?.toLowerCase().includes(this.rclientSearchCond.toLowerCase());
      });
    },
    rclientKeys() {
      const keys = Object.keys(this.displayKeymap.rclient).map(s => "rclient#" + s);
      keys.push("link#linkPath");
      keys.push("link#validAfter");
      keys.push("link#validUntil");
      keys.push("student#name");
      keys.push("student#phone");
      return keys;
    },
  },
  async mounted() {
    this.tab = localStorage?.getItem("tab") as VueAppTab || "rclients";
    await this.loadAll();
  },
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
            <a href="javascript:void(0);" class="btn" v-on:click="searchClients">查找ID</a>
            <a href="javascript:void(0);" class="btn" v-on:click="showAllClients"
              v-if="displayRClients.length < rclients.length">显示全部</a>
            <a href="javascript:void(0);" class="btn" v-on:click="generateLinksForSelected"
              v-if="selectedStatus.filter(s => s).length > 0">生成访问码</a>
            <a href="javascript:void(0);" class="btn" v-on:click="removeLinksForSelected"
              v-if="selectedStatus.filter(s => s).length > 0">删除访问码</a>
            <a href="javascript:void(0);" class="btn" v-on:click="assignStudentsForSelected"
              v-if="selectedStatus.filter(s => s).length > 0">分配学生</a>
            <a href="javascript:void(0);" class="btn" v-on:click="removeStudentsForSelected"
              v-if="selectedStatus.filter(s => s).length > 0">清除分配</a>
            <a href="javascript:void(0);" class="btn align-right" v-on:click="logout">登出</a>
            <a href="javascript:void(0);" class="btn align-right" v-on:click="loadAll(true)">刷新</a>
          </div>
          <div class="table-responsive">
            <table class="table table-hover" v-if="rclients.length > 0">
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
                  <td v-for="key in rclientKeys">{{ getRClientDisplayValue(rclient, key) }}</td>
                  <!-- <td>
                    <a class="btn" href="javascript:void(0);" v-on:click="removeCard(card.cardId)">Remove
                      Card </a>
                  </td> -->
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-show="tab == 'students'">
          <div class="card-body-header">
            <a href="javascript:void(0);" class="btn" v-on:click="addStudent">添加学生</a>
            <a href="javascript:void(0);" class="btn" v-on:click="importStudentsFromCSV">从 CSV 导入</a>
            <a href="javascript:void(0);" class="btn" v-on:click="void 0;">批量删除</a>
            <a href="javascript:void(0);" class="btn align-right" v-on:click="logout">登出</a>
          </div>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>选择</th>
                  <th v-for="text in Object.keys(displayKeymap.student)">{{ text }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(student, i) in students">
                  <td>
                    <input type="checkbox" v-model="selectedStatus[i]" />
                  </td>
                  <td v-for="key in Object.keys(displayKeymap.student)">{{ student[key] }}</td>
                  <!-- <td>
                    <a class="btn" @click="increaseBookCount(book.bookId)">Increase</a>
                    <a class="btn" @click="decreaseBookCount(book.bookId)">Decrease</a>
                    <a class="btn" @click="removeBook(book.bookId)">Remove</a>
                  </td> -->
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <!-- <div v-show="tab == 'logs'">
          <div class="card-body-header">
            <a href="javascript:void(0);" class="btn" v-on:click="searchRentsByBook">Filter by Book</a>
            <a href="javascript:void(0);" class="btn" v-on:click="searchRentsByCard">Filter by Card</a>
            <a href="javascript:void(0);" class="btn align-right" v-on:click="logout">Logout</a>
          </div>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th class="text-center">rentId</th>
                  <th>cardId</th>
                  <th>bookId</th>
                  <th>rentDate</th>
                  <th>returnDate</th>
                  <th>Operation</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="rent in displayRents">
                  <td class="text-center">{{ rent.rentId }}</td>
                  <td>{{ rent.cardId }}</td>
                  <td>{{ rent.bookId }}</td>
                  <td>{{ rent.rentDate }}</td>
                  <td>{{ rent.returnDate }}</td>
                  <td>
                    <a class="btn" @click="manualReturn(rent.rentId)">Manual Return</a>
                    <a class="btn" @click="extendRentPeriod(rent.bookId)">Extend Period</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div> -->
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
  font-family: Consolas, 'Courier New', Courier, monospace;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  cursor: pointer;
}
</style>
