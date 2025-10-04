import React, { useState, useEffect } from 'react';
import { Story } from './StoryCard';

interface StoryFiltersProps {
  stories: Story[];
  onFilterChange: (filteredStories: Story[]) => void;
}

interface FilterState {
  search: string;
  status: string[];
  priority: string[];
  epic: string;
  assignee: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export const StoryFilters: React.FC<StoryFiltersProps> = ({
  stories,
  onFilterChange
}) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: [],
    priority: [],
    epic: '',
    assignee: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const [showFilters, setShowFilters] = useState(false);

  // Get unique values for filter options
  const statusOptions = Array.from(new Set(stories.map(s => s.status)));
  const priorityOptions = Array.from(new Set(stories.map(s => s.priority)));
  const epicOptions = Array.from(new Set(stories.map(s => s.epic?.name).filter(Boolean)));
  const assigneeOptions = Array.from(new Set(stories.map(s => s.assignedTo?.name).filter(Boolean)));

  // Apply filters whenever filters change
  useEffect(() => {
    let filtered = [...stories];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(story =>
        story.title.toLowerCase().includes(searchLower) ||
        story.description.toLowerCase().includes(searchLower) ||
        story.id.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(story => filters.status.includes(story.status));
    }

    // Priority filter
    if (filters.priority.length > 0) {
      filtered = filtered.filter(story => filters.priority.includes(story.priority));
    }

    // Epic filter
    if (filters.epic) {
      filtered = filtered.filter(story => story.epic?.name === filters.epic);
    }

    // Assignee filter
    if (filters.assignee) {
      filtered = filtered.filter(story => story.assignedTo?.name === filters.assignee);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'storyPoints':
          aValue = a.storyPoints;
          bValue = b.storyPoints;
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    onFilterChange(filtered);
  }, [filters, stories, onFilterChange]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleStatusChange = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
  };

  const handlePriorityChange = (priority: string) => {
    setFilters(prev => ({
      ...prev,
      priority: prev.priority.includes(priority)
        ? prev.priority.filter(p => p !== priority)
        : [...prev.priority, priority]
    }));
  };

  const handleEpicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, epic: e.target.value }));
  };

  const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, assignee: e.target.value }));
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, sortBy: e.target.value }));
  };

  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, sortOrder: e.target.value as 'asc' | 'desc' }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: [],
      priority: [],
      epic: '',
      assignee: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  const hasActiveFilters = filters.search || 
    filters.status.length > 0 || 
    filters.priority.length > 0 || 
    filters.epic || 
    filters.assignee;

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Filter Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-sm font-medium text-gray-900">Filters</h3>
            {hasActiveFilters && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-blue-light text-brand-blue">
                {filters.status.length + filters.priority.length + (filters.epic ? 1 : 0) + (filters.assignee ? 1 : 0)} active
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear all
              </button>
            )}
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm text-brand-blue hover:text-brand-blue-hover font-medium"
            >
              {showFilters ? 'Hide' : 'Show'} filters
            </button>
          </div>
        </div>
      </div>

      {/* Filter Content */}
      {showFilters && (
        <div className="p-4 space-y-4">
          {/* Search */}
          <div>
            <label className="form-label">Search</label>
            <input
              type="text"
              placeholder="Search stories..."
              value={filters.search}
              onChange={handleSearchChange}
              className="form-input"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="form-label">Status</label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`badge ${
                    filters.status.includes(status) 
                      ? 'badge-validated' 
                      : 'badge-draft'
                  }`}
                >
                  {status.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="form-label">Priority</label>
            <div className="flex flex-wrap gap-2">
              {priorityOptions.map(priority => (
                <button
                  key={priority}
                  onClick={() => handlePriorityChange(priority)}
                  className={`badge ${
                    filters.priority.includes(priority) 
                      ? `badge-${priority}-priority` 
                      : 'badge-draft'
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>

          {/* Epic and Assignee Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Epic</label>
              <select
                value={filters.epic}
                onChange={handleEpicChange}
                className="form-select"
              >
                <option value="">All epics</option>
                {epicOptions.map(epic => (
                  <option key={epic} value={epic}>{epic}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Assignee</label>
              <select
                value={filters.assignee}
                onChange={handleAssigneeChange}
                className="form-select"
              >
                <option value="">All assignees</option>
                {assigneeOptions.map(assignee => (
                  <option key={assignee} value={assignee}>{assignee}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Sort by</label>
              <select
                value={filters.sortBy}
                onChange={handleSortChange}
                className="form-select"
              >
                <option value="createdAt">Created date</option>
                <option value="title">Title</option>
                <option value="status">Status</option>
                <option value="priority">Priority</option>
                <option value="storyPoints">Story points</option>
              </select>
            </div>

            <div>
              <label className="form-label">Order</label>
              <select
                value={filters.sortOrder}
                onChange={handleSortOrderChange}
                className="form-select"
              >
                <option value="desc">Newest first</option>
                <option value="asc">Oldest first</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};