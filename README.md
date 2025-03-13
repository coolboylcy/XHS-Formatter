# XHS-Formatter

一个优雅的小红书笔记格式化工具，支持实时预览和图片生成。

## ✨ 功能特点

- 📝 实时 Markdown 编辑
- 🖼️ 小红书风格图片生成
- 📱 多页面支持
- 🎨 优雅的 UI 设计
- ⚡ 实时预览
- 🎯 进度条动画
- 🔄 自动保存

## 🚀 快速开始

### 环境要求

- Node.js 18.0 或更高版本
- npm 9.0 或更高版本

### 安装步骤

1. 克隆项目
```bash
git clone https://github.com/yourusername/XHS-Formatter.git
cd XHS-Formatter
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 打开浏览器访问
```
http://localhost:3000
```

## 💡 使用方法

1. 在左侧编辑器中输入 Markdown 内容
2. 使用 `---` 分隔符创建多页面
3. 实时预览右侧生成的图片效果
4. 使用页面导航按钮切换不同页面
5. 点击下载按钮保存图片

### Markdown 语法支持

- 标题（#）
- 列表（- 或 1.）
- 引用（>）
- 代码块（```）
- 图片（![alt](url)）
- 链接（[text](url)）
- 粗体（**text**）
- 斜体（*text*）

## 🛠️ 技术栈

- Next.js 14
- React
- TailwindCSS
- Puppeteer
- Markdown-it
- Highlight.js

## 📦 项目结构

```
XHS-Formatter/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── convert/
│   │   │       └── route.ts
│   │   └── page.tsx
│   ├── components/
│   │   ├── Editor.tsx
│   │   └── ImagePreview.tsx
│   └── styles/
│       └── globals.css
├── public/
├── package.json
└── README.md
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目。

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👥 作者

- 你的名字 - [@yourusername](https://github.com/yourusername)

## 🙏 致谢

- [Next.js](https://nextjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Puppeteer](https://pptr.dev/)
- [Markdown-it](https://markdown-it.github.io/)
- [Highlight.js](https://highlightjs.org/) 