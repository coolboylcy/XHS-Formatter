'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ImagePreview from '@/components/ImagePreview';
import MarkdownEditor from '@/components/MarkdownEditor';
import ImageCarousel from '@/components/ImageCarousel';
import DeepSeekInput from '@/components/DeepSeekInput';

export default function Home() {
  const [markdown, setMarkdown] = useState('');
  const [imageMap, setImageMap] = useState<Record<string, string>>({});

  const handleMarkdownChange = (newMarkdown: string) => {
    setMarkdown(newMarkdown);
  };

  const handleContentGenerated = (content: string) => {
    setMarkdown(content);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">小红书 Markdown 格式化工具</h1>
        
        <div className="space-y-8">
          <DeepSeekInput onGenerate={setMarkdown} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <MarkdownEditor
              value={markdown}
              onChange={setMarkdown}
              onImageMapChange={setImageMap}
            />
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">预览</h2>
              <ImagePreview
                markdown={markdown}
                imageMap={imageMap}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 