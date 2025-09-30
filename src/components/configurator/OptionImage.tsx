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

  // Show placeholder if no src or image failed to load
  if (!src || imageError) {
    return (
      <ImagePlaceholder
        type={placeholderType}
        size="full"
        className={className}
        label={alt}
      />
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
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
        priority={priority}
      />
    </div>
  );
};

export default OptionImage;