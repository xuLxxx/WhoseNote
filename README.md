# [Whose note](https://github.com/) &middot; ![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)

## React + React Native + Express + TypeScript + TypeORM

## CRX-JS + Radix UI + ShadcnUI 

# 2026年6月新版本 - 插件

新增浏览器插件，此插件目的为了实现AI赋能插件，使得用户可以在其他网页中使用AI进行生成摘要，翻译，检索笔记。

- 使用Radix Primitive组件库完成插件内容脚本的UI，加快插件加载速度。
- 使用Shadow DOM实现内容脚本的样式隔离。
- 使用Google提供的客户端AI模型，实现生成摘要，翻译功能。客户端模型优势在于，不依赖服务器，速度更快，隐私保护更好。

# 什么是 Whose note

`Whose note`是个人全栈应用。具备**高度集成组件**特点。动态菜单(服务器返回菜单内容)，单向数据流管理主题明暗，菜单折叠，面包屑组件状态，Web 端使用 `React` 。移动端使用 `React Native` 。分别使用 Redux `@rematch/core` `@toolkit` 实现状态管理。路由使用 `React Router`，`expo-router`。
`Whose note`是一个**笔记应用**，**主题切换，解析 markdown,上传 markdown,用户可以在日历、待办列表中快速增删事件，拖曳排序，快速筛选**

# 如何初始化 Setup

如何初始化此项目:

1. 克隆仓库：`git clone ...`.
2. 安装依赖: `cd api && npm install`
3. 启动客户端开发服务器: `cd .. && npm run client`
4. 安装依赖: `cd client && npm install`
5. 启动服务端开发服务器: `cd .. && npm run api`

`npm run dev`--> `concurrnently "npm run api" "npm run client"`
注意：在 Install 之前在`api`目录下创建`.env`文件，内容如下：

```
PORT=....
DB_HOST=....
DB_PORT=....
DB_USERNAME=....
DB_PASSWORD=....
DB_DATABASE=....
JWT_SECRET=....
```

# 特点 Features

- 全部使用 ts,tsx
- 采用现代 React 风格编写，使用仅包含 Hooks 的函数式组件
- 自定义组件存放于 `components` 包中（动态菜单,Layout,面包屑,Todo,Calendar,Markdown,自定义 Icon 等功能组件）
- **主题切换** less 实现
- api 由 express 提供并使用 typeorm 连接 PostgreSQL 数据库
- 经实践验证、可扩展且易于理解的 Express 项目结构
- 使用经典的 NodeJS & Vite 尽可能地构建轻量的项目，而不是使用脚手架工具。
- React 使用 Redux @rematch/core 管理状态，RN 使用 Redux @toolkit 分别提供了一个完整的学习 Redux 样例。
- Axios + Redux **封装 LRU 缓存算法**来减少重复的 Get 请求。
- multer 实现 Express **通用上传文件**功能。
- 健全的 markdown 解析，支持 h1-h6,图片,链接,代码块,表格,引用,分割线,列表等。
- React Native 使用官方推荐的 expo 框架搭建。
- fullcalandar 第三库实现一个独具特色的日历。
- 日历组件支持事件的增删改查，拖曳修改事件时间，自定义样式，同步后端数据库存储。
- 提供一个原生 JS 实现 Drag & Drop 功能的 Todo 组件。
- Todo 组件支持筛选，拖曳排序，增删改查，同步后端数据库存储。
- Google 客户端 AI 模型，浏览器插件实现生成摘要，翻译功能。
- 提供一个拖曳自动吸附的悬浮球的实现思路，无依赖无冗余，可观的动画以及极少的bug。
- 插件与网页端使用同一份cookie，实现用户登录状态的同步。

# 评述 Observation

- 这个项目的想法是提供一个学习路线，记录着我个人的学习，这个项目并不能媲美任何其他项目。
- 其实并不需要 Redux,我只是想练习一下 Redux。完全可以通过 Simple local React state management 实现。例如 useReduce useContext 实现
- Node.JS 后端大多数的功能实现并不适合生产环境
- 一个简单但尽可能完整的 React Native
- AI赋能的浏览器插件，使用了Google提供的客户端AI模型，实现生成摘要，翻译功能。

# 截图 Screenshots

![alt text](/assets/screenshots/image.png)
![alt text](/assets/screenshots/image-1.png)
![alt text](/assets/screenshots/image-2.png)
![alt text](/assets/screenshots/image-3.png)
![alt text](/assets/screenshots/image-4.png)
![alt text](/assets/screenshots/image-5.png)
![alt text](/assets/screenshots/0f41e6f4a15a39ee785f40bf39bcc47.jpg)
![alt text](/assets/screenshots/b533460d4e1157951480239424d5109.jpg)
![alt text](/assets/screenshots/c238d62da2b63bd774fc49ad9ec72a9.jpg)
![alt text](/assets/screenshots/image-6.png)
![alt text](/assets/screenshots/image-7.png)
![alt text](/assets/screenshots/image-8.png)
![alt text](/assets/screenshots/image-9.png)

# 技术选型 Tech Stack

- React Axios Antd React Router Vite
- React Native Expo
- TypeScript
- Express TypeOrm PostgresSQL WebSocket
- Redux @rematch/core in React
- Redux @toolkit in React Native
- React-Markdown & React-Native-Marked

# 展望 | 未完成 | Future & Not Done Yet

- [√] 完善基于 Websocket 的实时聊天功能、评论和实时聊天功能
- [ ] 优化 markdown 内的图片上传
- [ ] Docker 部署到服务器完成云存储等功能
- [ ] React-Native Markdown 无法实现生成目录。
- [ ] 外置浏览器插件，实现AI赋能插件，使得用户可以在其他网页中使用AI进行检索笔记。

# Repo Public

个人学习项目。不接受 PR，你有更好的想法随意 Fork 或 Clone 开发你自己的版本。
Private Learning demo.Will not accept PRs. Feel free to fork and develop your own version if you have better ideas.
