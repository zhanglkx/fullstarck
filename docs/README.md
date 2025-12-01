# 📚 Fullstarck 项目文档

欢迎来到 Fullstarck Monorepo 项目文档中心！

---

## 📖 文档索引

### 🚀 入门指南

| 文档 | 说明 | 适用对象 |
|------|------|---------|
| [快速开始](./QUICK_START.md) | 5 分钟快速运行三端应用 | 新手必读 |
| [手帐应用](./NOTES_APP.md) | 手帐应用的完整功能说明 | 所有开发者 |

### 🔧 配置指南

| 文档 | 说明 | 适用对象 |
|------|------|---------|
| [绝对路径导入](./ABSOLUTE_PATHS.md) | 三端绝对路径配置和使用 | 所有开发者 |
| [Metro 配置](./METRO_FIX.md) | Metro Bundler 问题修复 | 移动端开发者 |
| [iOS 运行指南](./IOS_SUCCESS.md) | iOS 模拟器运行步骤 | iOS 开发者 |

### 📝 技术文档

| 文档 | 说明 | 适用对象 |
|------|------|---------|
| [依赖更新](./DEPENDENCY_UPDATE.md) | 依赖版本更新记录 | 维护者 |
| [Web 页面优化](./WEB_PAGES_ENHANCEMENT.md) | Web 页面功能详解 | Web 开发者 |
| [项目重构](./REFACTOR.md) | 移动端重构记录 | 移动端开发者 |
| [Lint 修复](./LINT_FIX.md) | 代码规范修复记录 | 所有开发者 |

### ✅ 成功报告

| 文档 | 说明 | 适用对象 |
|------|------|---------|
| [项目运行报告](./SUCCESS_REPORT.md) | 三端运行验证报告 | 项目管理者 |
| [绝对路径配置成功](./ABSOLUTE_PATHS_SUCCESS.md) | 绝对路径配置验证 | 所有开发者 |
| [Web 修复报告](./WEB_FIX_REPORT.md) | Web 应用问题修复 | Web 开发者 |

---

## 🎯 按角色查找文档

### 新手开发者

推荐阅读顺序：
1. [快速开始](./QUICK_START.md) - 启动项目
2. [项目运行报告](./SUCCESS_REPORT.md) - 了解项目状态
3. [手帐应用](./NOTES_APP.md) - 学习示例应用

### Backend 开发者

推荐阅读：
- [快速开始](./QUICK_START.md)
- [绝对路径导入](./ABSOLUTE_PATHS.md)
- API 设计规范（待完善）

### Web 开发者

推荐阅读：
- [快速开始](./QUICK_START.md)
- [Web 页面优化](./WEB_PAGES_ENHANCEMENT.md)
- [绝对路径导入](./ABSOLUTE_PATHS.md)
- [Web 修复报告](./WEB_FIX_REPORT.md)

### Mobile 开发者

推荐阅读：
- [快速开始](./QUICK_START.md)
- [iOS 运行指南](./IOS_SUCCESS.md)
- [Metro 配置](./METRO_FIX.md)
- [项目重构](./REFACTOR.md)
- [绝对路径导入](./ABSOLUTE_PATHS.md)

### 项目维护者

推荐阅读：
- [依赖更新](./DEPENDENCY_UPDATE.md)
- [项目运行报告](./SUCCESS_REPORT.md)
- [Lint 修复](./LINT_FIX.md)
- 所有技术文档

---

## 🔍 按问题查找

### 运行问题

| 问题 | 查看文档 |
|------|---------|
| 如何启动三端应用？ | [快速开始](./QUICK_START.md) |
| Metro 启动失败？ | [Metro 配置](./METRO_FIX.md) |
| iOS 运行报错？ | [iOS 运行指南](./IOS_SUCCESS.md) |
| 端口冲突？ | [快速开始](./QUICK_START.md) |

### 开发问题

| 问题 | 查看文档 |
|------|---------|
| 如何配置绝对路径？ | [绝对路径导入](./ABSOLUTE_PATHS.md) |
| 如何共享代码？ | [手帐应用](./NOTES_APP.md) |
| Web 页面如何开发？ | [Web 页面优化](./WEB_PAGES_ENHANCEMENT.md) |
| 代码规范问题？ | [Lint 修复](./LINT_FIX.md) |

### 升级问题

| 问题 | 查看文档 |
|------|---------|
| 如何更新依赖？ | [依赖更新](./DEPENDENCY_UPDATE.md) |
| Node 版本要求？ | [Metro 配置](./METRO_FIX.md) |
| 有哪些破坏性更新？ | [项目重构](./REFACTOR.md) |

---

## 📝 文档贡献

### 文档规范

1. **文件命名**: 使用大写字母和下划线，如 `QUICK_START.md`
2. **标题层级**: 使用 `#` 到 `####`，最多 4 级
3. **代码块**: 必须指定语言，如 ` ```typescript `
4. **链接**: 使用相对路径链接其他文档
5. **表格**: 使用 Markdown 表格格式

### 新增文档

如需新增文档，请：

1. 在 `docs/` 目录创建 `.md` 文件
2. 按照规范编写文档
3. 在本文件（`docs/README.md`）中添加索引
4. 在主 `README.md` 中添加链接（如有必要）

---

## 🔄 文档更新记录

| 日期 | 更新内容 | 作者 |
|------|---------|------|
| 2025-12-01 | 创建文档中心，整理所有文档 | Fullstarck Team |
| 2025-12-01 | 添加绝对路径导入配置文档 | Fullstarck Team |
| 2025-12-01 | 添加 Web 页面优化文档 | Fullstarck Team |
| 2025-12-01 | 添加 iOS 运行指南 | Fullstarck Team |

---

<div align="center">

**💡 找不到你需要的文档？**

[提交 Issue](https://github.com/fullstarck/issues) 告诉我们！

</div>
