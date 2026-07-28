// Phase 3: Advanced User Preferences Management
'use client';

import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../../hooks/useAccessibility';
import { usePerformanceOptimization } from '../../hooks/usePerformanceOptimization';

interface PreferenceSection {
  id: string;
  title: string;
  description: string;
  preferences: PreferenceItem[];
}

interface PreferenceItem {
  id: string;
  label: string;
  description: string;
  type: 'toggle' | 'select' | 'range';
  value: any;
  options?: { value: any; label: string }[];
  min?: number;
  max?: number;
  step?: number;
}

interface ConfiguratorPreferencesProps {
  isOpen: boolean;
  onClose: () => void;
  onPreferencesUpdate?: (preferences: Record<string, any>) => void;
}

const ConfiguratorPreferences: React.FC<ConfiguratorPreferencesProps> = ({
  isOpen,
  onClose,
  onPreferencesUpdate
}) => {
  const {
    reducedMotion,
    highContrast,
    largeText,
    screenReaderOptimized,
    keyboardNavigation,
    updatePreference,
    resetPreferences,
    announceToScreenReader,
    focusManagement
  } = useAccessibility();

  const { cleanup } = usePerformanceOptimization();

  const [preferences, setPreferences] = useState<PreferenceSection[]>([
    {
      id: 'accessibility',
      title: 'Accessibility Preferences',
      description: 'Customize the interface to meet your accessibility needs',
      preferences: [
        {
          id: 'reducedMotion',
          label: 'Reduce Motion',
          description: 'Minimize animations and transitions',
          type: 'toggle',
          value: reducedMotion
        },
        {
          id: 'highContrast',
          label: 'High Contrast',
          description: 'Increase contrast for better visibility',
          type: 'toggle',
          value: highContrast
        },
        {
          id: 'largeText',
          label: 'Large Text',
          description: 'Increase text size for easier reading',
          type: 'toggle',
          value: largeText
        },
        {
          id: 'screenReaderOptimized',
          label: 'Screen Reader Optimized',
          description: 'Enhanced compatibility with screen readers',
          type: 'toggle',
          value: screenReaderOptimized
        },
        {
          id: 'keyboardNavigation',
          label: 'Enhanced Keyboard Navigation',
          description: 'Improved keyboard shortcuts and focus management',
          type: 'toggle',
          value: keyboardNavigation
        }
      ]
    },
    {
      id: 'performance',
      title: 'Performance Preferences',
      description: 'Optimize performance based on your device and connection',
      preferences: [
        {
          id: 'lazyLoading',
          label: 'Lazy Loading',
          description: 'Load content as needed to improve performance',
          type: 'toggle',
          value: true
        },
        {
          id: 'virtualization',
          label: 'List Virtualization',
          description: 'Optimize rendering of large option lists',
          type: 'toggle',
          value: true
        },
        {
          id: 'imageQuality',
          label: 'Image Quality',
          description: 'Balance between quality and loading speed',
          type: 'select',
          value: 'medium',
          options: [
            { value: 'low', label: 'Low (Faster Loading)' },
            { value: 'medium', label: 'Medium (Balanced)' },
            { value: 'high', label: 'High (Best Quality)' }
          ]
        }
      ]
    },
    {
      id: 'interface',
      title: 'Interface Preferences',
      description: 'Customize the configurator interface to your liking',
      preferences: [
        {
          id: 'compactMode',
          label: 'Compact Mode',
          description: 'Show more options in less space',
          type: 'toggle',
          value: false
        },
        {
          id: 'showTooltips',
          label: 'Show Tooltips',
          description: 'Display helpful tooltips on hover',
          type: 'toggle',
          value: true
        },
        {
          id: 'autoSave',
          label: 'Auto-save Configuration',
          description: 'Automatically save your progress',
          type: 'toggle',
          value: true
        },
        {
          id: 'animationSpeed',
          label: 'Animation Speed',
          description: 'Adjust the speed of interface animations',
          type: 'range',
          value: 1,
          min: 0.5,
          max: 2,
          step: 0.1
        }
      ]
    }
  ]);

  // Update preferences when accessibility hook values change
  useEffect(() => {
    setPreferences(prev => 
      prev.map(section => 
        section.id === 'accessibility' 
          ? {
              ...section,
              preferences: section.preferences.map(pref => ({
                ...pref,
                value: 
                  pref.id === 'reducedMotion' ? reducedMotion :
                  pref.id === 'highContrast' ? highContrast :
                  pref.id === 'largeText' ? largeText :
                  pref.id === 'screenReaderOptimized' ? screenReaderOptimized :
                  pref.id === 'keyboardNavigation' ? keyboardNavigation :
                  pref.value
              }))
            }
          : section
      )
    );
  }, [reducedMotion, highContrast, largeText, screenReaderOptimized, keyboardNavigation]);

  const handlePreferenceChange = (sectionId: string, prefId: string, value: any) => {
    // Update local state
    setPreferences(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? {
              ...section,
              preferences: section.preferences.map(pref => 
                pref.id === prefId ? { ...pref, value } : pref
              )
            }
          : section
      )
    );

    // Update accessibility preferences
    if (sectionId === 'accessibility') {
      updatePreference(prefId as any, value);
      announceToScreenReader(`${prefId} ${value ? 'enabled' : 'disabled'}`, 'polite');
    }

    // Notify parent component
    if (onPreferencesUpdate) {
      const allPrefs = preferences.reduce((acc, section) => {
        section.preferences.forEach(pref => {
          acc[`${section.id}.${pref.id}`] = pref.id === prefId ? value : pref.value;
        });
        return acc;
      }, {} as Record<string, any>);
      onPreferencesUpdate(allPrefs);
    }
  };

  const handleResetPreferences = () => {
    resetPreferences();
    // Reset local preferences to defaults
    setPreferences(prev => 
      prev.map(section => ({
        ...section,
        preferences: section.preferences.map(pref => ({
          ...pref,
          value: 
            pref.id === 'reducedMotion' ? false :
            pref.id === 'highContrast' ? false :
            pref.id === 'largeText' ? false :
            pref.id === 'screenReaderOptimized' ? false :
            pref.id === 'keyboardNavigation' ? true :
            pref.id === 'lazyLoading' ? true :
            pref.id === 'virtualization' ? true :
            pref.id === 'imageQuality' ? 'medium' :
            pref.id === 'compactMode' ? false :
            pref.id === 'showTooltips' ? true :
            pref.id === 'autoSave' ? true :
            pref.id === 'animationSpeed' ? 1 :
            pref.value
        }))
      }))
    );
    announceToScreenReader('All preferences reset to defaults', 'polite');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="preferences-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full ${
          highContrast 
            ? 'bg-black text-white border-2 border-white' 
            : 'bg-white'
        }`}>
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="w-full">
                {/* Header */}
                <div className="mb-6">
                  <h3 className={`text-lg leading-6 font-medium ${highContrast ? 'text-white' : 'text-gray-900'}`} id="preferences-title">
                    Configurator Preferences
                  </h3>
                  <p className={`mt-2 text-sm ${highContrast ? 'text-gray-300' : 'text-gray-500'}`}>
                    Customize your configurator experience to match your needs and preferences.
                  </p>
                </div>

                {/* Preference Sections */}
                <div className="space-y-8">
                  {preferences.map((section) => (
                    <div key={section.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <h4 className={`text-md font-medium mb-2 ${highContrast ? 'text-white' : 'text-gray-800'}`}>
                        {section.title}
                      </h4>
                      <p className={`text-sm mb-4 ${highContrast ? 'text-gray-300' : 'text-gray-600'}`}>
                        {section.description}
                      </p>

                      <div className="space-y-4">
                        {section.preferences.map((pref) => (
                          <div key={pref.id} className="flex items-center justify-between">
                            <div className="flex-1 mr-4">
                              <label 
                                htmlFor={`${section.id}-${pref.id}`}
                                className={`block text-sm font-medium ${highContrast ? 'text-white' : 'text-gray-700'}`}
                              >
                                {pref.label}
                              </label>
                              <p className={`text-xs ${highContrast ? 'text-gray-400' : 'text-gray-500'}`}>
                                {pref.description}
                              </p>
                            </div>

                            <div className="flex-shrink-0">
                              {pref.type === 'toggle' && (
                                <button
                                  type="button"
                                  id={`${section.id}-${pref.id}`}
                                  className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                    pref.value 
                                      ? highContrast ? 'bg-white' : 'bg-blue-600' 
                                      : highContrast ? 'bg-gray-600' : 'bg-gray-200'
                                  }`}
                                  role="switch"
                                  aria-checked={pref.value}
                                  aria-labelledby={`${section.id}-${pref.id}-label`}
                                  onClick={() => handlePreferenceChange(section.id, pref.id, !pref.value)}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-5 w-5 rounded-full shadow transform ring-0 transition ease-in-out duration-200 ${
                                      pref.value 
                                        ? 'translate-x-5' + (highContrast ? ' bg-black' : ' bg-white')
                                        : 'translate-x-0' + (highContrast ? ' bg-gray-300' : ' bg-white')
                                    }`}
                                  />
                                </button>
                              )}

                              {pref.type === 'select' && (
                                <select
                                  id={`${section.id}-${pref.id}`}
                                  value={pref.value}
                                  onChange={(e) => handlePreferenceChange(section.id, pref.id, e.target.value)}
                                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-orange-500 sm:text-sm ${
                                    highContrast 
                                      ? 'bg-black text-white border-white' 
                                      : 'bg-white text-gray-900 border-gray-300'
                                  }`}
                                >
                                  {pref.options?.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              )}

                              {pref.type === 'range' && (
                                <input
                                  type="range"
                                  id={`${section.id}-${pref.id}`}
                                  min={pref.min}
                                  max={pref.max}
                                  step={pref.step}
                                  value={pref.value}
                                  onChange={(e) => handlePreferenceChange(section.id, pref.id, parseFloat(e.target.value))}
                                  className={`w-24 ${highContrast ? 'accent-white' : 'accent-blue-600'}`}
                                />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ${highContrast ? 'bg-gray-900 border-t border-white' : 'bg-gray-50'}`}>
            <button
              type="button"
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${
                highContrast 
                  ? 'bg-white text-black hover:bg-gray-200 focus:ring-white' 
                  : 'bg-[#3fa2a3] text-white hover:bg-[#f7a236] focus:ring-[#f7a236] rounded-[35px] px-6 py-3'
              }`}
              onClick={onClose}
            >
              Apply Preferences
            </button>
            <button
              type="button"
              className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${
                highContrast 
                  ? 'bg-gray-700 text-white border-gray-500 hover:bg-gray-600 focus:ring-gray-400' 
                  : 'bg-[#f7a236] text-white border-[#f7a236] hover:bg-[#3fa2a3] focus:ring-[#3fa2a3] rounded-[35px] px-6 py-3'
              }`}
              onClick={handleResetPreferences}
            >
              Reset to Defaults
            </button>
            <button
              type="button"
              className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm ${
                highContrast 
                  ? 'bg-gray-700 text-white border-gray-500 hover:bg-gray-600 focus:ring-gray-400' 
                  : 'bg-[#f7a236] text-white border-[#f7a236] hover:bg-[#3fa2a3] focus:ring-[#3fa2a3] rounded-[35px] px-6 py-3'
              }`}
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguratorPreferences;