import React from 'react';

interface StoryContentProps {
  children: React.ReactNode;
  className?: string;
}

export const StoryContent: React.FC<StoryContentProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <main className={`story-content ${className}`}>
      {children}
    </main>
  );
};