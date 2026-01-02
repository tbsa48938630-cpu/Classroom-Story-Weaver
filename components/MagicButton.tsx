
import React from 'react';
import { Wand2 } from 'lucide-react';

interface MagicButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  loading?: boolean;
}

export const MagicButton: React.FC<MagicButtonProps> = ({ onClick, disabled, children, loading }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden group
        px-8 py-4 rounded-full font-bold text-white text-xl
        transition-all duration-300 transform
        ${disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:scale-105 active:scale-95 shadow-lg hover:shadow-pink-500/50'}
      `}
    >
      <div className="flex items-center justify-center gap-2">
        {loading ? (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        ) : (
          <Wand2 className="w-6 h-6 animate-pulse" />
        )}
        {children}
      </div>
      
      {/* Sparkles effect on hover */}
      {!disabled && !loading && (
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="sparkle top-2 left-4 text-white">✨</div>
          <div className="sparkle bottom-2 right-4 text-white">⭐</div>
          <div className="sparkle top-1/2 left-1/4 text-white">✨</div>
        </div>
      )}
    </button>
  );
};
