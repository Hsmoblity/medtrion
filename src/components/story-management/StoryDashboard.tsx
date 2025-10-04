import React, { useState } from 'react';
import { StorySidebar } from './StorySidebar';
import { StoryHeader } from './StoryHeader';
import { StoryContent } from './StoryContent';

interface StoryDashboardProps {
  children: React.ReactNode;
  currentPage?: string;
}

export const StoryDashboard: React.FC<StoryDashboardProps> = ({ 
  children, 
  currentPage = 'dashboard' 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="story-management">
      <div className="story-dashboard">
        <StorySidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentPage={currentPage}
        />
        
        <div className="story-main-content">
          <StoryHeader 
            onMenuClick={() => setSidebarOpen(true)}
            currentPage={currentPage}
          />
          
          <StoryContent>
            {children}
          </StoryContent>
        </div>
      </div>
    </div>
  );
};