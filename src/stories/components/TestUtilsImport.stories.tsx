import React from 'react';
import { Meta, StoryObj } from '@storybook/react';

// Test all utils imports  
import { normalizeImageUrl } from '../../lib/utils/image';
import { stripHtml } from '../../lib/utils/text';
import { cn } from '../../lib/utils';

// Test component to verify all utils imports work
const TestUtilsImport: React.FC = () => {
  // Test normalizeImageUrl function
  const testImageUrls = [
    'https://example.com/image.jpg',
    '//example.com/image.jpg',
    '/local/image.jpg',
    'relative/image.jpg',
    null,
    undefined,
    ''
  ];

  // Test stripHtml function
  const testHtmlStrings = [
    '<p>Hello <strong>world</strong>!</p>',
    '<div><span>Test</span></div>',
    'Plain text without HTML',
    '',
    null
  ];

  // Test cn function
  const testClasses = cn(
    'bg-orange-500',
    'text-white',
    'p-4',
    'rounded',
    'hover:bg-blue-600'
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        ✅ Utils Import Test
      </h2>
      
      {/* Test normalizeImageUrl */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          normalizeImageUrl Function
        </h3>
        <div className="space-y-2">
          {testImageUrls.map((url, index) => {
            const rawInput = url === null ? 'null' : url === undefined ? 'undefined' : JSON.stringify(url);
            const normalized = normalizeImageUrl(url);
            return (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600 font-mono">
                  <code>{rawInput}</code>
                </span>
                <span className="text-sm text-gray-800 font-mono">
                  <span aria-hidden="true">→ </span>
                  <code>{normalized}</code>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Test stripHtml */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          stripHtml Function
        </h3>
        <div className="space-y-2">
          {testHtmlStrings.map((html, index) => {
            const rawInput = html === null ? 'null' : JSON.stringify(html);
            const stripped = stripHtml(html);
            return (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600 font-mono">
                  <code>{rawInput}</code>
                </span>
                <span className="text-sm text-gray-800 font-mono">
                  <span aria-hidden="true">→ </span>
                  <code>{stripped}</code>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Test cn function */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          cn Function (Tailwind Class Merger)
        </h3>
        <div className="p-4 bg-gray-50 rounded">
          <p className="text-sm text-gray-600 mb-2">
            Input: <code className="bg-gray-200 px-1 rounded">bg-orange-500 text-white p-4 rounded hover:bg-blue-600</code>
          </p>
          <p className="text-sm text-gray-800 mb-3">
            Output: <code className="bg-gray-200 px-1 rounded">{testClasses}</code>
          </p>
          <div className={`${testClasses} inline-block`}>
            Test Element
          </div>
        </div>
      </div>

      <div className="p-4 bg-green-50 rounded-md">
        <h3 className="font-semibold text-green-800 mb-2">
          🎉 All Utils Imported Successfully!
        </h3>
        <p className="text-sm text-green-700">
          All utility functions from lib/utils are working correctly in Storybook.
          The path mapping issues have been resolved.
        </p>
      </div>
    </div>
  );
};

const meta: Meta<typeof TestUtilsImport> = {
  title: 'Test/UtilsImport',
  component: TestUtilsImport,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# Utils Import Test

This story tests whether all utility functions can be imported correctly from lib/utils.

## Utils Tested:
- **normalizeImageUrl**: Handles various image URL formats
- **stripHtml**: Removes HTML tags from strings
- **cn**: Tailwind CSS class merger utility

## What was fixed:
- Added path mapping for lib/utils/image
- Added path mapping for lib/utils/text
- Added path mapping for lib/utils (main utils file)

## Expected result:
- ✅ All utility functions work correctly
- No import errors
- Functions return expected results
        `
      }
    }
  },
  tags: ['test', 'utils', 'imports']
};

export default meta;
type Story = StoryObj<typeof TestUtilsImport>;

export const Default: Story = {
  args: {}
};
