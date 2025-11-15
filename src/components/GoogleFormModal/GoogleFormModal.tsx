import React, { useEffect, useRef, useState } from 'react'
import { useFormUrl } from '@/lib/api'
import { FormLoading } from '../GoogleFormEmbed/FormLoading'
import { FormFallback } from '../GoogleFormEmbed/FormFallback'
import { DEFAULT_API_PATH } from '../GoogleFormEmbed/constants'

interface Props {
  apiPath?: string
  embedUrl?: string
  buttonLabel?: string
  modalTitle?: string
  modalWidth?: string
  modalHeight?: string
}

export default function GoogleFormModal({
  apiPath = DEFAULT_API_PATH,
  embedUrl,
  buttonLabel = 'Open Form',
  modalTitle = 'Form',
  modalWidth = 'max-w-4xl',
  modalHeight = 'h-[70vh] md:h-[75vh]'
}: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  // Use centralized API manager hook
  const { url, loading, error } = useFormUrl({
    apiPath,
    embedUrl,
    enabled: open && !embedUrl
  })

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700"
      >
        {buttonLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={modalTitle}>
          <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div ref={ref} className={`relative z-10 w-full ${modalWidth} bg-white rounded-lg shadow-lg overflow-hidden`} style={{ maxHeight: '90vh' }}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">{modalTitle}</h3>
              <button onClick={() => setOpen(false)} className="text-gray-600 hover:text-gray-800">✕</button>
            </div>
            <div className={`p-4 ${modalHeight}`} style={{ minHeight: '300px' }}>
              {/* Mobile-optimized: Smaller padding on mobile */}
              <style jsx>{`
                @media (max-width: 640px) {
                  .p-4 {
                    padding: 0.75rem;
                  }
                }
              `}</style>
              {loading && (
                <div className="h-full">
                  <FormLoading />
                </div>
              )}
              {error && (
                <div className="h-full">
                  <FormFallback message={error} />
                </div>
              )}
              {!loading && !error && url && (
                <iframe src={url} title={modalTitle} width="100%" height="100%" className="border-0" loading="lazy" />
              )}
              {!loading && !error && !url && (
                <div className="h-full">
                  <FormFallback />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
