import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { useSession } from '../../hooks/useSession';

// Test component to verify useSession import works
const TestSessionImport: React.FC = () => {
  try {
    const session = useSession();
    
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          ✅ useSession Import Test
        </h2>
        
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            <strong>Session ID:</strong> {session.session.cartSessionId || 'Not set'}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Theme:</strong> {session.session.theme}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Recently Viewed:</strong> {session.session.recentlyViewedProducts.length} items
          </p>
          <p className="text-sm text-gray-600">
            <strong>Wishlist:</strong> {session.session.wishlist.length} items
          </p>
          <p className="text-sm text-gray-600">
            <strong>Notifications:</strong> {session.session.notifications.length} items
          </p>
        </div>
        
        <div className="mt-4 p-3 bg-green-50 rounded-md">
          <p className="text-sm text-green-800">
            ✅ useSession hook imported and working correctly!
          </p>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          ❌ useSession Import Test Failed
        </h2>
        
        <div className="p-3 bg-red-50 rounded-md">
          <p className="text-sm text-red-800">
            Error: {(error as Error).message}
          </p>
        </div>
      </div>
    );
  }
};

const meta: Meta<typeof TestSessionImport> = {
  title: 'Test/SessionImport',
  component: TestSessionImport,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# useSession Import Test

This story tests whether the useSession hook can be imported and used correctly.

## What it tests:
- Import of useSession from hooks/useSession
- Access to session data
- Error handling if import fails

## Expected result:
- ✅ Green success message
- Session data displayed
- No import errors
        `
      }
    }
  },
  tags: ['test', 'session', 'import']
};

export default meta;
type Story = StoryObj<typeof TestSessionImport>;

export const Default: Story = {
  args: {}
};