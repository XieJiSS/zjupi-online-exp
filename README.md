# ZJUPI Online Classroom Platform

本项目由四个 repo，共计三个后端、一个前端、三个客户端组成。

This project consists of four repositories, which consists of three backends, one frontend, and three clients in total.

+ 给教师和学生使用的 Panel 的[前端](https://github.com/XieJiSS/zjupi-online-exp/tree/master/panel/panel-frontend)和[后端](https://github.com/XieJiSS/zjupi-online-exp/tree/master/panel)，技术栈分别为 Vue3 + vite + TypeScript 和 Node.js + Express.js + Sequelize + TypeScript
+ The frontend and backend for the panel used by teachers and students are built with Vue3 + Vite + TypeScript and Node.js + Express.js + Sequelize + TypeScript, respectively. You can find the frontend [here](https://github.com/XieJiSS/zjupi-online-exp/tree/master/panel/panel-frontend) and the backend [here](https://github.com/XieJiSS/zjupi-online-exp/tree/master/panel).
+ 用于控制、推流工控摄像头的工控机[客户端](https://github.com/XieJiSS/zjupi-camera-client)和[后端](https://github.com/XieJiSS/zjupi-online-exp/tree/master/camera)，技术栈分别为 Node.js + JS (JSDoc) + ffmpeg (HLS) 和 Node.js + Express.js + Sequelize + TypeScript
+ The client and backend for controlling and streaming industrial cameras are developed using Node.js + JS (JSDoc) + ffmpeg (HLS) and Node.js + Express.js + Sequelize (MySQL) + TypeScript, respectively. You can access the client repository [here](https://github.com/XieJiSS/zjupi-camera-client) and the backend [here](https://github.com/XieJiSS/zjupi-online-exp/tree/master/camera).
+ 用于在浏览器中远程控制电脑的[远程桌面客户端](https://github.com/XieJiSS/rustdesk/tree/fix_build)、[被控客户端](https://github.com/XieJiSS/zjupi-remote-client)和[后端](https://github.com/XieJiSS/zjupi-online-exp/tree/master/remote-control)。其中远程桌面客户端修改自开源项目 rustdesk，并继续以 AGPL 协议开源；被控客户端技术栈为 Node.js + JS (JSDoc)，后端技术栈为 Node.js + Express.js + Sequelize + TypeScript
+ The remote desktop client, controlled client, and backend for remotely controlling computers in a web browser are available at the following links: [Remote Desktop Client](https://github.com/XieJiSS/rustdesk/tree/fix_build), [Controlled Client](https://github.com/XieJiSS/zjupi-remote-client), and [Backend](https://github.com/XieJiSS/zjupi-online-exp/tree/master/remote-control). The remote desktop client is a modified version of the open-source project RustDesk, which remains open source under the AGPL license. The controlled client is developed using Node.js + JS (JSDoc), and the backend utilizes Node.js + Express.js + Sequelize + TypeScript.

全量引入了 type check，对 JS 也使用了 JSDoc 标注类型和 `@ts-check` 检查类型，以尽可能减少运行时错误。

Strong type checking is implemented throughout the project, including the use of JSDoc for annotating types and `@ts-check` for type checking, aiming to minimize runtime errors as much as possible. You can find some interesting type functions [here](https://github.com/XieJiSS/zjupi-online-exp/blob/master/types/type-helper.ts).

## Deployment

[部署文档（仅包含可公开的部分）](https://jiejiss.com/assets/zjupi-%E9%83%A8%E7%BD%B2%E6%96%87%E6%A1%A3.pdf)。
