import React from 'react';

interface ImagePlaceholderProps {
  type?: 'image' | 'product' | 'option' | 'settings';
  size?: 'small' | 'medium' | 'large' | 'full';
  className?: string;
  label?: string;
}

const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  type = 'image',
  size = 'medium',
  className = '',
  label = 'Product Image'
}) => {
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-32 h-32',
    large: 'w-48 h-48',
    full: 'w-full h-full'
  };

  const getIconSVG = () => {
    switch (type) {
      case 'product':
      case 'option':
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="w-full h-full"
          >
            <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
        );
      
      case 'settings':
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="w-full h-full"
          >
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v6m5.66-13.66l-4.24 4.24m0 6.84l4.24 4.24M23 12h-6m-6 0H1m18.66 5.66l-4.24-4.24m0-6.84l4.24-4.24"/>
          </svg>
        );
      
      case 'image':
      default:
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="w-full h-full"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        );
    }
  };

  return (
    <div 
      className={`
        image-placeholder 
        flex items-center justify-center
        bg-gray-100 dark:bg-gray-800
        text-gray-400 dark:text-gray-500
        border border-gray-200 dark:border-gray-700
        rounded-lg
        transition-all duration-300
        hover:bg-gray-200 dark:hover:bg-gray-700
        ${sizeClasses[size]}
        ${className}
      `}
      role="img"
      aria-label={label}
    >
      <div className="w-1/2 h-1/2 opacity-60">
        {getIconSVG()}
      </div>
    </div>
  );
};

export default ImagePlaceholder;