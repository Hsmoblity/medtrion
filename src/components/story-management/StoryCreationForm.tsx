import React, { useState } from 'react';
import { Story } from './StoryCard';

interface StoryCreationFormProps {
  onSubmit: (story: Omit<Story, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  initialData?: Partial<Story>;
  isEditing?: boolean;
}

interface AcceptanceCriteria {
  id: string;
  text: string;
}

export const StoryCreationForm: React.FC<StoryCreationFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    priority: initialData?.priority || 'medium',
    storyPoints: initialData?.storyPoints || 1,
    epic: initialData?.epic?.name || '',
    assignee: initialData?.assignedTo?.name || '',
    tags: '',
    notes: ''
  });

  const [acceptanceCriteria, setAcceptanceCriteria] = useState<AcceptanceCriteria[]>(
    initialData?.acceptanceCriteria?.map((text, index) => ({
      id: `criteria-${index}`,
      text
    })) || [{ id: 'criteria-1', text: '' }]
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCriteriaChange = (id: string, text: string) => {
    setAcceptanceCriteria(prev =>
      prev.map(criteria =>
        criteria.id === id ? { ...criteria, text } : criteria
      )
    );
  };

  const addCriteria = () => {
    const newId = `criteria-${Date.now()}`;
    setAcceptanceCriteria(prev => [...prev, { id: newId, text: '' }]);
  };

  const removeCriteria = (id: string) => {
    if (acceptanceCriteria.length > 1) {
      setAcceptanceCriteria(prev => prev.filter(criteria => criteria.id !== id));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.storyPoints < 1 || formData.storyPoints > 13) {
      newErrors.storyPoints = 'Story points must be between 1 and 13';
    }

    const validCriteria = acceptanceCriteria.filter(criteria => criteria.text.trim());
    if (validCriteria.length === 0) {
      newErrors.acceptanceCriteria = 'At least one acceptance criteria is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const validCriteria = acceptanceCriteria
        .filter(criteria => criteria.text.trim())
        .map(criteria => criteria.text.trim());

      const storyData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority as 'high' | 'medium' | 'low',
        storyPoints: formData.storyPoints,
        status: 'draft' as const,
        acceptanceCriteria: validCriteria,
        epic: formData.epic ? { id: 'epic-1', name: formData.epic } : undefined,
        createdBy: {
          id: 'user-1',
          name: 'Sarah Johnson'
        },
        assignedTo: formData.assignee ? {
          id: 'user-2',
          name: formData.assignee
        } : undefined
      };

      await onSubmit(storyData);
    } catch (error) {
      console.error('Error submitting story:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Story' : 'Create New Story'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {isEditing ? 'Update the story details below' : 'Fill in the details to create a new user story'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  Story Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`form-input ${errors.title ? 'error' : ''}`}
                  placeholder="Enter a clear, concise title for the story"
                  required
                />
                {errors.title && (
                  <div className="form-error">{errors.title}</div>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`form-textarea ${errors.description ? 'error' : ''}`}
                  placeholder="Describe what the user wants to accomplish and why"
                  rows={4}
                  required
                />
                {errors.description && (
                  <div className="form-error">{errors.description}</div>
                )}
              </div>
            </div>

            <div>
              <div className="form-group">
                <label htmlFor="epic" className="form-label">Epic</label>
                <input
                  type="text"
                  id="epic"
                  name="epic"
                  value={formData.epic}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter epic name"
                />
              </div>
            </div>

            <div>
              <div className="form-group">
                <label htmlFor="assignee" className="form-label">Assignee</label>
                <select
                  id="assignee"
                  name="assignee"
                  value={formData.assignee}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="">Select assignee</option>
                  <option value="Alex Johnson">Alex Johnson</option>
                  <option value="Mike Chen">Mike Chen</option>
                  <option value="Sarah Wilson">Sarah Wilson</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Acceptance Criteria */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acceptance Criteria</h2>
          
          <div className="space-y-3">
            {acceptanceCriteria.map((criteria, index) => (
              <div key={criteria.id} className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-brand-blue-light text-brand-blue rounded-full flex items-center justify-center text-sm font-medium mt-1">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <textarea
                    value={criteria.text}
                    onChange={(e) => handleCriteriaChange(criteria.id, e.target.value)}
                    className="form-textarea"
                    placeholder="Describe what needs to be true for this story to be considered complete"
                    rows={2}
                  />
                </div>
                {acceptanceCriteria.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCriteria(criteria.id)}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-error-red"
                    aria-label="Remove criteria"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={addCriteria}
              className="btn btn-secondary btn-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Criteria
            </button>
          </div>
          
          {errors.acceptanceCriteria && (
            <div className="form-error mt-2">{errors.acceptanceCriteria}</div>
          )}
        </div>

        {/* Story Details */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Story Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="form-group">
                <label htmlFor="priority" className="form-label">Priority</label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <div className="form-group">
                <label htmlFor="storyPoints" className="form-label">
                  Story Points *
                </label>
                <select
                  id="storyPoints"
                  name="storyPoints"
                  value={formData.storyPoints}
                  onChange={handleInputChange}
                  className={`form-select ${errors.storyPoints ? 'error' : ''}`}
                  required
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                  <option value={8}>8</option>
                  <option value={13}>13</option>
                </select>
                {errors.storyPoints && (
                  <div className="form-error">{errors.storyPoints}</div>
                )}
              </div>
            </div>

            <div>
              <div className="form-group">
                <label htmlFor="tags" className="form-label">Tags</label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter tags separated by commas"
                />
                <div className="form-help">
                  Separate multiple tags with commas
                </div>
              </div>
            </div>

            <div>
              <div className="form-group">
                <label htmlFor="notes" className="form-label">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="Additional notes or context"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="spinner mr-2"></div>
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {isEditing ? 'Update Story' : 'Create Story'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};