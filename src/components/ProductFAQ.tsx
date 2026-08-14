/**
 * ProductFAQ Component
 * Displays frequently asked questions specific to a product
 */

import { useState } from 'react'

interface ProductFAQProps {
  faqs: {
    question: string
    answer: string
  }[]
}

export default function ProductFAQ({ faqs }: ProductFAQProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  return (
    <div className="mt-16 rounded-[28px] border border-[#0b1f3a]/10 bg-gradient-to-br from-white via-[#f8fbff] to-[#f2fbfa] p-8 shadow-[0_20px_60px_rgba(11,31,58,0.08)]">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#0b1f3a]">Frequently Asked Questions</h2>
        <div className="mt-3 h-1.5 w-20 rounded-full bg-gradient-to-r from-[#f7a236] to-[#3fa2a3]" />
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-[#0b1f3a]/10 rounded-xl overflow-hidden transition-all duration-300"
          >
            <button
              onClick={() =>
                setExpandedIndex(expandedIndex === index ? null : index)
              }
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#f8fbff] transition-colors duration-200"
            >
              <span className="font-semibold text-[#0b1f3a] text-left">
                {faq.question}
              </span>
              <svg
                className={`w-5 h-5 text-[#3fa2a3] flex-shrink-0 ml-4 transition-transform duration-300 ${
                  expandedIndex === index ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </button>

            {expandedIndex === index && (
              <div className="px-6 pb-4 bg-gradient-to-br from-[#f8fbff] to-[#f2fbfa] border-t border-[#0b1f3a]/10">
                <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
