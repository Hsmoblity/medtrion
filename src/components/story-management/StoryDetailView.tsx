import React, { useState } from 'react';
import { Story } from './StoryCard';

interface StoryDetailViewProps {
  story: Story;
  onEdit?: (story: Story) => void;
  onDelete?: (story: Story) => void;
  onDuplicate?: (story: Story) => void;
  onStatusChange?: (story: Story, newStatus: Story['status']) => void;
}

interface Comment {
  id: string;
  text: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

export const StoryDetailView: React.FC<StoryDetailViewProps> = ({
  story,
  onEdit,
  onDelete,
  onDuplicate,
  onStatusChange
}) => {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 'comment-1',
      text: 'This story looks good to me. Ready for technical review.',
      author: { id: 'user-1', name: 'Sarah Johnson' },
      createdAt: '2025-01-27T10:30:00Z'
    }
  ]);
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;

    setIsAddingComment(true);

    try {
      const comment: Comment = {
        id: `comment-${Date.now()}`,
        text: newComment.trim(),
        author: { id: 'user-1', name: 'Sarah Johnson' },
        createdAt: new Date().toISOString()
      };

      setComments(prev => [comment, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleStatusChange = (newStatus: Story['status']) => {
    if (onStatusChange) {
      onStatusChange(story, newStatus);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {story.title}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Story ID: {story.id}</span>
              <span>•</span>
              <span>Created {formatDate(story.createdAt)}</span>
              {story.assignedTo && (
                <>
                  <span>•</span>
                  <span>Assigned to {story.assignedTo.name}</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className={`badge ${getStatusBadgeClass(story.status)}`}>
                {story.status.replace('-', ' ')}
              </span>
              <span className={`badge ${getPriorityBadgeClass(story.priority)}`}>
                {story.priority}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(story)}
                  className="btn btn-secondary btn-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
              )}
              
              {onDuplicate && (
                <button
                  onClick={() => onDuplicate(story)}
                  className="btn btn-secondary btn-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Duplicate
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">
                {story.description}
              </p>
            </div>
          </div>

          {/* Acceptance Criteria */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Acceptance Criteria</h2>
            <div className="space-y-3">
              {story.acceptanceCriteria.map((criteria, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-brand-blue-light text-brand-blue rounded-full flex items-center justify-center text-sm font-medium mt-1">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-gray-700">{criteria}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comments & Activity */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Comments & Activity</h2>
            
            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="mb-6">
              <div className="flex space-x-3">
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="form-textarea"
                    rows={3}
                  />
                </div>
                <div className="flex-shrink-0">
                  <button
                    type="submit"
                    disabled={!newComment.trim() || isAddingComment}
                    className="btn btn-primary"
                  >
                    {isAddingComment ? (
                      <div className="spinner"></div>
                    ) : (
                      'Comment'
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-brand-blue rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {comment.author.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {comment.author.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Story Metadata */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Story Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  <select
                    value={story.status}
                    onChange={(e) => handleStatusChange(e.target.value as Story['status'])}
                    className="form-select"
                  >
                    <option value="draft">Draft</option>
                    <option value="validated">Validated</option>
                    <option value="technical-review">Technical Review</option>
                    <option value="ready-for-development">Ready for Development</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Priority</label>
                <div className="mt-1">
                  <span className={`badge ${getPriorityBadgeClass(story.priority)}`}>
                    {story.priority}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Story Points</label>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-brand-blue-light text-brand-blue">
                    {story.storyPoints} pts
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Created By</label>
                <div className="mt-1 flex items-center">
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium mr-2">
                    {story.createdBy.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-900">{story.createdBy.name}</span>
                </div>
              </div>

              {story.assignedTo && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Assigned To</label>
                  <div className="mt-1 flex items-center">
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium mr-2">
                      {story.assignedTo.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-900">{story.assignedTo.name}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <div className="mt-1 text-sm text-gray-900">
                  {formatDate(story.createdAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Epic Information */}
          {story.epic && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Epic</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Epic Name</label>
                  <div className="mt-1">
                    <a
                      href={`/stories/epics/${story.epic.id}`}
                      className="text-sm text-brand-blue hover:text-brand-blue-hover font-medium"
                    >
                      {story.epic.name}
                    </a>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Epic Status</label>
                  <div className="mt-1">
                    <span className="badge badge-validated">Active</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Related Stories */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Stories</h3>
            <div className="space-y-2">
              <a
                href="/stories/US-002"
                className="block p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded"
              >
                US-002: Product Catalog Display
              </a>
              <a
                href="/stories/US-003"
                className="block p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded"
              >
                US-003: Shopping Cart Functionality
              </a>
              <a
                href="/stories/US-004"
                className="block p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded"
              >
                US-004: User Authentication
              </a>
            </div>
          </div>

          {/* Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(story)}
                  className="btn btn-secondary w-full justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Story
                </button>
              )}
              
              {onDuplicate && (
                <button
                  onClick={() => onDuplicate(story)}
                  className="btn btn-secondary w-full justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Duplicate Story
                </button>
              )}
              
              {onDelete && (
                <button
                  onClick={() => onDelete(story)}
                  className="btn btn-danger w-full justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Story
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};