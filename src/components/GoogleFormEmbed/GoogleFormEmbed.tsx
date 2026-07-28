import React from 'react'
import { useFormUrl } from '@/lib/api'
import { FormLoading } from './FormLoading'
import { FormError } from './FormError'
import { FormFallback } from './FormFallback'
import { DEFAULT_API_PATH, DEFAULT_HEIGHT, MOBILE_HEIGHT, DESKTOP_HEIGHT } from './constants'

interface Props {
  apiPath?: string
  embedUrl?: string
  className?: string
  height?: string
  width?: string
  showFallbackLink?: boolean
  responsive?: boolean
  fillContainer?: boolean
}

/**
 * Reusable Google Form inline embed component
 * Follows KISS & DRY principles - uses shared utilities
 *
 * @example
 * <GoogleFormEmbed apiPath="/wp-json/hsm/v1/contact-form-url" height="70vh" />
 */
export default function GoogleFormEmbed({
  apiPath = DEFAULT_API_PATH,
  embedUrl,
  className = '',
  height = DEFAULT_HEIGHT,
  width = '100%',
  showFallbackLink = true,
  responsive = true,
  fillContainer = false
}: Props) {
  const { url, loading, error } = useFormUrl({
    apiPath,
    embedUrl,
    enabled: !embedUrl
  })

  // Simple height calculation - KISS principle
  const containerHeight = fillContainer ? '100%' : height
  const hasResponsiveClasses = typeof height === 'string' && (height.includes('md:') || height.includes('sm:') || height.includes('lg:'))
  const responsiveHeightClass = responsive && !hasResponsiveClasses ? `h-[${MOBILE_HEIGHT}] md:h-[${DESKTOP_HEIGHT}]` : ''

  if (loading) {
    return <FormLoading className={className} height={containerHeight} />
  }

  if (error) {
    return (
      <FormError
        error={error}
        url={url}
        showFallbackLink={showFallbackLink}
        className={className}
        height={containerHeight}
      />
    )
  }

  if (!url) {
    return <FormFallback className={className} height={containerHeight} />
  }

  return (
    <div className={className}>
      {showFallbackLink && (
        <p className="mb-4 text-sm text-gray-600">
          If the form doesn't load,{' '}
          <a href={url} target="_blank" rel="noreferrer" className="text-brand-primary hover:text-brand-dark underline">
            open it in a new tab
          </a>
          .
        </p>
      )}
      <div
        style={{
          width: responsive ? '100%' : width,
          height: containerHeight,
          maxWidth: responsive ? '100%' : 'none',
          minHeight: fillContainer ? '400px' : (responsive ? '300px' : undefined)
        }}
        className={`rounded-lg overflow-hidden ${responsive ? 'w-full' : ''} ${fillContainer ? 'h-full' : ''} ${responsiveHeightClass}`}
      >
        <iframe
          src={url}
          title="Google Form"
          width="100%"
          height="100%"
          frameBorder={0}
          loading="lazy"
          className="border-0 w-full h-full"
          style={{
            minHeight: '400px',
            display: 'block',
            maxWidth: '100%',
            WebkitOverflowScrolling: 'touch'
          }}
        />
      </div>
    </div>
  )
}
