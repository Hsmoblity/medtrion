import React, { useState } from 'react';
import { StoryCard, Story } from './StoryCard';
import { StoryFilters } from './StoryFilters';

interface StoryListProps {
  stories: Story[];
  onEdit?: (story: Story) => void;
  onDelete?: (story: Story) => void;
  onDuplicate?: (story: Story) => void;
  onCreateStory?: () => void;
}

export const StoryList: React.FC<StoryListProps> = ({
  stories,
  onEdit,
  onDelete,
  onDuplicate,
  onCreateStory
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredStories, setFilteredStories] = useState<Story[]>(stories);

  const handleFilterChange = (filtered: Story[]) => {
    setFilteredStories(filtered);
  };

  const getViewModeIcon = (mode: 'grid' | 'list') => {
    if (mode === 'grid') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Stories</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track your product requirements
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${
                viewMode === 'grid' 
                  ? 'bg-white text-brand-blue shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-label="Grid view"
            >
              {getViewModeIcon('grid')}
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${
                viewMode === 'list' 
                  ? 'bg-white text-brand-blue shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-label="List view"
            >
              {getViewModeIcon('list')}
            </button>
          </div>

          {/* Create Story Button */}
          {onCreateStory && (
            <button
              onClick={onCreateStory}
              className="btn btn-primary"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Story
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <StoryFilters 
        stories={stories}
        onFilterChange={handleFilterChange}
      />

      {/* Stories Grid/List */}
      {filteredStories.length > 0 ? (
        <div className={viewMode === 'grid' ? 'story-grid' : 'space-y-4'}>
          {filteredStories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              onEdit={onEdit}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No stories found</h3>
          <p className="text-gray-500 mb-6">
            {stories.length === 0 
              ? "Get started by creating your first user story."
              : "Try adjusting your search or filter criteria."
            }
          </p>
          {onCreateStory && stories.length === 0 && (
            <button
              onClick={onCreateStory}
              className="btn btn-primary"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Your First Story
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {filteredStories.length > 0 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-6">
          <div className="flex items-center text-sm text-gray-500">
            <span>
              Showing {filteredStories.length} of {stories.length} stories
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              className="btn btn-secondary btn-sm"
              disabled
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            
            <div className="flex items-center space-x-1">
              <button className="px-3 py-2 text-sm font-medium text-brand-blue bg-brand-blue-light rounded">
                1
              </button>
              <button className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 rounded">
                2
              </button>
              <button className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 rounded">
                3
              </button>
            </div>
            
            <button
              className="btn btn-secondary btn-sm"
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};