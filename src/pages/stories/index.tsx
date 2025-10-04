import React, { useState } from 'react';
import { StoryDashboard } from '../../components/story-management/StoryDashboard';
import { StoryList } from '../../components/story-management/StoryList';
import { Story, StoryCard } from '../../components/story-management/StoryCard';
import { StoryCreationForm } from '../../components/story-management/StoryCreationForm';

// Mock data for demonstration
const mockStories: Story[] = [
  {
    id: 'US-001',
    title: 'User Authentication System',
    description: 'As a user, I want to be able to log in to the system so that I can access my personal dashboard and manage my account settings.',
    status: 'ready-for-development',
    priority: 'high',
    storyPoints: 8,
    epic: {
      id: 'EPIC-001',
      name: 'User Management'
    },
    createdBy: {
      id: 'user-1',
      name: 'Sarah Johnson'
    },
    assignedTo: {
      id: 'user-2',
      name: 'Alex Chen'
    },
    createdAt: '2025-01-25T10:00:00Z',
    acceptanceCriteria: [
      'User can log in with email and password',
      'User can reset password via email',
      'User session persists across browser refreshes',
      'User can log out securely'
    ]
  },
  {
    id: 'US-002',
    title: 'Product Catalog Display',
    description: 'As a customer, I want to browse products in a catalog so that I can find items I want to purchase.',
    status: 'validated',
    priority: 'medium',
    storyPoints: 5,
    epic: {
      id: 'EPIC-002',
      name: 'Product Management'
    },
    createdBy: {
      id: 'user-1',
      name: 'Sarah Johnson'
    },
    assignedTo: {
      id: 'user-3',
      name: 'Mike Wilson'
    },
    createdAt: '2025-01-24T14:30:00Z',
    acceptanceCriteria: [
      'Products are displayed in a grid layout',
      'Each product shows image, name, price, and description',
      'Products can be filtered by category',
      'Products can be sorted by price, name, or popularity'
    ]
  },
  {
    id: 'US-003',
    title: 'Shopping Cart Functionality',
    description: 'As a customer, I want to add items to my cart so that I can purchase multiple products in a single transaction.',
    status: 'technical-review',
    priority: 'high',
    storyPoints: 13,
    epic: {
      id: 'EPIC-003',
      name: 'E-commerce'
    },
    createdBy: {
      id: 'user-1',
      name: 'Sarah Johnson'
    },
    createdAt: '2025-01-23T09:15:00Z',
    acceptanceCriteria: [
      'User can add products to cart',
      'User can remove products from cart',
      'User can update product quantities',
      'Cart persists across browser sessions',
      'Cart shows total price calculation'
    ]
  },
  {
    id: 'US-004',
    title: 'User Profile Management',
    description: 'As a user, I want to manage my profile information so that I can keep my account details up to date.',
    status: 'draft',
    priority: 'low',
    storyPoints: 3,
    epic: {
      id: 'EPIC-001',
      name: 'User Management'
    },
    createdBy: {
      id: 'user-1',
      name: 'Sarah Johnson'
    },
    createdAt: '2025-01-22T16:45:00Z',
    acceptanceCriteria: [
      'User can view their profile information',
      'User can edit their profile information',
      'User can upload a profile picture',
      'Changes are saved automatically'
    ]
  },
  {
    id: 'US-005',
    title: 'Order History Tracking',
    description: 'As a customer, I want to view my order history so that I can track my past purchases and reorder items.',
    status: 'draft',
    priority: 'medium',
    storyPoints: 5,
    epic: {
      id: 'EPIC-003',
      name: 'E-commerce'
    },
    createdBy: {
      id: 'user-1',
      name: 'Sarah Johnson'
    },
    createdAt: '2025-01-21T11:20:00Z',
    acceptanceCriteria: [
      'User can view list of past orders',
      'Each order shows date, items, and total',
      'User can view order details',
      'User can reorder items from past orders'
    ]
  }
];

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>(mockStories);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateStory = (storyData: Omit<Story, 'id' | 'createdAt'>) => {
    const newStory: Story = {
      ...storyData,
      id: `US-${String(stories.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString()
    };
    
    setStories(prev => [newStory, ...prev]);
    setShowCreateForm(false);
  };

  const handleEditStory = (story: Story) => {
    console.log('Edit story:', story);
    // In a real app, this would open an edit modal or navigate to edit page
  };

  const handleDeleteStory = (story: Story) => {
    if (confirm(`Are you sure you want to delete "${story.title}"?`)) {
      setStories(prev => prev.filter(s => s.id !== story.id));
    }
  };

  const handleDuplicateStory = (story: Story) => {
    const duplicatedStory: Story = {
      ...story,
      id: `US-${String(stories.length + 1).padStart(3, '0')}`,
      title: `${story.title} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString()
    };
    
    setStories(prev => [duplicatedStory, ...prev]);
  };

  if (showCreateForm) {
    return (
      <StoryDashboard currentPage="stories">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setShowCreateForm(false)}
            className="mb-6 text-brand-blue hover:text-brand-blue-hover font-medium"
          >
            ← Back to Stories
          </button>
          
          <StoryCreationForm
            onSubmit={handleCreateStory}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      </StoryDashboard>
    );
  }

  return (
    <StoryDashboard currentPage="stories">
      <StoryList
        stories={stories}
        onEdit={handleEditStory}
        onDelete={handleDeleteStory}
        onDuplicate={handleDuplicateStory}
        onCreateStory={() => setShowCreateForm(true)}
      />
    </StoryDashboard>
  );
}