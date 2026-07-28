import React from 'react'
import { CONTACT_INFO } from './constants'

interface FormErrorProps {
  error: string
  url?: string | null
  showFallbackLink?: boolean
  className?: string
  height?: string
}

/**
 * Shared error component for Google Forms
 * Follows DRY principle - single component for error display
 */
export function FormError({
  error,
  url,
  showFallbackLink = true,
  className = '',
  height
}: FormErrorProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`} style={height ? { height } : undefined}>
      <p className="text-red-600 mb-4">{error}</p>
      {showFallbackLink && url && (
        <a href={url} target="_blank" rel="noreferrer" className="text-brand-primary underline">
          Open form in new tab
        </a>
      )}
    </div>
  )
}
