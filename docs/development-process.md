# XHS-Formatter 项目开发文档

## 项目概述

XHS-Formatter 是一个基于 Next.js 开发的小红书文章排版工具，可以将 Markdown 文本转换为小红书风格的图片。本文档记录了项目的完整开发过程和技术实现细节。

## 技术栈选择

- **前端框架**: Next.js 14
- **样式方案**: TailwindCSS
- **Markdown 处理**: Markdown-it
- **图片生成**: Puppeteer
- **代码高亮**: Highlight.js
- **状态管理**: React Hooks

## 项目结构

```
XHS-Formatter/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── convert/     # 图片转换 API
│   │   │   ├── deepseek/    # AI 生成 API
│   │   │   ├── generate/    # 图片生成 API
│   │   │   └── upload/      # 文件上传 API
│   │   ├── globals.css      # 全局样式
│   │   ├── layout.tsx       # 布局组件
│   │   └── page.tsx         # 主页面
│   └── components/
│       ├── DeepSeekInput    # AI 输入组件
│       ├── ImageCarousel    # 图片轮播组件
│       ├── ImagePreview     # 图片预览组件
│       └── MarkdownEditor   # Markdown 编辑器
```

## 开发过程

### 1. 项目初始化

1. 创建 Next.js 项目
```bash
npx create-next-app@latest XHS-Formatter
```

2. 配置 TailwindCSS
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2. 核心功能实现

#### 2.1 Markdown 编辑器

1. 实现实时编辑和预览
2. 支持多页面编辑（使用 `---` 分隔符）
3. 添加代码高亮功能
4. 实现自动保存功能

#### 2.2 图片生成服务

1. 使用 Puppeteer 实现 HTML 到图片的转换
2. 设计 3:4 比例的图片模板
3. 优化字体大小和间距
4. 实现多页面并行生成

#### 2.3 预览组件

1. 实现图片预览功能
2. 添加页面切换动画
3. 实现进度条显示
4. 优化图片缓存机制

### 3. API 实现

#### 3.1 /api/convert

```typescript
export async function POST(req: Request) {
  const { markdown, pageIndex } = await req.json();
  
  // 1. 转换 Markdown 为 HTML
  const html = md.render(markdown);
  
  // 2. 使用 Puppeteer 生成图片
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // 3. 设置页面样式和内容
  await page.setViewport({ width: 750, height: 1000 });
  await page.setContent(html);
  
  // 4. 生成图片
  const screenshot = await page.screenshot();
  
  // 5. 返回 Base64 编码的图片
  return new Response(screenshot.toString('base64'));
}
```

#### 3.2 图片生成优化

1. 实现并行生成多页图片
2. 添加错误处理和重试机制
3. 优化图片质量和大小
4. 实现图片缓存机制

### 4. 用户界面优化

1. 实现响应式设计
2. 添加加载动画
3. 优化编辑器体验
4. 添加快捷键支持

### 5. 性能优化

1. 实现图片懒加载
2. 优化并行生成性能
3. 添加防抖处理
4. 优化缓存策略

### 6. 部署准备

1. 添加环境变量配置
2. 优化构建配置
3. 添加错误处理
4. 完善文档

## 关键技术点

### 1. 多页面处理

```typescript
const pages = markdown.split('---').map(page => page.trim());
const images = await Promise.all(
  pages.map(page => generatePageImage(page))
);
```

### 2. 图片生成优化

```typescript
async function generatePageImage(markdown: string) {
  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 750, height: 1000 });
    await page.setContent(getTemplate(markdown));
    return await page.screenshot({ type: 'png' });
  } finally {
    await browser.close();
  }
}
```

### 3. 缓存机制

```typescript
const imageCache = new Map<string, string>();

function getCachedImage(key: string) {
  return imageCache.get(key);
}

function setCachedImage(key: string, image: string) {
  imageCache.set(key, image);
}
```

## 后续优化方向

1. 添加更多主题模板
2. 优化图片生成速度
3. 添加更多自定义选项
4. 支持更多 Markdown 扩展语法
5. 添加图片编辑功能
6. 优化移动端体验

## 部署说明

1. 环境要求
   - Node.js 18.0+
   - npm 9.0+
   - 足够的内存用于图片生成

2. 安装步骤
   ```bash
   git clone https://github.com/coolboylcy/XHS-Formatter.git
   cd XHS-Formatter
   npm install
   npm run build
   npm start
   ```

3. 环境变量配置
   ```env
   NEXT_PUBLIC_API_URL=your_api_url
   PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
   ```

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 问题排查

### 常见问题

1. 图片生成失败
   - 检查内存使用情况
   - 确认 Puppeteer 安装正确
   - 检查网络连接

2. 预览不更新
   - 清除浏览器缓存
   - 检查 WebSocket 连接
   - 重新加载页面

### 调试技巧

1. 使用 Chrome DevTools
2. 检查 Network 面板
3. 查看控制台日志
4. 使用断点调试

## 更新日志

### v1.0.0
- 初始版本发布
- 支持基本的 Markdown 转换
- 实现多页面处理
- 添加实时预览功能 