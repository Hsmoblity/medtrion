import React, { useState, useEffect } from 'react';
import { ConfiguratorCategory, ConfigurableProductSchema, CompatibilityIssue } from '../../lib/interfaces/configurator';
import { PrimaryButton } from 'components/ui';
import OptionCard from './OptionCard';
import OptionCardSkeleton from './OptionCardSkeleton';

interface CategoryGroupProps {
  category: ConfiguratorCategory;
  selectedOptions: ConfigurableProductSchema[];
  compatibilityIssues?: CompatibilityIssue[];
  loading?: boolean;
  error?: string;
  collapsed?: boolean;
  className?: string;
  onToggleOption?: (option: ConfigurableProductSchema) => void;
  onViewDetails?: (option: ConfigurableProductSchema) => void;
  onToggleCollapse?: (collapsed: boolean) => void;
  onValidationError?: (error: string | null) => void;
}

const CategoryGroup: React.FC<CategoryGroupProps> = ({
  category,
  selectedOptions,
  compatibilityIssues = [],
  loading = false,
  error,
  collapsed = false,
  className = '',
  onToggleOption,
  onViewDetails,
  onToggleCollapse,
  onValidationError
}) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Validate category requirements
  useEffect(() => {
    if (category.required && category.minSelections) {
      const selectedCount = selectedOptions.length;
      if (selectedCount < category.minSelections) {
        const error = `Please select at least ${category.minSelections} option${category.minSelections > 1 ? 's' : ''} from ${category.name}`;
        setValidationError(error);
        onValidationError?.(error);
      } else {
        setValidationError(null);
        onValidationError?.(null);
      }
    }

    if (category.maxSelections && selectedOptions.length > category.maxSelections) {
      const error = `Maximum ${category.maxSelections} option${category.maxSelections > 1 ? 's' : ''} allowed in ${category.name}`;
      setValidationError(error);
      onValidationError?.(error);
    }
  }, [selectedOptions, category, onValidationError]);

  const toggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onToggleCollapse?.(newCollapsed);
  };

  const isOptionSelected = (option: ConfigurableProductSchema) => {
    return selectedOptions.some(selected => selected.databaseId === option.databaseId);
  };

  const getOptionCompatibilityIssues = (option: ConfigurableProductSchema) => {
    return compatibilityIssues.filter(issue => 
      issue.affectedOptions.includes(option.databaseId || 0)
    );
  };

  const canSelectMoreOptions = () => {
    if (!category.maxSelections) return true;
    return selectedOptions.length < category.maxSelections;
  };

  const getHeaderIcon = () => {
    if (loading || category.loadingState === 'loading') {
      return (
        <svg className="animate-spin h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      );
    }

    if (error || validationError) {
      return (
        <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    }

    if (selectedOptions.length > 0) {
      const isComplete = category.required ? 
        selectedOptions.length >= (category.minSelections || 1) : 
        selectedOptions.length > 0;
      
      return (
        <svg className={`h-5 w-5 ${isComplete ? 'text-green-500' : 'text-yellow-500'}`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    }

    return category.icon ? (
      <span className="text-xl" role="img" aria-label={`${category.name} icon`}>
        {category.icon}
      </span>
    ) : (
      <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
      </svg>
    );
  };

  const getProgressText = () => {
    const selectedCount = selectedOptions.length;
    const totalOptions = category.options?.length || 0;
    
    if (category.multiSelect) {
      return `${selectedCount}/${totalOptions} selected`;
    } else {
      return selectedCount > 0 ? '1 selected' : `${totalOptions} options`;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Category Header */}
      <div className="border-b border-gray-200">
        <button
          onClick={toggleCollapse}
          className="w-full px-6 py-4 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset transition-colors duration-150"
          aria-expanded={!isCollapsed}
          aria-controls={`category-${category.id}-content`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-3">
                {getHeaderIcon()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    {category.name}
                  </h3>
                  {category.required && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Required
                    </span>
                  )}
                  {selectedOptions.length > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                      {selectedOptions.length}
                    </span>
                  )}
                  {category.required && (
                    <span className="ml-2 text-red-500 text-sm" aria-label="Required">
                      *
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {getProgressText()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center ml-4">
              <svg
                className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                  isCollapsed ? 'transform rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </button>

        {/* Category Description */}
        {category.description && !isCollapsed && (
          <div className="px-6 pb-4">
            <p className="text-sm text-gray-600">{category.description}</p>
          </div>
        )}

        {/* Validation Error */}
        {(validationError || error) && !isCollapsed && (
          <div className="px-6 pb-4">
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-red-800">
                    {error ? 'Loading Error' : 'Validation Error'}
                  </h4>
                  <p className="text-sm text-red-700 mt-1">
                    {error || validationError}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Text */}
        {category.helpText && !isCollapsed && !validationError && !error && (
          <div className="px-6 pb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">{category.helpText}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category Content */}
      <div
        id={`category-${category.id}-content`}
        className={`transition-all duration-300 ${isCollapsed ? 'h-0 overflow-hidden' : 'h-auto'}`}
      >
        <div className="p-6">
          {loading || category.loadingState === 'loading' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, index) => (
                <OptionCardSkeleton key={index} variant="default" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Failed to load options</h3>
              <p className="mt-1 text-sm text-gray-500">{error}</p>
              <div className="mt-6">
                <PrimaryButton
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </PrimaryButton>
              </div>
            </div>
          ) : !category.options || category.options.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No options available</h3>
              <p className="mt-1 text-sm text-gray-500">
                There are currently no options available in this category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.options.map((option) => {
                const isSelected = isOptionSelected(option);
                const optionIssues = getOptionCompatibilityIssues(option);
                const isDisabled = !canSelectMoreOptions() && !isSelected;

                return (
                  <OptionCard
                    key={option.databaseId}
                    option={option}
                    categoryId={category.id}
                    isSelected={isSelected}
                    disabled={isDisabled}
                    variant="default"
                    size="medium"
                    showPrice={true}
                    showCompatibility={optionIssues.length > 0}
                    compatibilityIssues={optionIssues}
                    onToggle={() => onToggleOption?.(option)}
                    onViewDetails={() => onViewDetails?.(option)}
                  />
                );
              })}
            </div>
          )}

          {/* Selection Limits Info */}
          {!loading && category.options && category.options.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              {category.multiSelect && (
                <div className="flex justify-between items-center">
                  <span>
                    {category.minSelections && (
                      <>Minimum: {category.minSelections} • </>
                    )}
                    {category.maxSelections && (
                      <>Maximum: {category.maxSelections} • </>
                    )}
                    Selected: {selectedOptions.length}
                  </span>
                  {selectedOptions.length > 0 && (
                    <button
                      onClick={() => {
                        selectedOptions.forEach(option => onToggleOption?.(option));
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryGroup;