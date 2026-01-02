
import React from 'react';
import { StoryPage } from '../types';

interface StoryCardProps {
  page: StoryPage;
  pageNumber: number;
  totalIsLoading?: boolean;
}

export const StoryCard: React.FC<StoryCardProps> = ({ page, pageNumber, totalIsLoading }) => {
  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-amber-100 flex flex-col md:flex-row mb-8">
      <div className="w-full md:w-1/2 relative bg-amber-50 flex items-center justify-center min-h-[300px]">
        {page.imageUrl ? (
          <img 
            src={page.imageUrl} 
            alt={`Page ${pageNumber} illustration`} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-4 text-amber-300">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            <p className="font-medium">繪製插畫中...</p>
          </div>
        )}
        <div className="absolute top-4 left-4 bg-amber-400 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-md">
          {pageNumber}
        </div>
      </div>
      <div className="w-full md:w-1/2 p-8 flex items-center">
        <p className="text-xl leading-relaxed text-gray-700 font-medium">
          {page.text}
        </p>
      </div>
    </div>
  );
};
