# 便携版打包指南

本文档记录将 Photo Watermark Tools 打包为**零环境依赖、随处可用**便携版的完整经验，包括方案选型、踩坑与修复。

## 目标

让用户在**未安装 Node.js、pnpm、Python 等开发环境**的电脑上，也能直接使用本工具：

- 解压文件夹或 zip 即可运行
- 可拷贝到 U 盘、内网共享目录、其他 Windows 电脑
- 图片处理仍在本地浏览器完成，不上传网络

## 方案概述

本项目是 **React + Vite** 单页应用（SPA），构建后为静态 HTML/JS/CSS 文件。便携版采用：

```
Vite 静态构建（相对路径） + 内置本地 HTTP 服务器 + 一键启动脚本
```

### 为什么不能直接双击 index.html？

浏览器通过 `file://` 协议打开本地 HTML 时，ES Module 脚本会受同源策略限制，且部分 API 行为与 HTTP 环境不一致。SPA 必须通过 **本地 HTTP 服务** 访问才能稳定运行。

### 为什么需要本地服务器？

| 方式 | 问题 |
|------|------|
| 直接打开 `index.html` | ES Module / 资源加载受限，容易白屏或报错 |
| `vite preview` | 需要 Node.js 环境 |
| 内置 PowerShell HTTP 服务 | Windows 自带，零安装，适合便携分发 |

## 产物结构

执行打包后生成：

```
release/
├── photo-watermark-tools-portable/     # 解压即用文件夹
│   ├── start.bat                       # Windows 一键启动
│   ├── start.sh                        # macOS / Linux 启动
│   ├── server.ps1                      # Windows 本地 HTTP 服务
│   ├── README.txt                      # 面向最终用户的使用说明
│   ├── index.html
│   └── assets/                         # 构建后的 JS / CSS / 图片
└── photo-watermark-tools-portable.zip  # 推荐分发的压缩包
```

## 如何打包

### 前置条件（仅打包机器需要）

打包者本机需有 Node.js 与 pnpm，用于执行 `vite build`。最终用户**不需要**这些环境。

### 一键打包

```bash
pnpm run package:portable
```

等价于：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/package-portable.ps1
```

### 打包流程

1. **构建前端**：`pnpm run build -- --base ./`
   - 使用相对路径 `base: './'`，确保资源引用为 `./assets/...`，可在任意目录下通过 HTTP 访问
2. **组装便携目录**：将 `dist/`、`server.ps1`、`scripts/templates/` 中的启动文件复制到 `release/photo-watermark-tools-portable/`
3. **离线化处理**：从 `index.html` 移除 Google Fonts CDN 链接，字体回退到 `system-ui`
4. **压缩**：生成 `photo-watermark-tools-portable.zip`

### 相关文件

| 文件 | 作用 |
|------|------|
| `scripts/package-portable.ps1` | 主打包脚本 |
| `scripts/server.ps1` | Windows 本地 HTTP 服务 |
| `scripts/templates/start.bat` | Windows 启动入口 |
| `scripts/templates/start.sh` | macOS / Linux 启动入口 |
| `scripts/templates/README.txt` | 最终用户说明 |

## 最终用户使用方式

### Windows（推荐）

1. 解压 `photo-watermark-tools-portable.zip`
2. 双击 **`start.bat`**
3. 浏览器自动打开，命令行窗口显示访问地址
4. 关闭命令行窗口即停止服务

### macOS / Linux

```bash
bash start.sh
```

需要系统自带 Python 3（用于 `python -m http.server`）。

### 验证是否打开正确页面

浏览器标签页标题应为：

```
Photo Watermark & Border
```

若出现 Vue / Pinia 相关报错，说明**打开的不是本工具**（见下文「踩坑记录」）。

## 技术细节

### 本地 HTTP 服务（server.ps1）

- 基于 Windows 内置的 `System.Net.HttpListener`
- 默认从端口 **38472** 起，自动向上探测最多 50 个可用端口
- 启动后自动用默认浏览器打开对应 URL
- 按文件扩展名返回正确的 MIME 类型

端口选择使用 `TcpListener` 探测可用性，避免用 `HttpListener` 试探后端口未及时释放导致绑定失败。

### 构建参数

```bash
vite build --base ./
```

`base` 必须为相对路径，否则打包后资源会以绝对路径 `/assets/...` 引用，在非根路径服务时会 404。

### 离线字体

`index.html` 原本引用 Google Fonts（Plus Jakarta Sans）。便携版构建时移除该外链，Tailwind 配置中已有回退：

```js
fontFamily: {
  sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
}
```

离线环境下自动使用系统字体，不影响功能。

## 踩坑记录

### 1. 端口 5173 冲突，打开了别的应用

**现象：**

```
[Vue Router warn]: No match found for location with path "/"
Error: getActivePinia() was called but there was no active Pinia
App.vue / login.js / mySpace.js
```

**原因：**

- 初版默认端口为 **5173**（Vite 开发服务器默认端口）
- 用户本机若已有其他 Vite/Vue 项目在跑，浏览器访问 `http://127.0.0.1:5173/` 会进入**完全不同的应用**
- 报错中的 Vue、Pinia、阿里云日志与本项目（React）无关

**修复：**

- 默认端口改为 **38472**
- 增加端口自动探测
- 启动时提示页面标题应为 `Photo Watermark & Border`
- `start.bat` 中明确提示：**不要直接双击 index.html**

### 2. PowerShell 脚本中文乱码导致无法启动

**现象：**

```
The string is missing the terminator: ".
Unexpected token 'http://127.0.0.1:$Port/'
```

**原因：**

`server.ps1` 中含中文 `Write-Host` 输出，在部分环境下文件编码损坏，字符串字面量被截断，脚本解析失败。服务未真正启动，用户仍可能手动访问已被占用的 5173，看到错误应用。

**修复：**

- `server.ps1` 控制台输出改为**纯 ASCII 英文**，避免编码问题
- 中文说明放在 `README.txt`（UTF-8 文本文件，供用户阅读）

### 3. 中文文件名在打包时乱码

**现象：**

`启动.bat`、`使用说明.txt` 在复制/压缩后文件名变成乱码。

**修复：**

启动脚本和说明文件统一使用 ASCII 文件名：

- `start.bat`
- `README.txt`

文件**内容**仍可为中文。

### 4. 不能直接打开 index.html

**现象：**

用户绕过 `start.bat` 双击 `index.html`，页面无法正常工作。

**修复：**

- `start.bat` 启动时打印提示
- `README.txt` 中强调必须通过启动脚本运行

### 5. 打包脚本变量偶发为 null

**现象：**

`package-portable.ps1` 中 `$indexPath` 为 null，离线字体剔除步骤跳过。

**修复：**

不依赖中间变量 `$outDir`，改用完整路径拼接：

```powershell
$indexHtml = Join-Path (Join-Path (Join-Path $root 'release') $releaseName) 'index.html'
```

## 验证清单

打包完成后建议逐项确认：

- [ ] `release/photo-watermark-tools-portable.zip` 已生成
- [ ] 解压后双击 `start.bat` 可正常启动
- [ ] 命令行显示 `Photo Watermark Tools is running` 和 URL
- [ ] 浏览器标题为 `Photo Watermark & Border`
- [ ] 上传图片、预览、导出功能正常
- [ ] 断网状态下仍可正常使用（无 Google Fonts 依赖）
- [ ] 控制台无 Vue / Pinia 相关报错

## 后续可优化方向

| 方向 | 说明 |
|------|------|
| 内嵌字体文件 | 将 Plus Jakarta Sans 打包进 `assets/fonts/`，离线视觉与线上一致 |
| macOS 零依赖启动 | 为 Mac 也提供独立二进制静态服务器，摆脱 Python 依赖 |
| 自定义端口 | 支持 `start.bat 40000` 指定端口 |
| 系统托盘 | 启动后最小化到托盘，避免误关命令行窗口 |
| Electron / Tauri | 若需「双击即开、无命令行窗口」，可进一步打包为桌面应用 |

## 快速参考

```bash
# 开发者：重新打包
pnpm run package:portable

# 最终用户：Windows 使用
解压 zip → 双击 start.bat

# 排错：确认打开的是正确应用
看浏览器标题是否为 "Photo Watermark & Border"
```
