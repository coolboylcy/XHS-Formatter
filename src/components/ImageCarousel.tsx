'use client';

import { useState } from 'react';
import { useSwipeable } from 'react-swipeable';

interface ImageCarouselProps {
  images: string[];
}

export default function ImageCarousel({ images }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentIndex < images.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    },
    onSwipedRight: () => {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  if (images.length === 0) return null;

  return (
    <div className="relative w-full max-w-[540px] mx-auto">
      <div
        {...handlers}
        className="relative aspect-xhs bg-white rounded-lg shadow-lg overflow-hidden"
      >
        <img
          src={images[currentIndex]}
          alt={`Page ${currentIndex + 1}`}
          className="w-full h-full object-contain"
        />
        
        {/* Navigation Buttons */}
        <button
          onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
          className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white transition-opacity ${
            currentIndex === 0 ? 'opacity-0' : 'opacity-100'
          }`}
          aria-label="Previous image"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>
        
        <button
          onClick={() =>
            currentIndex < images.length - 1 && setCurrentIndex(currentIndex + 1)
          }
          className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white transition-opacity ${
            currentIndex === images.length - 1 ? 'opacity-0' : 'opacity-100'
          }`}
          aria-label="Next image"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-4'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 