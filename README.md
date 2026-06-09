# Photo Watermark Tools

面向摄影师的在线照片边框与水印工具。在浏览器中完成 EXIF 读取、实时预览、高分辨率导出，无需安装桌面软件。

## 功能概览

### 照片水印编辑器

- **边框定制** — 独立调节上 / 右 / 下 / 左边距、圆角、旋转角度（±45°）
- **品牌水印** — 支持 Sony、Fuji、Canon、Nikon、Gmaster、Sigma
- **水印模板** — 默认单行居中、双行对齐（含竖线分隔）两种风格，可扩展
- **EXIF 自动填充** — 读取相机型号、镜头、焦距、光圈、快门、ISO
- **照片效果** — 可选柔和阴影；可选中部采样色彩条（5 色）
- **灵活导出** — PNG 无损 / JPEG 可调质量；分辨率可选原始 / 9000px / 5000px / 3000px
- **参数记忆** — 相机信息与编辑设置自动缓存至 localStorage

### 镜头焦外测试

全屏彩色圆点测试图，用于评估镜头虚化与焦外表现。支持规律 / 随机排列、密度与颜色模式调节，可下载测试图案。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18 + Vite 5 |
| 样式 | Tailwind CSS 3 |
| 图像 | Canvas 2D API |
| 元数据 | exif-js |
| 大图加载 | createImageBitmap（不支持时回退至 Image） |

## 项目结构

```
src/
├── App.jsx                     # 路由：水印编辑器 / 焦外测试
├── components/
│   ├── EditorPage.jsx          # 编辑器布局（侧栏 + 预览）
│   ├── EditorPreview.jsx       # 实时预览区
│   ├── ImageUpload.jsx         # 上传（点击 / 拖拽）
│   ├── Controls.jsx            # 边框 / 品牌 / 参数面板
│   ├── ExportSettings.jsx      # 导出设置
│   ├── WatermarkStyles.jsx     # 水印风格选择
│   ├── BokehTest.jsx           # 焦外测试页
│   └── ui/                     # 通用 UI 组件
├── constants/
│   ├── settings.js             # 默认值、分辨率预设、缓存字段
│   └── brands.js               # 品牌 Logo 配置
├── hooks/
│   ├── useEditorSettings.js    # 设置状态 + 持久化
│   └── useImageUpload.js       # 图片加载 + EXIF 解析
├── watermarks/                 # 水印模板 registry（可插拔）
│   ├── index.js
│   ├── default.js
│   ├── dualLine.js
│   └── shared.js
└── utils/
    ├── ImageProcessor.js       # 渲染编排（预览 / 导出）
    ├── imageLoader.js
    ├── exifParser.js
    ├── storage.js
    └── canvas/                 # 照片绘制、色彩条、Canvas 工具
```

## 快速开始

```bash
# 安装依赖
pnpm install

# 开发
pnpm run dev

# 代码检查
pnpm run lint

# 构建
pnpm run build

# 预览构建产物
pnpm run preview
```

## 使用说明

### 水印编辑

1. 在左侧上传区点击或拖拽照片（JPG / PNG / WebP）
2. 系统自动读取 EXIF 并填充拍摄参数
3. 通过 Tab 切换面板：
   - **样式** — 水印风格、品牌 Logo
   - **边框** — 边距、圆角、旋转、阴影
   - **参数** — 相机 / 镜头 / 拍摄信息
   - **导出** — 分辨率、格式、色彩条、下载
4. 右侧实时预览效果
5. 点击「下载图片」导出

### 焦外测试

1. 顶部导航切换至「焦外测试」
2. 将测试图全屏显示在镜头前拍摄
3. 对比不同光圈、焦距下的虚化效果
4. 按 `H` 隐藏 / 显示控制面板，按 `ESC` 返回编辑器

## 渲染机制

预览与导出采用**双通道**设计，互不影响：

| | 预览 | 导出 |
|---|------|------|
| Canvas | 页面可见 canvas | 离屏 canvas（`document.createElement`） |
| 最大宽度 | 1800px（保证流畅） | 按「输出分辨率」设置 |
| 像素比 | 跟随 `devicePixelRatio` | 固定 1:1，不受浏览器缩放影响 |
| 输出方式 | 仅显示 | `toBlob` 下载 |

## 扩展水印模板

在 `src/watermarks/` 下新建模板文件并注册：

```javascript
// src/watermarks/minimal.js
export default {
  id: 'minimal',
  name: '极简风格',
  extraFields: [],          // Controls 面板额外显示的字段
  draw(ctx, { settings, exifData, layout }) {
    // 绘制逻辑，返回 Promise
    return Promise.resolve();
  },
};
```

```javascript
// src/watermarks/index.js
import minimal from './minimal.js';

export const watermarkStyles = [defaultWatermark, dualLineWatermark, minimal];
```

UI 会自动读取 registry 展示新选项，无需修改 `ImageProcessor`。

## 支持的品牌

| 品牌 | ID |
|------|-----|
| Sony | `sony` |
| Fuji | `fuji` |
| Canon | `canon` |
| Nikon | `nikon` |
| Gmaster | `gmaster` |
| Sigma | `sigma` |

品牌 Logo 与默认缩放比例在 `src/constants/brands.js` 中配置。

## 导出分辨率

| 选项 | 最大宽度 |
|------|----------|
| 原始尺寸 | 原图像素宽度 |
| 高 | 9000px |
| 中 | 5000px |
| 低 | 3000px |

## 许可

MIT
