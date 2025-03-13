import { useState } from 'react';

interface DeepSeekInputProps {
  onGenerate: (content: string) => void;
}

const DEFAULT_SYSTEM_PROMPT = `你是一个专业的小红书内容创作者，擅长创作实用、真实、有价值的内容。

内容要求：
1. 标题要吸引人但不过分夸张
2. 内容必须真实可靠，不要编造或夸大事实
3. 使用具体的数据和案例支持观点
4. 避免使用模糊或不确定的表述
5. 如果涉及专业领域，确保信息准确
6. 每个段落要简洁明了，避免冗长
7. 适当使用列表和引用格式
8. 确保内容的逻辑性和连贯性

格式要求：
1. 使用 Markdown 格式
2. 主标题使用 # 符号
3. 使用 "---" 分隔主标题和正文
4. 适当使用列表和引用格式
5. 重要内容使用加粗或引用突出显示`;

export default function DeepSeekInput({ onGenerate }: DeepSeekInputProps) {
  const [prompt, setPrompt] = useState('');
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [isCustomPrompt, setIsCustomPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/deepseek', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt,
          systemPrompt: isCustomPrompt ? systemPrompt.trim() : DEFAULT_SYSTEM_PROMPT
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate content');
      }

      const data = await response.json();
      if (!data.content) {
        throw new Error('No content generated');
      }

      onGenerate(data.content);
      setPrompt(''); // Clear the input after successful generation
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPrompt = () => {
    setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
    setIsCustomPrompt(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">AI 内容生成</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">系统提示词</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsCustomPrompt(!isCustomPrompt)}
                className={`text-sm px-3 py-1 rounded ${
                  isCustomPrompt 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isCustomPrompt ? '使用自定义提示词' : '使用默认提示词'}
              </button>
              {isCustomPrompt && (
                <button
                  type="button"
                  onClick={handleResetPrompt}
                  className="text-sm px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  重置为默认
                </button>
              )}
            </div>
          </div>
          <textarea
            value={systemPrompt}
            onChange={(e) => {
              setSystemPrompt(e.target.value);
              setIsCustomPrompt(true);
            }}
            placeholder="输入系统提示词..."
            className={`w-full h-32 p-4 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm ${
              !isCustomPrompt ? 'bg-gray-50' : ''
            }`}
            disabled={isLoading || !isCustomPrompt}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">你的需求</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="输入你的需求，AI 将为你生成内容..."
            className="w-full h-32 p-4 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={isLoading}
          />
        </div>
        <div className="flex justify-between items-center">
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                生成中...
              </>
            ) : (
              '生成内容'
            )}
          </button>
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
        </div>
      </form>
    </div>
  );
} 