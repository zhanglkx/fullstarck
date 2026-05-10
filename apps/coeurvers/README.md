# CoeurVers (apps/coeurvers)

极简、高度可定制的浏览器新标签页扩展，已作为 Monorepo 子包集成到本仓库。

## 技术栈

- React 19 + TypeScript 5.9
- Vite 6（开发与打包）
- Tailwind CSS v4（@tailwindcss/postcss）
- Lucide React 图标库

## 快速开始

> 在仓库根目录执行（推荐）

```bash
# 启动开发服务器（http://localhost:3002）
pnpm dev:coeurvers

# 构建生产版本（输出到 apps/coeurvers/dist）
pnpm build:coeurvers

# 打包 Chrome 扩展（生成 CoeurVers-extension.zip）
pnpm --filter coeurvers pack

# Lint
pnpm --filter coeurvers lint
```

或者进入子包目录直接运行：

```bash
cd apps/coeurvers
pnpm dev
pnpm build
pnpm pack
```

## 端口约定

| 应用       | 端口  |
| ---------- | ----- |
| api        | 3000  |
| web        | 3001  |
| coeurvers  | 3002  |

## 作为 Chrome 扩展加载

1. 执行 `pnpm --filter coeurvers build`
2. 打开 `chrome://extensions/`
3. 开启「开发者模式」
4. 点击「加载已解压的扩展程序」，选择 `apps/coeurvers/dist/`
5. 打开新标签页即可看到效果

## 目录结构

```
apps/coeurvers/
├── App.tsx              # 根组件（状态聚合）
├── index.tsx            # 入口
├── index.html           # HTML 模板
├── index.css            # 全局样式（Tailwind v4）
├── components/          # UI 组件（ShortcutGrid / SettingsModal / ZenClockPanel）
├── hooks/               # 自定义 Hooks
├── lib/                 # 纯工具函数（树操作、存储编解码、图标等）
├── services/            # 副作用服务（壁纸、缓存）
├── public/              # 静态资源（manifest.json、图标、壁纸）
├── types.ts             # 全局类型定义
├── constants.ts         # 常量与 Favicon 工具
├── vite.config.ts       # Vite 配置（端口 3002）
├── tailwind.config.js   # Tailwind 配置
├── postcss.config.js    # PostCSS 配置
└── tsconfig.json        # 继承自 tsconfig.base.json
```

## 数据存储

- **localStorage**：设置、快捷方式、导航栈
- **IndexedDB**：壁纸缓存

所有数据均保存在本地，不会上传到任何服务端。

## 详细架构说明

更多关于状态管理、不可变树操作、拖拽合并、壁纸缓存等设计细节，请参阅
原项目说明文件（已随代码一并保留为 `apps/coeurvers/CLAUDE.md`）。
