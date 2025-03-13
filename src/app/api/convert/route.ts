import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import { readFile } from 'fs/promises';
import { join } from 'path';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (__) {}
    }
    return ''; // use external default escaping
  }
});

// 计算基础字体大小
function calculateBaseFontSize(content: string): number {
  // 移除 Markdown 标记，只计算实际文本长度
  const plainText = content.replace(/[#*_`~>]|\[.*?\]|\(.*?\)/g, '').trim();
  const charCount = plainText.length;
  
  // 根据字符数动态调整基础字体大小（3倍于原来的大小）
  if (charCount < 10) return 72;      // 非常短的内容 (24 * 3)
  if (charCount < 30) return 60;      // 短内容 (20 * 3)
  if (charCount < 50) return 54;      // 中等内容 (18 * 3)
  if (charCount < 100) return 48;     // 较长内容 (16 * 3)
  return 42;                          // 长内容 (14 * 3)
}

// 处理图片 URL
async function handleImageUrl(url: string): Promise<{ contentType: string; buffer: Buffer } | null> {
  try {
    if (url.startsWith('/uploads/')) {
      const filePath = join(process.cwd(), 'public', url);
      const buffer = await readFile(filePath);
      const contentType = url.endsWith('.png') ? 'image/png' : 
                         url.endsWith('.jpg') || url.endsWith('.jpeg') ? 'image/jpeg' : 
                         url.endsWith('.gif') ? 'image/gif' : 'image/jpeg';
      return { contentType, buffer };
    }
    return null;
  } catch (error) {
    console.error('Error handling image URL:', error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { markdown } = await request.json();

    if (!markdown) {
      return NextResponse.json(
        { error: 'Markdown content is required' },
        { status: 400 }
      );
    }

    // 计算基础字体大小
    const baseFontSize = calculateBaseFontSize(markdown);

    // Convert markdown to HTML
    const html = md.render(markdown).replace(
      /<h1>(.*?)\((.*?)\)(.*?)<\/h1>/g,
      (match, before, highlight, after) => {
        return `<h1>${before}<span class="highlight">${highlight}</span>${after}</h1>`;
      }
    );

    // Launch browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // Create new page
    const page = await browser.newPage();

    // Set viewport to exact 3:4 aspect ratio with correct resolution
    await page.setViewport({
      width: 1080,
      height: 1440,
      deviceScaleFactor: 1,
    });

    // Enable request interception to handle local images
    await page.setRequestInterception(true);
    page.on('request', async (request) => {
      const url = request.url();
      console.log('Request URL:', url); // 添加日志

      try {
        if (url.startsWith('data:')) {
          // 处理 base64 图片
          const [header, base64Data] = url.split(',');
          const contentType = header.split(';')[0].split(':')[1];
          const buffer = Buffer.from(base64Data, 'base64');
          request.respond({
            status: 200,
            contentType,
            body: buffer
          });
        } else {
          request.continue();
        }
      } catch (error) {
        console.error('Error handling request:', error);
        request.continue();
      }
    });

    // Set content with styles
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
          <style>
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            html, body {
              width: 1080px;
              height: 1440px;
              margin: 0;
              padding: 0;
              overflow: hidden;
              background: white;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              padding: 60px;
            }
            .content {
              width: 100%;
              max-width: 840px;
              margin: auto;
              height: 100%;
              display: flex;
              flex-direction: column;
              justify-content: center;
              overflow-y: auto;
              padding-right: 40px;
            }
            .content::-webkit-scrollbar {
              width: 8px;
            }
            .content::-webkit-scrollbar-track {
              background: #f1f1f1;
              border-radius: 4px;
            }
            .content::-webkit-scrollbar-thumb {
              background: #888;
              border-radius: 4px;
            }
            .content::-webkit-scrollbar-thumb:hover {
              background: #555;
            }
            h1 { 
              font-size: ${baseFontSize * 2.2}px; 
              margin-bottom: ${baseFontSize * 1.2}px;
              line-height: 1.3;
              color: #1a1a1a;
              font-weight: 800;
              text-align: center;
              position: relative;
              padding-bottom: ${baseFontSize * 0.5}px;
            }
            h1::after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 50%;
              transform: translateX(-50%);
              width: ${baseFontSize * 2}px;
              height: 4px;
              background: linear-gradient(90deg, #FF2442, #FF6B6B);
              border-radius: 2px;
            }
            h1 span.highlight {
              color: #1a1a1a;
              font-weight: 900;
              position: relative;
              display: inline-block;
              background: linear-gradient(transparent 60%, #FFFACD 60%);
              padding: 0 4px;
              border-radius: 2px;
            }
            h1 span.highlight::after {
              content: '';
              position: absolute;
              bottom: -2px;
              left: 0;
              width: 100%;
              height: 12px;
              background: rgb(255, 166, 0);
              transform: skew(-10deg);
              z-index: -1;
            }
            h1 span.highlight:nth-child(odd)::after {
              background: rgb(255, 255, 0);
            }
            h2 { 
              font-size: ${baseFontSize * 1.5}px; 
              margin-bottom: ${baseFontSize * 0.7}px;
              line-height: 1.3;
              color: #1a1a1a;
            }
            h3 {
              font-size: ${baseFontSize * 1.3}px;
              margin-bottom: ${baseFontSize * 0.6}px;
              line-height: 1.3;
              color: #1a1a1a;
            }
            p { 
              margin-bottom: ${baseFontSize * 1.2}px;
              font-size: ${baseFontSize}px;
              color: #333;
            }
            ul, ol { 
              margin-bottom: ${baseFontSize * 1.2}px; 
              padding-left: ${baseFontSize * 1.5}px;
            }
            li { 
              margin-bottom: ${baseFontSize * 0.8}px;
              font-size: ${baseFontSize}px;
              color: #333;
            }
            img {
              max-width: 100%;
              height: auto;
              margin: ${baseFontSize * 0.8}px 0;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            blockquote {
              border-left: 4px solid #FF2442;
              padding-left: ${baseFontSize}px;
              margin: ${baseFontSize * 1.2}px 0;
              color: #666;
              font-style: italic;
              font-size: ${baseFontSize * 0.95}px;
            }
            code {
              background: #f5f5f5;
              padding: 2px 6px;
              border-radius: 4px;
              font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
              font-size: ${baseFontSize * 0.9}px;
            }
            pre {
              background: #1e1e1e;
              padding: ${baseFontSize}px;
              border-radius: 8px;
              overflow-x: auto;
              margin: ${baseFontSize * 1.2}px 0;
              position: relative;
            }
            pre::before {
              content: "bash";
              position: absolute;
              top: ${baseFontSize * 0.5}px;
              right: ${baseFontSize}px;
              color: #888;
              font-size: ${baseFontSize * 0.8}px;
              font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            }
            pre code {
              background: none;
              padding: 0;
              font-size: ${baseFontSize * 0.9}px;
              color: #00ff00;
              font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
              white-space: pre-wrap;
              word-wrap: break-word;
            }
            a {
              color: #FF2442;
              text-decoration: none;
              border-bottom: 1px solid transparent;
              transition: border-color 0.2s;
              font-size: ${baseFontSize}px;
            }
            a:hover {
              border-bottom-color: #FF2442;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: ${baseFontSize * 1.2}px 0;
            }
            th, td {
              padding: ${baseFontSize * 0.8}px;
              border: 1px solid #ddd;
              text-align: left;
              font-size: ${baseFontSize}px;
            }
            th {
              background: #f5f5f5;
              font-weight: 600;
            }
            hr {
              border: none;
              border-top: 1px solid #eee;
              margin: ${baseFontSize * 1.2}px 0;
            }
          </style>
        </head>
        <body>
          <div class="content">
            ${html}
          </div>
        </body>
      </html>
    `);

    // Generate screenshot with exact resolution
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false,
      clip: {
        x: 0,
        y: 0,
        width: 1080,
        height: 1440
      }
    });

    // Close browser
    await browser.close();

    // Return the screenshot as base64
    return NextResponse.json({
      image: `data:image/png;base64,${Buffer.from(screenshot).toString('base64')}`,
    });
  } catch (error) {
    console.error('Error converting markdown to image:', error);
    return NextResponse.json(
      { error: 'Failed to convert markdown to image' },
      { status: 500 }
    );
  }
} 