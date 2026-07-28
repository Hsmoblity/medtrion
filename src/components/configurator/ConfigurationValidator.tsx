// Phase 3: Advanced Configuration Validation & Compatibility Checker
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ConfigurableProductSchema } from '../../lib/interfaces/configurator';
import { useAccessibility } from '../../hooks/useAccessibility';

interface ValidationRule {
  id: string;
  name: string;
  description: string;
  type: 'required' | 'conflict' | 'dependency' | 'recommendation' | 'compatibility';
  severity: 'error' | 'warning' | 'info';
  categories?: string[];
  options?: number[];
  check: (selectedOptions: Record<string, ConfigurableProductSchema[]>) => boolean;
  message: (selectedOptions: Record<string, ConfigurableProductSchema[]>) => string;
  autoResolve?: (selectedOptions: Record<string, ConfigurableProductSchema[]>) => {
    action: 'add' | 'remove' | 'replace';
    categoryId: string;
    optionId: number;
    newOptionId?: number;
  };
}

interface ValidationResult {
  rule: ValidationRule;
  isValid: boolean;
  message: string;
  autoResolveAction?: {
    action: 'add' | 'remove' | 'replace';
    categoryId: string;
    optionId: number;
    newOptionId?: number;
  };
}

interface ConfigurationValidatorProps {
  selectedOptions: Record<string, ConfigurableProductSchema[]>;
  categories: any[];
  onValidationChange?: (results: ValidationResult[]) => void;
  onAutoResolve?: (action: ValidationResult['autoResolveAction']) => void;
  showValidationPanel?: boolean;
  validationMode?: 'strict' | 'lenient' | 'advisory';
}

const ConfigurationValidator: React.FC<ConfigurationValidatorProps> = ({
  selectedOptions,
  categories,
  onValidationChange,
  onAutoResolve,
  showValidationPanel = false,
  validationMode = 'lenient'
}) => {
  const { announceToScreenReader, highContrast } = useAccessibility();
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [showResolutions, setShowResolutions] = useState<boolean>(false);

  // Define validation rules
  const validationRules: ValidationRule[] = useMemo(() => [
    // Required Category Rule
    {
      id: 'required-categories',
      name: 'Required Categories',
      description: 'Ensure all required categories have selections',
      type: 'required',
      severity: 'error',
      check: (selected) => {
        const requiredCategories = categories.filter(cat => cat.required);
        return requiredCategories.every(cat => 
          selected[cat.id] && selected[cat.id].length > 0
        );
      },
      message: (selected) => {
        const requiredCategories = categories.filter(cat => cat.required);
        const missingCategories = requiredCategories.filter(cat => 
          !selected[cat.id] || selected[cat.id].length === 0
        );
        return `Missing selections in required categories: ${missingCategories.map(c => c.name).join(', ')}`;
      }
    },

    // Maximum Selection Rule
    {
      id: 'max-selections',
      name: 'Maximum Selections',
      description: 'Ensure categories do not exceed maximum selections',
      type: 'conflict',
      severity: 'error',
      check: (selected) => {
        return categories.every(cat => {
          if (!cat.maxSelections) return true;
          const categorySelections = selected[cat.id] || [];
          return categorySelections.length <= cat.maxSelections;
        });
      },
      message: (selected) => {
        const violatingCategories = categories.filter(cat => {
          if (!cat.maxSelections) return false;
          const categorySelections = selected[cat.id] || [];
          return categorySelections.length > cat.maxSelections;
        });
        return `Too many selections in: ${violatingCategories.map(c => 
          `${c.name} (${selected[c.id]?.length || 0}/${c.maxSelections})`
        ).join(', ')}`;
      }
    },

    // Option Dependency Rule
    {
      id: 'option-dependencies',
      name: 'Option Dependencies',
      description: 'Check for missing required dependencies',
      type: 'dependency',
      severity: 'warning',
      check: (selected) => {
        // Check if selected options have their dependencies met
        for (const categoryId in selected) {
          const categoryOptions = selected[categoryId];
          for (const option of categoryOptions) {
            const dependencies = (option as any).dependencies as number[] | undefined;
            if (dependencies) {
              const hasAllDependencies = dependencies.every((depId: number) => 
                Object.values(selected).flat().some(opt => opt.databaseId === depId)
              );
              if (!hasAllDependencies) return false;
            }
          }
        }
        return true;
      },
      message: (selected) => {
        const missingDeps: string[] = [];
        for (const categoryId in selected) {
          const categoryOptions = selected[categoryId];
          for (const option of categoryOptions) {
            const dependencies = (option as any).dependencies as number[] | undefined;
            if (dependencies) {
              const missingDependencies = dependencies.filter((depId: number) => 
                !Object.values(selected).flat().some(opt => opt.databaseId === depId)
              );
              if (missingDependencies.length > 0) {
                missingDeps.push(`${option.name} requires additional options`);
              }
            }
          }
        }
        return `Missing dependencies: ${missingDeps.join(', ')}`;
      }
    },

    // Compatibility Rule
    {
      id: 'option-compatibility',
      name: 'Option Compatibility',
      description: 'Check for incompatible option combinations',
      type: 'compatibility',
      severity: 'error',
      check: (selected) => {
        // Check for incompatible combinations
        const allSelected = Object.values(selected).flat();
        for (const option of allSelected) {
          const incompatibleWith = (option as any).incompatibleWith as number[] | undefined;
          if (incompatibleWith) {
            const hasIncompatible = incompatibleWith.some((incompatId: number) =>
              allSelected.some(opt => opt.databaseId === incompatId)
            );
            if (hasIncompatible) return false;
          }
        }
        return true;
      },
      message: (selected) => {
        const conflicts: string[] = [];
        const allSelected = Object.values(selected).flat();
        for (const option of allSelected) {
          const incompatibleWith = (option as any).incompatibleWith as number[] | undefined;
          if (incompatibleWith) {
            const incompatibleOptions = incompatibleWith.filter((incompatId: number) =>
              allSelected.some(opt => opt.databaseId === incompatId)
            );
            if (incompatibleOptions.length > 0) {
              conflicts.push(`${option.name} conflicts with other selections`);
            }
          }
        }
        return `Compatibility conflicts: ${conflicts.join(', ')}`;
      }
    },

    // Price Range Recommendation
    {
      id: 'price-optimization',
      name: 'Price Optimization',
      description: 'Suggest cost-effective combinations',
      type: 'recommendation',
      severity: 'info',
      check: () => true, // Always show recommendations
      message: (selected) => {
        const totalOptions = Object.values(selected).flat().length;
        if (totalOptions === 0) return 'Start adding options to see price recommendations';
        if (totalOptions < 3) return 'Consider adding more options for better value packages';
        return 'Current configuration looks good for value';
      }
    },

    // Accessibility Recommendations
    {
      id: 'accessibility-features',
      name: 'Accessibility Features',
      description: 'Recommend accessibility-enhancing options',
      type: 'recommendation',
      severity: 'info',
      check: (selected) => {
        // Check if user has selected accessibility-related options
        const allSelected = Object.values(selected).flat();
        return allSelected.some(option => 
          option.name?.toLowerCase().includes('accessibility') ||
          option.description?.toLowerCase().includes('accessible') ||
          option.name?.toLowerCase().includes('assist')
        );
      },
      message: (selected) => {
        const allSelected = Object.values(selected).flat();
        const hasAccessibilityOptions = allSelected.some(option => 
          option.name?.toLowerCase().includes('accessibility') ||
          option.description?.toLowerCase().includes('accessible') ||
          option.name?.toLowerCase().includes('assist')
        );
        
        if (!hasAccessibilityOptions) {
          return 'Consider adding accessibility features for enhanced mobility support';
        }
        return 'Great choice on accessibility features!';
      }
    }
  ], [categories]);

  // Run validation when selections change
  useEffect(() => {
    const results = validationRules.map(rule => {
      const isValid = rule.check(selectedOptions);
      const message = rule.message(selectedOptions);
      
      return {
        rule,
        isValid,
        message,
        autoResolveAction: rule.autoResolve ? rule.autoResolve(selectedOptions) : undefined
      };
    });

    // Filter results based on validation mode
    const filteredResults = results.filter(result => {
      if (validationMode === 'strict') return true;
      if (validationMode === 'lenient') return result.rule.severity !== 'info';
      if (validationMode === 'advisory') return result.rule.severity === 'error';
      return true;
    });

    setValidationResults(filteredResults);

    // Announce validation issues to screen reader
    const errors = filteredResults.filter(r => !r.isValid && r.rule.severity === 'error');
    const warnings = filteredResults.filter(r => !r.isValid && r.rule.severity === 'warning');
    
    if (errors.length > 0) {
      announceToScreenReader(`${errors.length} configuration error${errors.length === 1 ? '' : 's'} found`, 'assertive');
    } else if (warnings.length > 0) {
      announceToScreenReader(`${warnings.length} configuration warning${warnings.length === 1 ? '' : 's'} found`, 'polite');
    }

    // Notify parent component
    if (onValidationChange) {
      onValidationChange(filteredResults);
    }
  }, [selectedOptions, validationRules, validationMode, announceToScreenReader, onValidationChange]);

  const handleAutoResolve = (result: ValidationResult) => {
    if (result.autoResolveAction && onAutoResolve) {
      onAutoResolve(result.autoResolveAction);
      announceToScreenReader(`Auto-resolved: ${result.rule.name}`, 'polite');
    }
  };

  const getValidationSummary = () => {
    const errors = validationResults.filter(r => !r.isValid && r.rule.severity === 'error').length;
    const warnings = validationResults.filter(r => !r.isValid && r.rule.severity === 'warning').length;
    const infos = validationResults.filter(r => !r.isValid && r.rule.severity === 'info').length;

    return { errors, warnings, infos };
  };

  const { errors, warnings, infos } = getValidationSummary();

  if (!showValidationPanel && errors === 0 && warnings === 0) {
    return null;
  }

  return (
    <div className={`rounded-lg border ${highContrast ? 'border-white bg-black' : 'border-gray-200 bg-white'} p-4 mb-4`}>
      {/* Validation Summary */}
      <div className="mb-4">
        <h3 className={`text-lg font-medium ${highContrast ? 'text-white' : 'text-gray-900'}`}>
          Configuration Validation
        </h3>
        <div className="flex items-center space-x-4 mt-2">
          {errors > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {errors} Error{errors === 1 ? '' : 's'}
            </span>
          )}
          {warnings > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              {warnings} Warning{warnings === 1 ? '' : 's'}
            </span>
          )}
          {infos > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-brand-dark">
              {infos} Suggestion{infos === 1 ? '' : 's'}
            </span>
          )}
          {errors === 0 && warnings === 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              ✓ Valid Configuration
            </span>
          )}
        </div>
      </div>

      {/* Validation Results */}
      {(showValidationPanel || errors > 0 || warnings > 0) && (
        <div className="space-y-3">
          {validationResults
            .filter(result => !result.isValid || result.rule.severity === 'info')
            .map((result, index) => {
              const getSeverityStyles = () => {
                switch (result.rule.severity) {
                  case 'error':
                    return highContrast 
                      ? 'border-red-400 bg-red-900 text-red-100'
                      : 'border-red-200 bg-red-50 text-red-800';
                  case 'warning':
                    return highContrast 
                      ? 'border-yellow-400 bg-yellow-900 text-yellow-100'
                      : 'border-yellow-200 bg-yellow-50 text-yellow-800';
                  case 'info':
                    return highContrast 
                      ? 'border-orange-400 bg-blue-900 text-blue-100'
                      : 'border-orange-200 bg-orange-50 text-brand-dark';
                  default:
                    return highContrast ? 'border-gray-400 bg-gray-900 text-gray-100' : 'border-gray-200 bg-gray-50 text-gray-800';
                }
              };

              return (
                <div 
                  key={result.rule.id}
                  className={`border rounded-md p-3 ${getSeverityStyles()}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{result.rule.name}</h4>
                      <p className="text-sm mt-1">{result.message}</p>
                      {result.rule.description && (
                        <p className="text-xs mt-1 opacity-75">{result.rule.description}</p>
                      )}
                    </div>
                    {result.autoResolveAction && (
                      <button
                        onClick={() => handleAutoResolve(result)}
                        className={`ml-3 px-3 py-1 text-xs font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          highContrast 
                            ? 'bg-white text-black hover:bg-gray-200 focus:ring-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
                        }`}
                      >
                        Auto-resolve
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Toggle Resolutions */}
      {(errors > 0 || warnings > 0) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => setShowResolutions(!showResolutions)}
            className={`text-sm font-medium focus:outline-none focus:underline ${
              highContrast ? 'text-white hover:text-gray-300' : 'text-brand-primary hover:text-gray-500'
            }`}
          >
            {showResolutions ? 'Hide' : 'Show'} Resolution Suggestions
          </button>
          
          {showResolutions && (
            <div className="mt-2 space-y-2">
              <div className={`text-sm ${highContrast ? 'text-gray-300' : 'text-gray-600'}`}>
                <p>• Review required categories and make necessary selections</p>
                <p>• Check for option conflicts and incompatibilities</p>
                <p>• Consider recommended accessibility features</p>
                <p>• Use auto-resolve buttons where available</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConfigurationValidator;