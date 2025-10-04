import React from 'react';
import Link from 'next/link';

export interface Story {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'validated' | 'technical-review' | 'ready-for-development';
  priority: 'high' | 'medium' | 'low';
  storyPoints: number;
  epic?: {
    id: string;
    name: string;
  };
  createdBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  acceptanceCriteria: string[];
}

interface StoryCardProps {
  story: Story;
  onEdit?: (story: Story) => void;
  onDelete?: (story: Story) => void;
  onDuplicate?: (story: Story) => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  onEdit,
  onDelete,
  onDuplicate
}) => {
  const getStatusBadgeClass = (status: Story['status']) => {
    switch (status) {
      case 'draft':
        return 'badge-draft';
      case 'validated':
        return 'badge-validated';
      case 'technical-review':
        return 'badge-technical-review';
      case 'ready-for-development':
        return 'badge-ready-for-development';
      default:
        return 'badge-draft';
    }
  };

  const getPriorityBadgeClass = (priority: Story['priority']) => {
    switch (priority) {
      case 'high':
        return 'badge-high-priority';
      case 'medium':
        return 'badge-medium-priority';
      case 'low':
        return 'badge-low-priority';
      default:
        return 'badge-medium-priority';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="card">
      {/* Card Header */}
      <div className="card-header">
        <Link href={`/stories/${story.id}`}>
          <h3 className="card-title cursor-pointer hover:text-brand-blue">
            {story.title}
          </h3>
        </Link>
        <div className="flex items-center space-x-2">
          <span className={`badge ${getStatusBadgeClass(story.status)}`}>
            {story.status.replace('-', ' ')}
          </span>
          <span className={`badge ${getPriorityBadgeClass(story.priority)}`}>
            {story.priority}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="card-content">
        <p className="text-gray-600 text-sm mb-3">
          {truncateText(story.description, 120)}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-brand-blue rounded-full mr-1"></span>
              {story.storyPoints} pts
            </span>
            {story.epic && (
              <span className="flex items-center">
                <span className="w-2 h-2 bg-warning-orange rounded-full mr-1"></span>
                {story.epic.name}
              </span>
            )}
          </div>
          <span className="text-xs">
            {story.acceptanceCriteria.length} criteria
          </span>
        </div>

        {story.assignedTo && (
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <span className="mr-2">Assigned to:</span>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium mr-2">
                {story.assignedTo.name.charAt(0).toUpperCase()}
              </div>
              {story.assignedTo.name}
            </div>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="card-footer">
        <div className="flex items-center text-sm text-gray-500">
          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium mr-2">
            {story.createdBy.name.charAt(0).toUpperCase()}
          </div>
          <span>Created by {story.createdBy.name}</span>
          <span className="mx-2">•</span>
          <span>{formatDate(story.createdAt)}</span>
        </div>

        <div className="flex items-center space-x-2">
          {onEdit && (
            <button
              onClick={() => onEdit(story)}
              className="text-gray-400 hover:text-gray-600 p-1"
              aria-label={`Edit ${story.title}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          
          {onDuplicate && (
            <button
              onClick={() => onDuplicate(story)}
              className="text-gray-400 hover:text-gray-600 p-1"
              aria-label={`Duplicate ${story.title}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={() => onDelete(story)}
              className="text-gray-400 hover:text-error-red p-1"
              aria-label={`Delete ${story.title}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};