import React from 'react';
import { useRouter } from 'next/router';
import { StoryDashboard } from '../../components/story-management/StoryDashboard';
import { StoryDetailView } from '../../components/story-management/StoryDetailView';
import { Story } from '../../components/story-management/StoryCard';

// Mock data - in a real app, this would come from an API
const mockStories: Story[] = [
  {
    id: 'US-001',
    title: 'User Authentication System',
    description: 'As a user, I want to be able to log in to the system so that I can access my personal dashboard and manage my account settings.\n\nThis story covers the complete authentication flow including login, logout, password reset, and session management. The system should be secure and user-friendly.',
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
      'User can log out securely',
      'System validates password strength',
      'Failed login attempts are logged and rate limited'
    ]
  },
  {
    id: 'US-002',
    title: 'Product Catalog Display',
    description: 'As a customer, I want to browse products in a catalog so that I can find items I want to purchase.\n\nThe product catalog should be visually appealing, fast-loading, and easy to navigate. It should support various filtering and sorting options to help users find exactly what they\'re looking for.',
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
      'Products are displayed in a responsive grid layout',
      'Each product shows high-quality image, name, price, and description',
      'Products can be filtered by category, price range, and brand',
      'Products can be sorted by price, name, popularity, or rating',
      'Product images load quickly with lazy loading',
      'Catalog supports infinite scroll or pagination'
    ]
  },
  {
    id: 'US-003',
    title: 'Shopping Cart Functionality',
    description: 'As a customer, I want to add items to my cart so that I can purchase multiple products in a single transaction.\n\nThis story covers the complete shopping cart experience including adding/removing items, quantity management, price calculations, and cart persistence.',
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
      'User can add products to cart from product pages',
      'User can remove products from cart',
      'User can update product quantities in cart',
      'Cart persists across browser sessions',
      'Cart shows accurate total price calculation',
      'Cart displays item count in header',
      'Cart handles out-of-stock items gracefully'
    ]
  }
];

export default function StoryDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const story = mockStories.find(s => s.id === id);

  if (!story) {
    return (
      <StoryDashboard currentPage="stories">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Story Not Found</h1>
          <p className="text-gray-500 mb-6">
            The story you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.push('/stories')}
            className="btn btn-primary"
          >
            Back to Stories
          </button>
        </div>
      </StoryDashboard>
    );
  }

  const handleEditStory = (story: Story) => {
    console.log('Edit story:', story);
    // In a real app, this would navigate to edit page or open edit modal
  };

  const handleDeleteStory = (story: Story) => {
    if (confirm(`Are you sure you want to delete "${story.title}"?`)) {
      // In a real app, this would call API to delete story
      console.log('Delete story:', story);
      router.push('/stories');
    }
  };

  const handleDuplicateStory = (story: Story) => {
    console.log('Duplicate story:', story);
    // In a real app, this would create a copy of the story
  };

  const handleStatusChange = (story: Story, newStatus: Story['status']) => {
    console.log('Status change:', story.id, newStatus);
    // In a real app, this would update the story status via API
  };

  return (
    <StoryDashboard currentPage="stories">
      <div className="mb-6">
        <button
          onClick={() => router.push('/stories')}
          className="text-brand-blue hover:text-brand-blue-hover font-medium mb-4"
        >
          ← Back to Stories
        </button>
      </div>
      
      <StoryDetailView
        story={story}
        onEdit={handleEditStory}
        onDelete={handleDeleteStory}
        onDuplicate={handleDuplicateStory}
        onStatusChange={handleStatusChange}
      />
    </StoryDashboard>
  );
}