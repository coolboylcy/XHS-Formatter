import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // 这里使用一个简单的示例响应，后续可以集成实际的 AI 服务
    const content = `# ${prompt}

这是一段示例内容，你可以根据需要修改。

## 主要特点

1. 清晰的结构
2. 简洁的表达
3. 重点突出

---

这是第二页的内容。

## 更多信息

- 项目一
- 项目二
- 项目三

> 重要提示：这是一个示例内容，你可以根据实际需求修改。`;

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
} 