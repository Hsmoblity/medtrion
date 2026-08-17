/**
 * ProductOverview Component
 * Displays product overview/description with tabs
 */

import { useState } from 'react'

interface FeatureTab {
  title: string
  description: string
  id?: string
}

interface ProductOverviewProps {
  content: string
  featureTabs?: FeatureTab[]
}

export default function ProductOverview({ content, featureTabs = [] }: ProductOverviewProps) {
  const [activeTab, setActiveTab] = useState<string>('overview')

  // Build tabs array dynamically — हर feature tab को unique id दो (index के आधार पर)
  const OVERVIEW_TABS = [
    {
      id: 'overview',
      title: 'Product Overview',
      isContent: true
    },
    ...featureTabs.map((tab, index) => ({
      ...tab,
      id: `feature-${index}`,
    }))
  ]

  return (
    <div className="mt-12 mb-16 rounded-[28px] border border-[#0b1f3a]/10 bg-gradient-to-br from-white via-[#f8fbff] to-[#f2fbfa] p-8 shadow-[0_20px_60px_rgba(11,31,58,0.08)]">
      {/* Tabs Navigation */}
      <div className="flex flex-col sm:flex-row gap-0 border-b border-[#0b1f3a]/10 mb-8 overflow-x-auto">
        {OVERVIEW_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-4 font-semibold text-base whitespace-nowrap transition-all duration-200 border-b-2 ${
              activeTab === tab.id
                ? 'border-[#3fa2a3] text-[#3fa2a3]'
                : 'border-transparent text-[#0b1f3a] hover:text-[#3fa2a3]'
            }`}
          >
            {tab.title}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fadeIn">
        {activeTab === 'overview' && (
          <div
            className="space-y-4 text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: content
                .split(/\r?\n\s*\r?\n/) // blank line से पहचानो paragraph break (chahe \n\n ho ya \r\n\r\n)
                .filter((para) => para.trim() !== '')
                .map((para) => `<p class="text-base">${para.trim().replace(/\r?\n/g, '<br/>')}</p>`)
                .join('')
            }}
          />
        )}

        {OVERVIEW_TABS.map((tab) => {
          const isOverviewTab = (tab as any).isContent
          const isFeatureTab = !isOverviewTab && 'description' in tab

          return (
            activeTab === tab.id &&
            isFeatureTab && (
              <div key={tab.id}>
                <p className="text-base text-gray-700 leading-relaxed">
                  {(tab as FeatureTab).description}
                </p>
              </div>
            )
          )
        })}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  )
}