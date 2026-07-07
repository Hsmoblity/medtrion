import React from 'react';

interface DebugWrapperProps {
  children: React.ReactNode;
  enabled?: boolean;
}

/**
 * Development-only wrapper component that only renders children in development mode
 * or when explicitly enabled. Prevents debug components from appearing in production.
 */
const DebugWrapper: React.FC<DebugWrapperProps> = ({ children, enabled = false }) => {
  // Only render in development or when explicitly enabled
  const shouldRender = process.env.NODE_ENV === 'development' || enabled;
  
  if (!shouldRender) {
    return null;
  }

  return (
    <div className="debug-wrapper border-2 border-red-500 bg-red-50 p-4 m-4 rounded-md">
      <div className="text-xs text-red-600 font-mono mb-2">
        🚨 DEBUG COMPONENT - DEVELOPMENT ONLY
      </div>
      {children}
    </div>
  );
};

export default DebugWrapper;