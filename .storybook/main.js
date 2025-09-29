

import path from 'path';

/** @type { import('@storybook/nextjs-vite').StorybookConfig } */
const config = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest"
  ],
  "framework": {
    "name": "@storybook/nextjs-vite",
    "options": {}
  },
  "staticDirs": [
    "../public"
  ],
  "viteFinal": async (config) => {
    // Handle Node.js modules in browser environment
    config.define = {
      ...config.define,
      'process.env': JSON.stringify({
        WP_GRAPHQL_URL: '',
        NEXT_PUBLIC_WP_GRAPHQL_URL: '',
        NODE_ENV: 'development'
      })
    };

    // Fix HMR issues with Next.js integration
    config.server = {
      ...config.server,
      hmr: {
        overlay: false // Disable error overlay that can cause issues
      }
    };
    
    // Mock Node.js modules and use Storybook-specific mocks
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        'dotenv': false,
        // Use mock version of woocommerce for Storybook
        'lib/woocommerce': path.resolve(__dirname, '../src/lib/__mocks__/woocommerce.ts'),
        '../lib/woocommerce': path.resolve(__dirname, '../src/lib/__mocks__/woocommerce.ts'),
        '../../lib/woocommerce': path.resolve(__dirname, '../src/lib/__mocks__/woocommerce.ts'),
        '../../../lib/woocommerce': path.resolve(__dirname, '../src/lib/__mocks__/woocommerce.ts'),
        // Handle TypeScript path mapping for lib imports - use directory mapping for better resolution
        'lib': path.resolve(__dirname, '../src/lib'),
        // Specific file mappings for exact imports
        'lib/interfaces': path.resolve(__dirname, '../src/lib/interfaces/index.ts'),
        'lib/interfaces/index': path.resolve(__dirname, '../src/lib/interfaces/index.ts'),
        'lib/utils': path.resolve(__dirname, '../src/lib/utils'),
        'lib/utils/image': path.resolve(__dirname, '../src/lib/utils/image.ts'),
        'lib/utils/text': path.resolve(__dirname, '../src/lib/utils/text.ts'),
        // Handle TypeScript path mapping for contexts - use directory mapping for better resolution
        'contexts': path.resolve(__dirname, '../src/contexts'),
        'contexts/cartItemsContext': path.resolve(__dirname, '../src/contexts/cartItemsContext.ts'),
        'contexts/cartVisibilityContext': path.resolve(__dirname, '../src/contexts/cartVisibilityContext.ts'),
        'contexts/SessionContext': path.resolve(__dirname, '../src/contexts/SessionContext.tsx'),
        // Handle TypeScript path mapping for reducers
        'reducers': path.resolve(__dirname, '../src/reducers'),
        'reducers/cart/types': path.resolve(__dirname, '../src/reducers/cart/types.ts'),
        'reducers/cart/reducer': path.resolve(__dirname, '../src/reducers/cart/reducer.ts'),
        // Handle hooks
        'hooks': path.resolve(__dirname, '../src/hooks'),
        'hooks/useSession': path.resolve(__dirname, '../src/hooks/useSession.ts'),
        
        // Handle stores
        'stores': path.resolve(__dirname, '../src/stores'),
        'stores/cartStore': path.resolve(__dirname, '../src/stores/cartStore.ts'),
        // Handle components
        'components': path.resolve(__dirname, '../src/components'),
        // Mock Next.js router modules
        'next/router': path.resolve(__dirname, './mocks/nextRouter.tsx'),
        'next/navigation': path.resolve(__dirname, './mocks/nextNavigation.tsx')
      }
    };

    // Handle SVG files as assets to avoid MIME type errors
    config.assetsInclude = ['**/*.svg'];
    
    // Fix HMR message handling and components undefined issues
    config.optimizeDeps = {
      ...config.optimizeDeps,
      exclude: ['@storybook/nextjs-vite', '@storybook/react'],
      include: ['react', 'react-dom']
    };

    // Add webpack fallbacks for browser compatibility
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve?.fallback,
        "fs": false,
        "path": false,
        "crypto": false
      }
    };

    return config;
  }
};
export default config;
