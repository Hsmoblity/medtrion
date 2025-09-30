import React, { useState, useMemo } from 'react';
import { ConfiguratorCategory } from '../../lib/interfaces/configurator';

interface ConfiguratorSidebarProps {
  categories: ConfiguratorCategory[];
  currentCategoryId?: string;
  loading?: boolean;
  className?: string;
  onCategorySelect?: (categoryId: string) => void;
  onCategoryToggle?: (categoryId: string, collapsed: boolean) => void;
  selectedOptions?: Record<string, any[]>; // Add selectedOptions prop for total count calculation
}

const ConfiguratorSidebar: React.FC<ConfiguratorSidebarProps> = ({
  categories,
  currentCategoryId,
  loading = false,
  className = '',
  onCategorySelect,
  onCategoryToggle,
  selectedOptions = {}
}) => {
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  // Calculate total selected options across all categories
  const totalSelectedOptions = useMemo(() => {
    return Object.values(selectedOptions).flat().length;
  }, [selectedOptions]);

  // Calculate total available options across all categories
  const totalAvailableOptions = useMemo(() => {
    return categories.reduce((sum, category) => sum + (category.options?.length || 0), 0);
  }, [categories]);

  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    if (totalAvailableOptions === 0) return 0;
    return Math.round((totalSelectedOptions / totalAvailableOptions) * 100);
  }, [totalSelectedOptions, totalAvailableOptions]);

  const toggleCategory = (categoryId: string) => {
    const newCollapsed = new Set(collapsedCategories);
    const isCollapsed = newCollapsed.has(categoryId);
    
    if (isCollapsed) {
      newCollapsed.delete(categoryId);
    } else {
      newCollapsed.add(categoryId);
    }
    
    setCollapsedCategories(newCollapsed);
    onCategoryToggle?.(categoryId, !isCollapsed);
  };

  const getProgressIcon = (category: ConfiguratorCategory) => {
    if (category.loadingState === 'loading') {
      return (
        <svg className="animate-spin h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      );
    }

    if (category.validationError) {
      return (
        <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    }

    if (category.progressCount && category.progressCount.selected > 0) {
      const isComplete = category.required ? 
        category.progressCount.selected >= (category.minSelections || 1) : 
        category.progressCount.selected > 0;
      
      return (
        <svg className={`h-4 w-4 ${isComplete ? 'text-green-500' : 'text-yellow-500'}`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    }

    if (category.required) {
      return (
        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }

    return null;
  };

  const getProgressText = (category: ConfiguratorCategory) => {
    if (category.progressCount) {
      const { selected, total } = category.progressCount;
      if (category.multiSelect) {
        return `${selected}/${total} selected`;
      } else {
        return selected > 0 ? '1 selected' : `${total} options`;
      }
    }
    return category.options?.length ? `${category.options.length} options` : '';
  };

  const getCategoryIcon = (category: ConfiguratorCategory) => {
    if (category.icon) {
      return (
        <span className="text-lg" role="img" aria-label={`${category.name} icon`}>
          {category.icon}
        </span>
      );
    }

    // Default icons based on category type
    const iconMap: Record<string, JSX.Element> = {
      safety: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      comfort: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      installation: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
      ),
      accessory: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
        </svg>
      )
    };

    return iconMap[category.slug] || iconMap.accessory;
  };

  if (loading) {
    return (
      <div className={`configuration-options-container bg-white rounded-lg shadow-md p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="mb-4">
              <div className="h-5 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`configuration-options-container bg-white rounded-lg shadow-md ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h2 className="configuration-options-title text-lg font-semibold text-gray-900">Configuration Options</h2>
        <p className="configuration-options-subtitle text-sm text-gray-600 mt-1">
          Customize your mobility solution
        </p>
      </div>

      <nav className="configuration-categories-nav p-2" role="navigation" aria-label="Configuration categories">
        {categories.length === 0 ? (
          <div className="p-4 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="text-sm font-medium text-gray-900 mb-1">No Configuration Options</h3>
            <p className="text-xs text-gray-500">
              This product can be purchased as-is or contact us for custom configuration options.
            </p>
          </div>
        ) : (
          <ul className="configuration-category-list space-y-1">
            {categories.map((category) => {
            const isCollapsed = collapsedCategories.has(category.id);
            const isActive = currentCategoryId === category.id;
            const hasError = !!category.validationError;
            const isLoading = category.loadingState === 'loading';

            return (
              <li key={category.id} className="configuration-category-group">
                <div className="flex items-center">
                  <button
                    onClick={() => onCategorySelect?.(category.id)}
                    className={`configuration-category-item flex-1 flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                      isActive
                        ? 'configuration-category-active bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                        : hasError
                        ? 'configuration-category-error text-red-700 hover:bg-red-50'
                        : 'text-gray-700 hover:bg-gray-50'
                    } ${isLoading ? 'configuration-category-loading' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                    disabled={isLoading}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-3">
                          {getCategoryIcon(category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <span className="truncate">{category.name}</span>
                            {category.required && (
                              <span className="ml-1 text-red-500" aria-label="Required">*</span>
                            )}
                          </div>
                          {getProgressText(category) && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {getProgressText(category)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center ml-2">
                        {getProgressIcon(category)}
                        {category.options && category.options.length > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCategory(category.id);
                            }}
                            className="ml-2 text-gray-400 hover:text-gray-600"
                            aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} ${category.name}`}
                          >
                            <svg
                              className={`h-4 w-4 transition-transform duration-200 ${
                                isCollapsed ? 'transform rotate-180' : ''
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </button>
                </div>

                {/* Validation Error Message */}
                {hasError && (
                  <div className="ml-6 mt-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                    {category.validationError}
                  </div>
                )}

                {/* Help Text */}
                {category.helpText && !hasError && (
                  <div className="ml-6 mt-1 text-xs text-gray-500">
                    {category.helpText}
                  </div>
                )}

                {/* Subcategory Options Preview */}
                {!isCollapsed && category.options && category.options.length > 0 && (
                  <ul className="ml-6 mt-2 space-y-1">
                    {category.options.slice(0, 3).map((option) => (
                      <li key={option.databaseId} className="text-xs text-gray-600">
                        • {option.name}
                      </li>
                    ))}
                    {category.options.length > 3 && (
                      <li className="text-xs text-gray-500">
                        ... and {category.options.length - 3} more
                      </li>
                    )}
                  </ul>
                )}
              </li>
            );
          })}
          </ul>
        )}
      </nav>

      {/* Progress Summary */}
      <div className="configuration-progress-bar p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-sm text-gray-600">
          <div className="flex justify-between items-center">
            <span className="configuration-progress-label">Configuration Progress</span>
            <span className="configuration-progress-text font-medium">
              {totalSelectedOptions} of {totalAvailableOptions} options selected
            </span>
          </div>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div 
              className="configuration-progress-fill bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${progressPercentage}%`
              }}
            />
          </div>
          <div className="mt-1 text-xs text-gray-500 text-center">
            {progressPercentage}% complete
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguratorSidebar;