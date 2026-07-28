import React from 'react'
import { CONTACT_INFO } from './constants'

interface FormFallbackProps {
  message?: string
  className?: string
  height?: string
}

/**
 * Shared fallback UI component for Google Forms
 * Follows DRY principle - single component for error/fallback display
 */
export function FormFallback({ message, className = '', height }: FormFallbackProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 ${className}`} style={height ? { height } : undefined}>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
        <p className="text-yellow-800 font-semibold mb-2">
          {message || 'Form Not Available'}
        </p>
        <p className="text-yellow-700 text-sm mb-4">
          The form is not currently configured. Please use one of the methods below to reach us.
        </p>
        <div className="space-y-2 text-sm text-yellow-700">
          <p>
            <strong>Phone:</strong>{' '}
            <a href={CONTACT_INFO.phoneHref} className="text-brand-primary hover:underline">
              {CONTACT_INFO.phone}
            </a>
          </p>
          <p>
            <strong>Email:</strong>{' '}
            <a href={CONTACT_INFO.emailHref} className="text-brand-primary hover:underline">
              {CONTACT_INFO.email}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
