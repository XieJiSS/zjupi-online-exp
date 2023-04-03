# ZJUPI Online Classroom Platform

本项目由四个 repo，共计三个后端、一个前端、三个客户端组成。

+ 给教师和学生使用的 Panel 的[前端](https://github.com/XieJiSS/zjupi-online-exp/tree/master/panel/panel-frontend)和[后端](https://github.com/XieJiSS/zjupi-online-exp/tree/master/panel)，技术栈分别为 Vue3 + vite + TypeScript 和 Node.js + Express.js + Sequelize + TypeScript
+ 用于控制、推流工控摄像头的工控机[客户端](https://github.com/XieJiSS/zjupi-camera-client)和[后端](https://github.com/XieJiSS/zjupi-online-exp/tree/master/camera)，技术栈分别为 Node.js + JS (JSDoc) + ffmpeg (HLS) 和 Node.js + Express.js + Sequelize + TypeScript
+ 用于在浏览器中远程控制电脑的[远程桌面客户端](https://github.com/XieJiSS/rustdesk/tree/fix_build)、[被控客户端](https://github.com/XieJiSS/zjupi-remote-client)和[后端](https://github.com/XieJiSS/zjupi-online-exp/tree/master/remote-control)。其中远程桌面客户端修改自开源项目 rustdesk，并继续以 AGPL 协议开源；被控客户端技术栈为 Node.js + JS (JSDoc)，后端技术栈为 Node.js + Express.js + Sequelize + TypeScript

全量引入了 type check，对 JS 也使用了 JSDoc 标注类型和 `@ts-check` 检查类型，以尽可能减少运行时错误。

[部署文档（仅包含可公开的部分）](https://jiejiss.com/assets/zjupi-%E9%83%A8%E7%BD%B2%E6%96%87%E6%A1%A3.pdf)。
