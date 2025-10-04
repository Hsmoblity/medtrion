import React, { useState } from 'react';
import Image from 'next/image';
import ImagePlaceholder from '../ImagePlaceholder';

interface OptionImageProps {
  src?: string | null;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholderType?: 'image' | 'product' | 'option' | 'settings';
  priority?: boolean;
  fill?: boolean;
}

const OptionImage: React.FC<OptionImageProps> = ({
  src,
  alt,
  width = 200,
  height = 200,
  className = '',
  placeholderType = 'option',
  priority = false,
  fill = false
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(!!src);

  // Debug logging for image props
  console.log('OptionImage: Rendering with props:', {
    src,
    alt,
    hasSrc: !!src,
    imageError,
    isLoading,
    placeholderType
  });

  // Show placeholder if no src or image failed to load
  if (!src || imageError) {
    console.log('OptionImage: Showing placeholder for:', { src, imageError, alt });
    return (
      <div className={`relative bg-gray-100 border-2 border-dashed border-gray-300 ${className}`}>
        <ImagePlaceholder
          type={placeholderType}
          size="full"
          className="w-full h-full"
          label={imageError ? 'Image failed to load' : 'No image available'}
        />
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 bg-opacity-75">
            <div className="text-xs text-red-600 text-center">
              <div className="font-semibold">Image Error</div>
              <div className="text-gray-500">Failed to load</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={!fill ? { width, height } : undefined}>
      {/* Loading placeholder */}
      {isLoading && (
        <div className="absolute inset-0 z-10">
          <ImagePlaceholder
            type={placeholderType}
            size="full"
            label="Loading..."
          />
        </div>
      )}
      
      {/* Actual image */}
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 ${fill ? 'object-cover' : ''}`}
        onLoad={() => {
          console.log('OptionImage: Image loaded successfully:', src);
          setIsLoading(false);
        }}
        onError={(e) => {
          console.error('OptionImage: Image failed to load:', src, e);
          setImageError(true);
          setIsLoading(false);
        }}
        priority={priority}
      />
    </div>
  );
};

export default OptionImage;