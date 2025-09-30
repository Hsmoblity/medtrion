import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { 
  ConfigurableProductSchema, 
  ConfiguratorCategory, 
  CompatibilityIssue,
  ConfigurationSummaryData,
  FinancingOption,
  InsuranceEstimate,
  SavedConfigurationExtended,
  GraphQLResponse 
} from '../../lib/interfaces/configurator';
import { parsePrice, formatPrice } from '../../lib/utils/priceUtils';
import ClientOnly from '../ClientOnly';

import { useConfiguratorStore } from '../../stores/configuratorStore';
import ModelHero from './ModelHero';
import ConfiguratorSidebar from './ConfiguratorSidebar';
import CategoryGroup from './CategoryGroup';
import SummaryPanel from './SummaryPanel';
import CompatibilityAlert from './CompatibilityAlert';
import ConfigurationSummary from './ConfigurationSummary';
import SaveConfigurationModal from './SaveConfigurationModal';

interface ModelConfiguratorProps {
  baseModel: ConfigurableProductSchema;
  categories: ConfiguratorCategory[];
  financingOptions?: FinancingOption[];
  insuranceEstimate?: InsuranceEstimate;
  loading?: boolean;
  error?: string;
  className?: string;
  
  // Edit session props for cart-to-configurator flow (ALIGNED WITH STANDARDIZED SPECS)
  editSessionId?: string;
  cartItemId?: string;
  isEditMode?: boolean;
  initialConfiguration?: any; // Configuration type from conversion utils
  
  // Event handlers
  onAddToCart?: (configuration: ConfigurationSummaryData) => Promise<void>;
  onSaveConfiguration?: (name: string, notes?: string) => Promise<SavedConfigurationExtended>;
  onConfigurationSave?: (config: any) => Promise<void>; // For edit mode save
  onEditSessionComplete?: (cartItemId: string, updatedConfig: any) => void; // Edit completion handler
  onShareConfiguration?: (configuration: ConfigurationSummaryData) => void;
  onLoadConfiguration?: (configId: string) => Promise<ConfigurationSummaryData>;
  onConfigurationChange?: (configuration: ConfigurationSummaryData) => void;
  
  // API functions (for GraphQL or REST calls)
  onFetchCategoryOptions?: (categoryId: string) => Promise<ConfigurableProductSchema[]>;
  onCheckCompatibility?: (selectedOptions: ConfigurableProductSchema[]) => Promise<CompatibilityIssue[]>;
  onCalculateFinancing?: (totalPrice: number) => Promise<FinancingOption[]>;
  onEstimateInsurance?: (configuration: ConfigurationSummaryData) => Promise<InsuranceEstimate>;
}

const ModelConfigurator: React.FC<ModelConfiguratorProps> = ({
  baseModel,
  categories: initialCategories,
  financingOptions = [],
  insuranceEstimate,
  loading = false,
  error,
  className = '',
  // Edit mode props
  editSessionId,
  cartItemId,
  isEditMode = false,
  initialConfiguration,
  // Event handlers
  onAddToCart,
  onSaveConfiguration,
  onConfigurationSave,
  onEditSessionComplete,
  onShareConfiguration,
  onLoadConfiguration,
  onConfigurationChange,
  onFetchCategoryOptions,
  onCheckCompatibility,
  onCalculateFinancing,
  onEstimateInsurance
}) => {
  // Router for navigation
  const router = useRouter();
  
  // Local state - ONLY for UI interactions
  const [currentCategoryId, setCurrentCategoryId] = useState<string>('');
  const [selectedFinancing, setSelectedFinancing] = useState<FinancingOption | undefined>();
  const [showSummary, setShowSummary] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveModalLoading, setSaveModalLoading] = useState(false);
  const [saveModalError, setSaveModalError] = useState<string | undefined>();
  const [addToCartLoading, setAddToCartLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Zustand store - SINGLE SOURCE OF TRUTH for configuration data
  const {
    model,
    setModel,
    categories, // ✅ Use global store categories
    setCategories, // ✅ Use global store action
    selectedOptions, // ✅ Use global store selectedOptions
    addOption,
    removeOption,
    clearCategory,
    compatibilityIssues, // ✅ Use global store compatibilityIssues
    setCompatibilityIssues, // ✅ Use global store action
    summary,
    calculateSummary,
    checkCompatibility: storeCheckCompatibility
  } = useConfiguratorStore();

  // Initialize base model
  useEffect(() => {
    setModel(baseModel);
  }, [baseModel, setModel]);

  // Initialize edit mode configuration - handle client-side cart access
  useEffect(() => {
    if (isEditMode && cartItemId && isHydrated) {
      console.log('Initializing edit mode with cart item ID:', cartItemId);
      
      // Import cart store dynamically to avoid SSR issues
      import('stores/cartStore').then(({ useCartStore }) => {
        const cartStore = useCartStore.getState();
        const cartItem = cartStore.findCartItem(cartItemId);
        
        if (cartItem) {
          console.log('Found cart item for edit mode:', cartItem);
          
          const cartItemOptions = cartItem.options || [];
          console.log('Processing cart item options:', cartItemOptions);
          
          // Process each cart option and try to match it with configurator categories
          cartItemOptions.forEach((option: any) => {
            console.log('Processing cart option:', option);
            
            // Find the category for this option - try multiple matching strategies
            const category = categories.find(cat => {
              if (!cat.options) return false;
              
              return cat.options.some(opt => {
                // Strategy 1: Match by databaseId/parentId
                if (option.parentId && opt.databaseId === option.parentId) return true;
                
                // Strategy 2: Match by value/id
                if (option.value && opt.id === option.value) return true;
                
                // Strategy 3: Match by name (case insensitive)
                if (option.name && opt.name && 
                    option.name.toLowerCase() === opt.name.toLowerCase()) return true;
                
                // Strategy 4: Match by slug/value
                if (option.value && opt.slug === option.value) return true;
                
                return false;
              });
            });
            
            if (category) {
              console.log('Found category for option:', category.name);
              
              // Find the actual option in the category using the same strategies
              const actualOption = category.options?.find(opt => {
                // Strategy 1: Match by databaseId/parentId
                if (option.parentId && opt.databaseId === option.parentId) return true;
                
                // Strategy 2: Match by value/id
                if (option.value && opt.id === option.value) return true;
                
                // Strategy 3: Match by name (case insensitive)
                if (option.name && opt.name && 
                    option.name.toLowerCase() === opt.name.toLowerCase()) return true;
                
                // Strategy 4: Match by slug/value
                if (option.value && opt.slug === option.value) return true;
                
                return false;
              });
              
              if (actualOption) {
                console.log('Adding option to configurator:', actualOption.name);
                addOption(actualOption, category.id);
              } else {
                console.warn('Option not found in category despite category match:', option);
              }
            } else {
              console.warn('No category found for cart option:', option);
              console.log('Available categories:', categories.map(c => ({ 
                name: c.name, 
                optionCount: c.options?.length || 0,
                sampleOptions: c.options?.slice(0, 2).map(o => ({ name: o.name, id: o.id, slug: o.slug, databaseId: o.databaseId }))
              })));
            }
          });
        } else {
          console.warn('Cart item not found for edit mode:', cartItemId);
        }
      }).catch(error => {
        console.error('Failed to load cart store for edit mode:', error);
      });
    } else if (isEditMode && !isHydrated) {
      console.log('Edit mode detected but not yet hydrated, waiting...');
    } else if (isEditMode && !cartItemId) {
      console.warn('Edit mode detected but no cartItemId provided');
    }
  }, [isEditMode, cartItemId, categories, addOption, isHydrated]);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Calculate configuration summary
  const getConfigurationSummary = useCallback((): ConfigurationSummaryData => {
    const allSelectedOptions = isHydrated ? Object.values(selectedOptions).flat() : [];
    // Use robust price parsing for base price
    const basePrice = parsePrice(baseModel.regularPrice || baseModel.price);
    const optionsPrice = allSelectedOptions.reduce((sum, option) => {
      return sum + parsePrice(option.regularPrice || option.price);
    }, 0);
    
    // Calculate installation cost (simplified)
    const installationPrice = allSelectedOptions.some(option => option.installationRequired) ? 500 : 0;
    
    // Calculate shipping (simplified)
    const shippingPrice = isHydrated ? 100 : 0;
    
    // Calculate tax (simplified - 8% on total before tax)
    const subtotal = basePrice + optionsPrice + installationPrice + shippingPrice;
    const taxAmount = isHydrated ? subtotal * 0.08 : 0;
    
    const totalPrice = subtotal + taxAmount;

    return {
      baseModel,
      selectedOptions: allSelectedOptions,
      totalPrice,
      basePrice,
      optionsPrice,
      installationPrice,
      shippingPrice,
      taxAmount,
      deliveryEstimate: '2-3 weeks',
      financingOption: isHydrated ? selectedFinancing : undefined,
      insuranceEstimate
    };
  }, [baseModel, selectedOptions, selectedFinancing, insuranceEstimate, isHydrated]);

  // Update summary when selections change
  useEffect(() => {
    const summary = getConfigurationSummary();
    calculateSummary();
    onConfigurationChange?.(summary);
  }, [selectedOptions, selectedFinancing, getConfigurationSummary, calculateSummary, onConfigurationChange]);

  // Convert ConfigurationSummaryData to ConfigurationSummary format for SummaryPanel
  const getConfigurationSummaryForPanel = useCallback(() => {
    const data = getConfigurationSummary();
    return {
      basePrice: data.basePrice,
      optionsTotal: data.optionsPrice,
      installationCost: data.installationPrice,
      shippingCost: data.shippingPrice,
      taxAmount: data.taxAmount,
      grandTotal: data.totalPrice,
      estimatedDelivery: '3-4 weeks'
    };
  }, [getConfigurationSummary]);

  // Check compatibility when selections change
  useEffect(() => {
    const checkCompatibilityAsync = async () => {
      const allSelectedOptions = Object.values(selectedOptions).flat();
      
      if (allSelectedOptions.length === 0) {
        setCompatibilityIssues([]);
        return;
      }

      try {
        let issues: CompatibilityIssue[] = [];
        
        if (onCheckCompatibility) {
          issues = await onCheckCompatibility(allSelectedOptions);
        } else {
          // Use store compatibility checking as fallback
          storeCheckCompatibility();
          // Get issues from store state
          const storeState = useConfiguratorStore.getState();
          issues = storeState.compatibilityIssues;
        }
        
                // Transform issues to match CompatibilityAlert component expectations
        setCompatibilityIssues(issues);
      } catch (error) {
        setCompatibilityIssues([]);
      }
    };

    checkCompatibilityAsync();
  }, [selectedOptions, onCheckCompatibility, storeCheckCompatibility]);

  // Handle option toggle
  const handleOptionToggle = useCallback(async (option: ConfigurableProductSchema, categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category || !option.databaseId) return;

    const categoryOptions = selectedOptions[categoryId] || [];
    const isSelected = categoryOptions.some(selected => selected.databaseId === option.databaseId);
    
    if (isSelected) {
      // Remove option
      removeOption(option.databaseId, categoryId);
    } else {
      // Add option
      if (category.multiSelect) {
        // Check max selections
        if (category.maxSelections && categoryOptions.length >= category.maxSelections) {
          return; // Don't add if at max
        }
        addOption(option, categoryId);
      } else {
        // Single select - clear category first, then add
        clearCategory(categoryId);
        addOption(option, categoryId);
      }
    }
  }, [categories, selectedOptions, addOption, removeOption, clearCategory]);

  // Handle category loading
  const handleCategorySelect = useCallback(async (categoryId: string) => {
    setCurrentCategoryId(categoryId);
    
    const category = categories.find(c => c.id === categoryId);
    if (!category || category.loadingState === 'loaded' || !onFetchCategoryOptions) {
      return;
    }

    // Update category loading state
    const updatedCategories = categories.map(c => 
      c.id === categoryId 
        ? { ...c, loadingState: 'loading' as const }
        : c
    );
    setCategories(updatedCategories);

    try {
      const options = await onFetchCategoryOptions(categoryId);
      
      const loadedCategories = categories.map(c => 
        c.id === categoryId 
          ? { 
              ...c, 
              options, 
              loadingState: 'loaded' as const,
              progressCount: {
                selected: selectedOptions[categoryId]?.length || 0,
                total: options.length
              }
            }
          : c
      );
      setCategories(loadedCategories);
    } catch (error) {      
      const errorCategories = categories.map(c => 
        c.id === categoryId 
          ? { ...c, loadingState: 'error' as const }
          : c
      );
      setCategories(errorCategories);
    }
  }, [categories, selectedOptions, onFetchCategoryOptions]);

  // Handle add to cart
  const handleAddToCart = useCallback(async () => {
    if (!onAddToCart) return;
    
    setAddToCartLoading(true);
    try {
      const configuration = getConfigurationSummary();
      await onAddToCart(configuration);
    } catch (error) {
      // Handle error (show toast, etc.)
    } finally {
      setAddToCartLoading(false);
    }
  }, [onAddToCart, getConfigurationSummary]);

  // Handle save configuration
  const handleSaveConfiguration = useCallback(async (name: string, notes?: string) => {
    if (!onSaveConfiguration) return;
    
    setSaveModalLoading(true);
    setSaveModalError(undefined);
    
    try {
      const savedConfig = await onSaveConfiguration(name, notes);
      setShowSaveModal(false);
      return savedConfig;
    } catch (error) {
      setSaveModalError(error instanceof Error ? error.message : 'Failed to save configuration');
      throw error;
    } finally {
      setSaveModalLoading(false);
    }
  }, [onSaveConfiguration]);

  // Handle share configuration
  const handleShareConfiguration = useCallback(() => {
    if (!onShareConfiguration) return;
    
    const configuration = getConfigurationSummary();
    onShareConfiguration(configuration);
  }, [onShareConfiguration, getConfigurationSummary]);

  // Get current category
  const currentCategory = categories.find(c => c.id === currentCategoryId);
  const currentCategoryOptions = selectedOptions[currentCategoryId] || [];

  if (loading) {
    return (
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-lg mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="lg:col-span-2">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="lg:col-span-1">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading configurator</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      {/* Model Hero Section */}
      <div className="mb-8">
        <ModelHero
          model={baseModel}
          selectedOptionsCount={isHydrated ? Object.values(selectedOptions).flat().length : 0}
          totalPrice={isHydrated ? getConfigurationSummary().totalPrice : parsePrice(baseModel.regularPrice || baseModel.price)}
          basePrice={isHydrated ? getConfigurationSummary().basePrice : parsePrice(baseModel.regularPrice || baseModel.price)}
          showFinancingBadge={isHydrated && financingOptions.length > 0}
          financingOption={isHydrated ? selectedFinancing : undefined}
        />
      </div>

      {/* Compatibility Alerts */}
      {isHydrated && compatibilityIssues.length > 0 && (
        <div className="mb-6">
          <CompatibilityAlert
            issues={compatibilityIssues}
            onResolve={(issue) => {
              // Handle auto-resolve
            }}
          />
        </div>
      )}

      {/* Main Configurator Layout */}
      <div className="configurator-layout grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Section: Configuration Options Sidebar */}
        <aside className="configurator-sidebar configurator-section-left lg:col-span-3">
          <ConfiguratorSidebar
            categories={categories.map(c => ({
              ...c,
              progressCount: {
                selected: isHydrated ? (selectedOptions[c.id]?.length || 0) : 0,
                total: c.options?.length || 0
              }
            }))}
            currentCategoryId={currentCategoryId}
            onCategorySelect={handleCategorySelect}
            selectedOptions={isHydrated ? selectedOptions : {}}
          />
        </aside>

        {/* Center Section: Option Cards Display */}
        <main className="configurator-content configurator-section-center lg:col-span-6">
          {showSummary ? (
            isHydrated ? (
              <ConfigurationSummary
                onEditConfiguration={() => setShowSummary(false)}
                onSaveConfiguration={() => setShowSaveModal(true)}
                onShareConfiguration={handleShareConfiguration}
                onAddToCart={handleAddToCart}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            )
          ) : currentCategory ? (
            <CategoryGroup
              category={currentCategory}
              selectedOptions={currentCategoryOptions}
              compatibilityIssues={compatibilityIssues
                .filter(issue => 
                  issue.affectedOptions.some(optionId => 
                    currentCategoryOptions.some(option => option.databaseId === optionId)
                  )
                )
              }
              onToggleOption={(option) => handleOptionToggle(option, currentCategoryId)}
              onViewDetails={(option) => {
                // Navigate to product detail page for the option
                if (option.slug) {
                  router.push(`/product/${option.slug}`);
                } else {
                  console.warn('Option has no slug for navigation:', option);
                }
              }}
            />
          ) : (
            <div className="option-cards-empty bg-white rounded-lg shadow-md p-8 text-center">
              <h2 className="option-cards-title text-xl font-semibold text-gray-900 mb-2">Select a Category</h2>
              <p className="option-cards-subtitle text-gray-600">Choose a category from the sidebar to start configuring your mobility solution.</p>
            </div>
          )}
        </main>

        {/* Right Section: Configuration Summary Panel */}
        <aside className="configurator-summary configurator-section-right lg:col-span-3">
          <ClientOnly fallback={
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          }>
            <SummaryPanel
              configuration={getConfigurationSummaryForPanel()}
              onAddToCart={handleAddToCart}
            />
          </ClientOnly>
          
          {/* Action Buttons */}
          <div className="mt-4 space-y-3">
            <button
              onClick={() => setShowSummary(!showSummary)}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              {showSummary ? 'Continue Configuring' : 'Review Configuration'}
            </button>
          </div>
        </aside>
      </div>

      {/* Save Configuration Modal */}
      <SaveConfigurationModal
        isOpen={showSaveModal}
        loading={saveModalLoading}
        error={saveModalError}
        onSave={handleSaveConfiguration}
        onClose={() => {
          setShowSaveModal(false);
          setSaveModalError(undefined);
        }}
      />
    </div>
  );
};

export default ModelConfigurator;