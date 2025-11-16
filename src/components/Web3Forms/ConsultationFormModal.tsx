/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ConsultationFormModal Component - Web3Forms Modal Implementation
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Modal version of consultation form using Web3Forms
 * Replaces GoogleFormModal component
 * 
 * USAGE:
 * ```tsx
 * <ConsultationFormModal 
 *   buttonLabel="Request Consultation"
 *   modalTitle="Free Consultation Request"
 *   includeCart={true}
 * />
 * ```
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ConsultationForm from './ConsultationForm'
import { useRouter } from 'next/router'

interface ConsultationFormModalProps {
  buttonLabel?: string
  modalTitle?: string
  includeCart?: boolean
  className?: string
}

export default function ConsultationFormModal({
  buttonLabel = "Request Free Consultation",
  modalTitle = "Free Consultation Request",
  includeCart = false,
  className = ""
}: ConsultationFormModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleSuccess = () => {
    setIsOpen(false)
    router.push('/consultation/success')
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 ${className}`}
      >
        {buttonLabel}
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            >
              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto z-50"
              >
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                  <h2 className="text-2xl font-bold text-gray-900">{modalTitle}</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close modal"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6">
                  <ConsultationForm 
                    onSuccess={handleSuccess}
                    includeCart={includeCart}
                  />
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// Agent Signature: 160125 - Fullstack - Web3Forms_Consultation_Modal_Replacement

