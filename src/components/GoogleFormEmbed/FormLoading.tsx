import React from 'react'

interface FormLoadingProps {
  className?: string
  height?: string
}

/**
 * Shared loading component for Google Forms
 * Follows DRY principle - single component for loading state
 */
export function FormLoading({ className = '', height }: FormLoadingProps) {
  return (
    <div className={`flex items-center justify-center ${className}`} style={height ? { height } : undefined}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading form…</p>
      </div>
    </div>
  )
}
