# 净水工厂 EHS Web

面向净水工厂的 EHS 管理 Web 前端，界面基于项目内的 Halo Prism 设计系统实现。

## 当前内容

- EHS 管理总览
- 手持电动工具管理
- 能源数据管理
- 人员证件管理
- 危废存量管理
- 化学品管理
- 跨模块全局搜索、状态筛选、新增记录和 CSV 导出
- 记录详情抽屉、预填编辑、删除确认和限时撤销
- 通知中心、快捷帮助、键盘快捷键和操作反馈
- 手机端卡片式数据记录与抽屉导航
- 浏览器本地存储和响应式布局

当前项目从空数据开始，新增内容保存在当前浏览器的 `localStorage` 中，不连接服务器或真实业务数据库。

## 启动

双击 `start-preview.cmd`，或者在 PowerShell 中运行：

```powershell
node server.mjs 4179
```

然后访问 <http://127.0.0.1:4179>。

## 目录

- `index.html`：应用入口和整体结构
- `assets/app.css`：EHS 页面样式
- `assets/app.js`：页面渲染和本地交互
- `server.mjs`：零依赖本地静态服务器
- `popular-gecko-2-a4586e66/`：原始 Halo Prism 模板和设计说明
