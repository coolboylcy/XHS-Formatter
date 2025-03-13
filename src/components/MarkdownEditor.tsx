import { useState, useRef, useEffect } from 'react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onImageMapChange: (imageMap: Record<string, string>) => void;
}

export default function MarkdownEditor({ value, onChange, onImageMapChange }: MarkdownEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageMap, setImageMap] = useState<Record<string, string>>({});

  // 当 imageMap 改变时，通知父组件
  useEffect(() => {
    onImageMapChange(imageMap);
  }, [imageMap, onImageMapChange]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadError(null);

      // 创建 FormData
      const formData = new FormData();
      formData.append('file', file);

      // 上传图片
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      
      // 生成简短的占位符
      const placeholder = `![${file.name}](image-${Date.now()})`;
      
      // 保存图片数据映射
      setImageMap(prev => ({
        ...prev,
        [placeholder]: data.url
      }));
      
      // 在光标位置插入占位符
      const textarea = document.querySelector('textarea');
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = value;
        const before = text.substring(0, start);
        const after = text.substring(end);
        onChange(before + placeholder + after);
        
        // 恢复光标位置
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
        }, 0);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageLinkInsert = () => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = value;
      const before = text.substring(0, start);
      const after = text.substring(end);
      const placeholder = '![图片描述](image-placeholder)';
      onChange(before + placeholder + after);
      
      // 恢复光标位置
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
      }, 0);
    }
  };

  // 在发送到预览之前，替换所有占位符为实际的图片数据
  const getPreviewContent = () => {
    let content = value;
    Object.entries(imageMap).forEach(([placeholder, imageData]) => {
      content = content.replace(placeholder, imageData);
    });
    return content;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">编辑 Markdown</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
                上传中...
              </>
            ) : (
              '上传图片'
            )}
          </button>
          <button
            type="button"
            onClick={handleImageLinkInsert}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            插入图片链接
          </button>
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />
      {uploadError && (
        <p className="text-red-500 text-sm mb-2">{uploadError}</p>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="在此输入 Markdown 文本...

使用 --- 进行分页"
        className="w-full h-[600px] p-4 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
      />
    </div>
  );
} 