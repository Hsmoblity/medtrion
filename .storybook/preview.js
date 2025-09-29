import React from 'react';
import { RouterContext, createMockRouter, defaultRouter } from './mocks/nextRouter';
import '../globals.css'; // Import global styles

// Handle HMR issues and Next.js warnings
if (typeof window !== 'undefined' && window.parent !== window) {
  // Override WebSocket to filter problematic HMR messages
  const originalWebSocket = window.WebSocket;
  window.WebSocket = class extends originalWebSocket {
    constructor(...args) {
      super(...args);
      
      const originalOnMessage = this.onmessage;
      this.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Filter out problematic Next.js HMR messages
          if (data.action === 'isrManifest' || data.type === 'next-hmr-latency') {
            return; // Ignore these messages
          }
          
          // Call original handler for valid messages
          if (originalOnMessage) {
            originalOnMessage.call(this, event);
          }
        } catch (e) {
          // If parsing fails, try original handler
          if (originalOnMessage) {
            originalOnMessage.call(this, event);
          }
        }
      };
    }
  };

  // Handle Next.js scroll behavior warning
  if (document && document.documentElement) {
    // Add the data attribute to prevent the warning
    document.documentElement.setAttribute('data-scroll-behavior', 'smooth');
    
    // Also suppress the console warning if it still appears
    const originalConsoleWarn = console.warn;
    console.warn = function(...args) {
      const message = args.join(' ');
      if (message.includes('scroll-behavior: smooth') || message.includes('missing-data-scroll-behavior')) {
        return; // Suppress this specific warning
      }
      originalConsoleWarn.apply(console, args);
    };
  }
}

/** @type { import('@storybook/nextjs-vite').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    nextRouter: defaultRouter,
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/',
        query: {},
      },
    },
    // Suppress Next.js warnings in Storybook
    docs: {
      inlineStories: false,
    },
  },
};

export const decorators = [
  (Story, context) => {
    const router = createMockRouter(context.parameters?.nextRouter || {});

    // Handle components undefined errors
    const ErrorBoundary = ({ children }) => {
      const [hasError, setHasError] = React.useState(false);

      React.useEffect(() => {
        const handleError = (event) => {
          if (event.message && event.message.includes("Cannot read properties of undefined (reading 'components')")) {
            setHasError(true);
            event.preventDefault();
          }
        };

        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
      }, []);

      if (hasError) {
        return <div>Loading component...</div>;
      }

      return children;
    };

    return (
      <ErrorBoundary>
        <RouterContext.Provider value={router}>
          <Story />
        </RouterContext.Provider>
      </ErrorBoundary>
    );
  }
];

export default preview;
