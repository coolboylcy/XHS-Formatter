'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import JSZip from 'jszip';
import debounce from 'lodash/debounce';

interface ImagePreviewProps {
  markdown: string;
  imageMap: Record<string, string>;
}

export default function ImagePreview({ markdown, imageMap }: ImagePreviewProps) {
  const [images, setImages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [pageCache, setPageCache] = useState<Record<number, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentGeneratingPage, setCurrentGeneratingPage] = useState(0);

  const loadingMessages = [
    "正在生成图片...",
    "调整字体大小...",
    "优化排版...",
    "添加样式...",
    "处理图片...",
    "生成预览...",
    "马上就好...",
    "最后一步...",
    "即将完成...",
    "大功告成！"
  ];

  // 使用 useMemo 缓存页面内容
  const pages = useMemo(() => {
    if (!markdown.trim()) return [];
    return markdown.split('---').map(page => page.trim()).filter(page => page.length > 0);
  }, [markdown]);

  // 监听 markdown 内容变化
  useEffect(() => {
    if (markdown.trim()) {
      setIsGenerating(true);
      setError(null);
      setProgress(0);
      setCurrentGeneratingPage(0);
      
      // 生成所有页面的图片
      const generateAllPages = async () => {
        try {
          setTotalPages(pages.length);
          
          // 一次性生成所有页面的图片
          const pagePromises = pages.map((page, index) => {
            // 替换所有占位符为实际的图片数据
            let content = page;
            Object.entries(imageMap).forEach(([placeholder, imageData]) => {
              content = content.replace(placeholder, imageData);
            });

            return fetch('/api/convert', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ markdown: content }),
            })
            .then(response => {
              if (!response.ok) {
                throw new Error('Failed to generate image');
              }
              return response.json();
            })
            .then(data => {
              if (data.image) {
                setCurrentGeneratingPage(index + 1);
                setProgress((index + 1) * (100 / pages.length));
                return data.image;
              }
              throw new Error('No image generated');
            });
          });

          const generatedImages = await Promise.all(pagePromises);
          setImages(generatedImages);
          
          // 确保当前页面在有效范围内
          if (currentPage >= pages.length) {
            setCurrentPage(Math.max(0, pages.length - 1));
          }
        } catch (err) {
          console.error('Error generating pages:', err);
          setError('Failed to generate some pages');
        } finally {
          setIsGenerating(false);
          setProgress(100);
        }
      };

      generateAllPages();
    } else {
      setImages([]);
      setCurrentPage(0);
      setIsGenerating(false);
      setProgress(0);
      setCurrentGeneratingPage(0);
    }
  }, [markdown, pages, imageMap]);

  // 处理页面切换
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 0 && newPage < pages.length) {
      setCurrentPage(newPage);
    }
  }, [pages.length]);

  // 优化下载功能
  const downloadZip = useCallback(async () => {
    if (images.length === 0) return;

    const zip = new JSZip();
    images.forEach((image, index) => {
      const base64Data = image.split(',')[1];
      zip.file(`page-${index + 1}.png`, base64Data, { base64: true });
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = window.URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'xhs-pages.zip';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, [images]);

  // 优化分享功能
  const shareToiPhone = useCallback(async () => {
    if (images.length === 0) return;

    try {
      const response = await fetch(images[0]);
      const blob = await response.blob();
      const file = new File([blob], 'page-1.png', { type: 'image/png' });

      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: '小红书排版图片',
          text: '使用小红书排版工具生成的图片',
        });
      } else {
        throw new Error('Web Share API is not supported');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share image');
    }
  }, [images]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingMessageIndex(prev => (prev + 1) % loadingMessages.length);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-3"></div>
              <span className="text-gray-600 font-medium">
                正在生成第 {currentGeneratingPage} / {totalPages} 页
              </span>
            </div>
            <span className="text-primary font-semibold">{Math.round(progress)}%</span>
          </div>
          
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-gray-600">{loadingMessages[loadingMessageIndex]}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => {
            setError(null);
            setPageCache({});
            setCurrentPage(0);
          }}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          重试
        </button>
      </div>
    );
  }

  if (!images.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">预览区域</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full h-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="p-2 bg-white/80 hover:bg-white rounded-full shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === images.length - 1}
            className="p-2 bg-white/80 hover:bg-white rounded-full shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="absolute top-4 left-4 bg-white/80 px-3 py-1 rounded-full shadow-md text-sm font-medium z-10">
          {currentPage + 1} / {images.length}
        </div>
        {isGenerating ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <img
            src={images[currentPage]}
            alt={`Preview ${currentPage + 1}`}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        )}
      </div>
      <div className="flex justify-center gap-4">
        <button
          onClick={downloadZip}
          className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-opacity-90 transition-colors"
        >
          下载 ZIP
        </button>
        <button
          onClick={shareToiPhone}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
        >
          分享到 iPhone
        </button>
      </div>
    </div>
  );
} 