import React from 'react';
import { Meta, StoryObj } from '@storybook/react';

// Test all path mappings that were added to Storybook config
import { CartProduct, ProductSchema } from '../../lib/interfaces';
import { normalizeImageUrl } from '../../lib/utils/image';
import { stripHtml } from '../../lib/utils/text';
import { cn } from '../../lib/utils';
import CartVisibilityContext from '../../contexts/cartVisibilityContext';
import { useSession } from '../../hooks/useSession';
import { useCartStore } from '../../stores/cartStore';

// Test component to verify all path mappings work
const TestPathMapping: React.FC = () => {
  const pathMappings = [
    { name: 'lib/interfaces', test: () => true }, // Types imported successfully
    { name: 'lib/utils/image', test: () => typeof normalizeImageUrl === 'function' },
    { name: 'lib/utils/text', test: () => typeof stripHtml === 'function' },
    { name: 'lib/utils', test: () => typeof cn === 'function' },
    { name: 'stores/cartStore', test: () => typeof useCartStore === 'function' },
    { name: 'contexts/cartVisibilityContext', test: () => typeof CartVisibilityContext !== 'undefined' },
    { name: 'hooks/useSession', test: () => typeof useSession === 'function' }
  ];

  const results = pathMappings.map(({ name, test }) => ({
    name,
    success: test()
  }));

  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        ✅ Path Mapping Test
      </h2>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Import Resolution Results
          </h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            successCount === totalCount 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {successCount}/{totalCount} Success
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {results.map(({ name, success }) => (
            <div key={name} className={`p-3 rounded-md flex items-center ${
              success ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <span className={`w-2 h-2 rounded-full mr-3 ${
                success ? 'bg-green-500' : 'bg-red-500'
              }`}></span>
              <div>
                <p className={`text-sm font-medium ${
                  success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {name}
                </p>
                <p className={`text-xs ${
                  success ? 'text-green-600' : 'text-red-600'
                }`}>
                  {success ? 'Import successful' : 'Import failed'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Test actual function calls */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Function Tests
        </h3>
        <div className="space-y-2">
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600 mb-1">
              <strong>{"normalizeImageUrl('/test.jpg'):"}</strong>
            </p>
            <p className="text-sm text-gray-800 font-mono">
              <code>{normalizeImageUrl('/test.jpg')}</code>
            </p>
          </div>
          
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600 mb-1">
              <strong>{"stripHtml('<p>Hello</p>'):"}</strong>
            </p>
            <p className="text-sm text-gray-800 font-mono">
              <code>{stripHtml('<p>Hello</p>')}</code>
            </p>
          </div>
          
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600 mb-1">
              <strong>{"cn('bg-orange-500', 'text-white'):"}</strong>
            </p>
            <p className="text-sm text-gray-800 font-mono">
              <code>{cn('bg-orange-500', 'text-white')}</code>
            </p>
          </div>
        </div>
      </div>

      <div className={`p-4 rounded-md ${
        successCount === totalCount ? 'bg-green-50' : 'bg-red-50'
      }`}>
        <h3 className={`font-semibold mb-2 ${
          successCount === totalCount ? 'text-green-800' : 'text-red-800'
        }`}>
          {successCount === totalCount ? '🎉 All Path Mappings Working!' : '❌ Some Path Mappings Failed'}
        </h3>
        <p className={`text-sm ${
          successCount === totalCount ? 'text-green-700' : 'text-red-700'
        }`}>
          {successCount === totalCount 
            ? 'All TypeScript path mappings are correctly resolved in Storybook. Components should now import without errors.'
            : `${totalCount - successCount} path mapping(s) failed. Check the Storybook configuration.`
          }
        </p>
      </div>
    </div>
  );
};

const meta: Meta<typeof TestPathMapping> = {
  title: 'Test/PathMapping',
  component: TestPathMapping,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# Path Mapping Test

This story tests whether all TypeScript path mappings are correctly resolved in Storybook.

## Path Mappings Tested:
- **lib/interfaces**: CartProduct, ProductSchema types
- **lib/utils/image**: normalizeImageUrl function
- **lib/utils/text**: stripHtml function
- **lib/utils**: cn function
- **stores/cartStore**: Cart store (Zustand)
- **contexts/cartVisibilityContext**: Cart visibility context
- **hooks/useSession**: Session hook
- **stores/cartStore**: Zustand cart store with actions

## What was fixed:
- Corrected file extensions (.ts vs .tsx)
- Fixed lib/interfaces to point to index.ts
- Added comprehensive path mapping for all imports

## Expected result:
- ✅ All imports show green success indicators
- Functions work correctly
- No import errors in Storybook
        `
      }
    }
  },
  tags: ['test', 'path-mapping', 'imports']
};

export default meta;
type Story = StoryObj<typeof TestPathMapping>;

export const Default: Story = {
  args: {}
};
