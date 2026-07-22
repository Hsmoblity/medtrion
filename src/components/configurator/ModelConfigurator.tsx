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
import { getOptionPrice } from '../../lib/utils/price-calculations';
import ClientOnly from '../ClientOnly';
// Phase 3: Advanced Features imports
import ConfiguratorErrorBoundary from './ConfiguratorErrorBoundary';
import ConfigurationValidator from './ConfigurationValidator';
import ConfiguratorPreferences from './ConfiguratorPreferences';
import { useAccessibility } from '../../hooks/useAccessibility';
import { usePerformanceOptimization } from '../../hooks/usePerformanceOptimization';

import { useConfiguratorStore } from '../../stores/configuratorStore';
import ModelHero from './ModelHero';
import ConfiguratorSidebar from './ConfiguratorSidebar';
import CategoryGroup from './CategoryGroup';
import SummaryPanel from './SummaryPanel';
import CompatibilityAlert from './CompatibilityAlert';
import ConfigurationSummary from './ConfigurationSummary';
import SaveConfigurationModal from './SaveConfigurationModal';
import OptionVariationPopup from './OptionVariationPopup';

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
  
  // Phase 3: Advanced Features - Accessibility and Performance optimization
  const { 
    reducedMotion, 
    highContrast, 
    keyboardNavigation, 
    announceToScreenReader, 
    focusManagement 
  } = useAccessibility();
  
  const { 
    lazyLoader, 
    virtualizer, 
    debounce, 
    throttle, 
    memoize 
  } = usePerformanceOptimization();
  
  // Local state - ONLY for UI interactions
  const [currentCategoryId, setCurrentCategoryId] = useState<string>('');
  const [selectedFinancing, setSelectedFinancing] = useState<FinancingOption | undefined>();
  const [showSummary, setShowSummary] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveModalLoading, setSaveModalLoading] = useState(false);
  const [saveModalError, setSaveModalError] = useState<string | undefined>();
  const [addToCartLoading, setAddToCartLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Phase 3: Advanced Features State
  const [showPreferences, setShowPreferences] = useState(false);
  const [showValidationPanel, setShowValidationPanel] = useState(false);
  const [validationMode, setValidationMode] = useState<'strict' | 'lenient' | 'advisory'>('lenient');
  
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
    checkCompatibility: storeCheckCompatibility,
    // Enhanced User Flow State
    selectedOptionsWithVariations,
    configurationSummary,
    updateConfigurationSummary,
    openOptionPopup,
    closeOptionPopup,
    addToConfiguration,
    removeFromConfiguration,
    // Enhanced Initialization Flow
    loadMainProduct,
    loadOptionProducts
  } = useConfiguratorStore();

  // Initialize with Enhanced User Flow - Step 1: Load Main Product
  useEffect(() => {
    if (baseModel) {
      console.log(`🔧 DEBUG: Loading main product: ${baseModel.name} (${baseModel.slug})`);
      loadMainProduct(baseModel);
    }
  }, [baseModel, loadMainProduct]);

  // Initialize categories from props - CRITICAL FIX for auto-add bug
  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) {
      console.log(`🔧 DEBUG: Initializing store categories from props:`, initialCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        optionsCount: cat.options?.length || 0,
        options: cat.options?.map(opt => ({ name: opt.name, id: opt.id })) || []
      })));
      setCategories(initialCategories);
    }
  }, [initialCategories, setCategories]);

  // Debug categories prop
  useEffect(() => {
    console.log(`🔧 DEBUG: Categories prop received:`, categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      optionsCount: cat.options?.length || 0,
      options: cat.options?.map(opt => ({ name: opt.name, id: opt.id })) || []
    })));
  }, [categories]);

  // Initialize with Enhanced User Flow - Step 2: Load Option Products (if available)
  useEffect(() => {
    if (categories.length > 0) {
      const optionIds: number[] = [];
      categories.forEach(category => {
        if (category.options) {
          category.options.forEach(option => {
            if (option.databaseId) {
              optionIds.push(option.databaseId);
            }
          });
        }
      });
      
      if (optionIds.length > 0) {
        loadOptionProducts(optionIds).catch(error => {
          console.error('Failed to load option products:', error);
        });
      }
    }
  }, [categories, loadOptionProducts]);

  // Initialize edit mode configuration - handle client-side cart access
  useEffect(() => {
    if (isEditMode && cartItemId && isHydrated) {
      console.log('🔧 Initializing edit mode with cart item ID:', cartItemId);
      console.log('🔧 Available categories:', categories.map(c => ({ 
        name: c.name, 
        id: c.id,
        optionCount: c.options?.length || 0,
        loadingState: c.loadingState 
      })));
      
      // Enhanced: First try to load options for categories that don't have them yet
      if (onFetchCategoryOptions && categories.length > 0) {
        console.log('🔧 Checking categories for missing options...');
        
        const categoriesNeedingOptions = categories.filter(cat => !cat.options || cat.options.length === 0);
        if (categoriesNeedingOptions.length > 0) {
          console.log(`🔧 Loading options for ${categoriesNeedingOptions.length} categories...`, categoriesNeedingOptions.map(c => c.name));
          
          // Load options for all categories that need them
          Promise.all(
            categoriesNeedingOptions.map(category => 
              onFetchCategoryOptions(category.id).catch(error => {
                console.error(`Failed to load options for category ${category.name}:`, error);
                return [];
              })
            )
          ).then(() => {
            console.log('🔧 Finished loading category options, proceeding with cart item restoration...');
            // After loading options, try to restore cart configuration
            setTimeout(() => restoreCartConfiguration(), 100);
          });
          
          // If we're loading options, don't proceed yet
          return;
        }
      }
      
      // If categories already have options or we can't load them, proceed immediately
      restoreCartConfiguration();
    } else if (isEditMode && !isHydrated) {
      console.log('🔧 Edit mode detected but not yet hydrated, waiting...');
    } else if (isEditMode && !cartItemId) {
      console.warn('🔧 Edit mode detected but no cartItemId provided');
    } else if (isEditMode && cartItemId && !isHydrated) {
      console.log('🔧 Edit mode with cartItemId but not hydrated yet, waiting...');
    }

    // Function to restore cart configuration
    function restoreCartConfiguration() {
      console.log('🔧 Starting cart configuration restoration...');
      
      // Check if categories have their options loaded
      const categoriesWithOptions = categories.filter(cat => cat.options && cat.options.length > 0);
      if (categoriesWithOptions.length === 0) {
        console.warn('🔧 No categories with options available for restoration');
        
        // If still no options and we have onFetchCategoryOptions, try one more time
        if (onFetchCategoryOptions && categories.length > 0) {
          console.log('🔧 Final attempt to load category options...');
          categories.forEach(category => {
            if (!category.options || category.options.length === 0) {
              console.log(`🔧 Final loading attempt for category: ${category.name}`);
              onFetchCategoryOptions(category.id).catch(error => {
                console.error(`Failed final load for category ${category.name}:`, error);
              });
            }
          });
        }
        return;
      }
      
      // Import cart store dynamically to avoid SSR issues
      import('stores/cartStore').then(({ useCartStore }) => {
        const cartStore = useCartStore.getState();
        const cartItem = cartStore.findCartItem(cartItemId!);
        
        if (cartItem) {
          console.log('🔧 Found cart item for edit mode:', cartItem);
          
          const cartItemOptions = cartItem.options || [];
          console.log('🔧 Processing cart item options:', cartItemOptions);
          
          if (cartItemOptions.length === 0) {
            console.log('🔧 No options to restore from cart item');
            return;
          }
          
          let optionsRestored = 0;
          
          // Process each cart option and try to match it with configurator categories
          cartItemOptions.forEach((option: any, index: number) => {
            console.log(`🔧 Processing cart option ${index + 1}/${cartItemOptions.length}:`, option);
            
            // Find the category for this option - try multiple matching strategies
            const category = categories.find(cat => {
              if (!cat.options || cat.options.length === 0) return false;
              
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
                
                // Strategy 5: Match by partial name (for cases where cart has simplified names)
                if (option.name && opt.name) {
                  const cartName = option.name.toLowerCase().trim();
                  const optName = opt.name.toLowerCase().trim();
                  if (cartName.includes(optName) || optName.includes(cartName)) return true;
                }
                
                return false;
              });
            });
            
            if (category) {
              console.log(`🔧 Found category "${category.name}" for option "${option.name}"`);
              
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
                
                // Strategy 5: Match by partial name
                if (option.name && opt.name) {
                  const cartName = option.name.toLowerCase().trim();
                  const optName = opt.name.toLowerCase().trim();
                  if (cartName.includes(optName) || optName.includes(cartName)) return true;
                }
                
                return false;
              });
              
              if (actualOption) {
                console.log(`🔧 ✅ Restoring option: "${actualOption.name}" to category "${category.name}"`);
                addOption(actualOption, category.id);
                optionsRestored++;
              } else {
                console.warn(`🔧 ❌ Option not found in category "${category.name}" despite category match:`, option);
                console.log('🔧 Available options in category:', category.options?.map(o => ({ 
                  name: o.name, id: o.id, slug: o.slug, databaseId: o.databaseId 
                })));
              }
            } else {
              console.warn(`🔧 ❌ No category found for cart option: "${option.name}"`);
              console.log('🔧 Available categories:', categories.map(c => ({ 
                name: c.name, 
                optionCount: c.options?.length || 0,
                sampleOptions: c.options?.slice(0, 2).map(o => ({ name: o.name, id: o.id, slug: o.slug, databaseId: o.databaseId }))
              })));
            }
          });
          
          console.log(`🔧 ✅ Cart configuration restoration complete: ${optionsRestored}/${cartItemOptions.length} options restored`);
          
          if (optionsRestored === 0 && cartItemOptions.length > 0) {
            console.error('🔧 ❌ No options were restored despite having cart options. This indicates a data matching issue.');
          }
          
        } else {
          console.warn('🔧 ❌ Cart item not found for edit mode:', cartItemId);
        }
      }).catch(error => {
        console.error('🔧 ❌ Failed to load cart store for edit mode:', error);
      });
    }
  }, [isEditMode, cartItemId, categories.length, addOption, isHydrated, categories, onFetchCategoryOptions]);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Calculate configuration summary
  const getConfigurationSummary = useCallback((): ConfigurationSummaryData => {
    const allSelectedOptions = isHydrated ? Object.values(selectedOptions).flat() : [];
    
    // Debug logging for price calculation bug
    console.log('🔧 Price Calculation Debug:', {
      isHydrated,
      selectedOptionsKeys: Object.keys(selectedOptions),
      selectedOptionsCount: Object.values(selectedOptions).flat().length,
      selectedOptionsByCategory: Object.keys(selectedOptions).map(categoryId => ({
        categoryId,
        count: selectedOptions[categoryId]?.length || 0,
        options: selectedOptions[categoryId]?.map(opt => ({ id: opt.id, name: opt.name, price: opt.price }))
      })),
      allSelectedOptions: allSelectedOptions.map(opt => ({ id: opt.id, name: opt.name, price: opt.price }))
    });
    
    // Use robust price parsing for base price with enhanced variable product support
    let basePrice = parsePrice(baseModel.regularPrice || baseModel.price);
    
    // For variable products or products with $0 price, try to extract from description or use minimum variation price
    if (basePrice === 0 && baseModel.variations && baseModel.variations.length > 0) {
      const variationPrices = baseModel.variations
        .map((v: any) => parsePrice(v.price))
        .filter((p: number) => p > 0);
      
      if (variationPrices.length > 0) {
        basePrice = Math.min(...variationPrices);
        console.log(`🔧 Using minimum variation price ${basePrice} for base product ${baseModel.name}`);
      }
    }
    
    const optionsPrice = allSelectedOptions.reduce((sum, option) => {
      // Use getOptionPrice utility to ensure consistent price calculation
      return sum + getOptionPrice(option);
    }, 0);
    
    // Calculate installation cost (simplified)
    const installationPrice = allSelectedOptions.some(option => option.installationRequired) ? 500 : 0;
    
    // Calculate subtotal (no shipping or tax in configurator)
    const subtotal = basePrice + optionsPrice + installationPrice;
    
    // No shipping or tax calculation in configurator - these are calculated on payment page
    const shippingPrice = 0;
    const taxAmount = 0;
    
    const totalPrice = subtotal;

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

  // Real-time state synchronization for enhanced user flow
  useEffect(() => {
    console.log(`🔧 DEBUG: ModelConfigurator useEffect triggered - selectedOptionsWithVariations changed:`, {
      count: selectedOptionsWithVariations.length,
      options: selectedOptionsWithVariations.map(so => ({
        optionName: so.option.name,
        totalPrice: so.totalPrice,
        variationsCount: so.selectedVariations.length
      }))
    });
    updateConfigurationSummary();
  }, [selectedOptionsWithVariations, updateConfigurationSummary]);

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

  // Handle option toggle with Phase 3 enhancements
  const handleOptionToggle = useCallback(async (option: ConfigurableProductSchema, categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category || !option.databaseId) return;

    // Phase 3: Debounced option selection for performance
    const debouncedToggle = debounce(async () => {
      const categoryOptions = selectedOptions[categoryId] || [];
      const isSelected = categoryOptions.some(selected => selected.databaseId === option.databaseId);
      
      if (isSelected) {
        // Remove option
        if (option.databaseId) {
          removeOption(option.databaseId, categoryId);
          
          // Phase 3: Accessibility announcement
          announceToScreenReader(`Removed ${option.name} from ${category.name}`, 'polite');
        }
      } else {
        // Add option
        if (category.multiSelect) {
          // Check max selections
          if (category.maxSelections && categoryOptions.length >= category.maxSelections) {
            // Phase 3: Accessibility announcement for limit reached
            announceToScreenReader(
              `Maximum ${category.maxSelections} selections allowed for ${category.name}`, 
              'assertive'
            );
            return; // Don't add if at max
          }
          addOption(option, categoryId);
        } else {
          // Single select - clear category first, then add
          clearCategory(categoryId);
          addOption(option, categoryId);
        }
        
        // Phase 3: Accessibility announcement
        announceToScreenReader(`Added ${option.name} to ${category.name}`, 'polite');
      }
    }, 100);

    await debouncedToggle();
  }, [categories, selectedOptions, addOption, removeOption, clearCategory, debounce, announceToScreenReader]);

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

  // Handle add to cart with Phase 3 enhancements
  const handleAddToCart = useCallback(async () => {
    if (!onAddToCart) return;
    
    // Phase 3: Throttled add to cart to prevent multiple rapid submissions
    const throttledAddToCart = throttle(async () => {
      setAddToCartLoading(true);
      
      try {
        const configuration = getConfigurationSummary();
        await onAddToCart(configuration);
        
        // Phase 3: Accessibility announcement for success
        announceToScreenReader(
          `Successfully added ${baseModel?.name || 'configuration'} to cart`, 
          'polite'
        );
        
        // Phase 3: Focus management - return to cart button or next logical element
        if (keyboardNavigation) {
          focusManagement.skipToContent();
        }
      } catch (error) {
        // Phase 3: Enhanced error handling with accessibility
        const errorMessage = error instanceof Error ? error.message : 'Failed to add to cart';
        announceToScreenReader(`Error: ${errorMessage}`, 'assertive');
        
        // Handle error (show toast, etc.)
        console.error('Add to cart error:', error);
      } finally {
        setAddToCartLoading(false);
      }
    }, 1000);

    await throttledAddToCart();
  }, [onAddToCart, getConfigurationSummary, throttle, announceToScreenReader, keyboardNavigation, focusManagement, baseModel]);

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
  const currentCategorySelectedOptions = selectedOptions[currentCategoryId] || [];

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
    <ConfiguratorErrorBoundary>
      <div 
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-20 pb-8 ${className}`}
        // Phase 3: Enhanced accessibility
        data-reduced-motion={reducedMotion}
        data-high-contrast={highContrast}
        data-keyboard-navigation={keyboardNavigation}
      >
      {/* Model Hero Section */}
      <div className="mb-8">
        <ModelHero
          model={baseModel}
          selectedOptionsCount={isHydrated ? selectedOptionsWithVariations.length : 0}
          totalPrice={isHydrated ? configurationSummary?.totalPrice : parsePrice(baseModel.regularPrice || baseModel.price)}
          basePrice={isHydrated ? configurationSummary?.basePrice : parsePrice(baseModel.regularPrice || baseModel.price)}
          showFinancingBadge={isHydrated && financingOptions.length > 0}
          financingOption={isHydrated ? selectedFinancing : undefined}
          // Enhanced User Flow Props
          configurationSummary={configurationSummary}
          showProgressIndicator={true}
          showRealTimePrice={true}
          onConfigurationClick={() => setShowSummary(true)}
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

      {/* Phase 3: Advanced Configuration Validation - Hidden */}
      {false && isHydrated && (
        <ConfigurationValidator
          selectedOptions={selectedOptions}
          categories={categories}
          onValidationChange={(results) => {
            // Handle validation results
            const hasErrors = results.some(r => !r.isValid && r.rule.severity === 'error');
            setShowValidationPanel(hasErrors || showValidationPanel);
          }}
          onAutoResolve={(action) => {
            if (action) {
              // Handle auto-resolve actions
              announceToScreenReader('Configuration auto-resolved', 'polite');
            }
          }}
          showValidationPanel={showValidationPanel}
          validationMode={validationMode}
        />
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
                // Enhanced User Flow Props
                summary={configurationSummary}
                selectedOptions={selectedOptionsWithVariations}
                onOptionRemove={removeFromConfiguration}
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
              selectedOptions={currentCategorySelectedOptions}
              compatibilityIssues={compatibilityIssues
                .filter(issue => 
                  issue.affectedOptions.some(optionId => 
                    currentCategorySelectedOptions.some(option => option.databaseId === optionId)
                  )
                )
              }
              isEditMode={isEditMode}
              onToggleOption={(option) => handleOptionToggle(option, currentCategoryId)}
              onViewDetails={(option) => {
                // Navigate to product detail page for the option
                if (option.slug) {
                  router.push(`/product/${option.slug}`);
                } else {
                  console.warn('Option has no slug for navigation:', option);
                }
              }}
              // Enhanced User Flow Props
              showVariationCount={true}
              showRealTimePrice={true}
              onOptionSelect={(option) => {
                if (option.type === 'VARIABLE' && option.variations && option.variations.length > 0) {
                  openOptionPopup(option);
                } else {
                  handleOptionToggle(option, currentCategoryId);
                }
              }}
              selectedOptionsWithVariations={selectedOptionsWithVariations}
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
          
          {/* Action Buttons with Phase 3 Enhancements */}
          <div className="mt-4 space-y-3">
            {/* Continue Configuration button hidden */}
            {false && (
            <button
              onClick={() => {
                setShowSummary(!showSummary);
                // Phase 3: Accessibility announcement
                announceToScreenReader(
                  showSummary 
                    ? 'Returned to configuration options' 
                    : 'Viewing configuration summary', 
                  'polite'
                );
              }}
              className={`w-full font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ${
                highContrast 
                  ? 'bg-black text-white border-2 border-white hover:bg-gray-800 focus:ring-white' 
                  : 'bg-[#f7a236] hover:bg-[#3fa2a3] text-white focus:ring-[#3fa2a3] rounded-[35px] px-6 py-3'
              }`}
              aria-label={showSummary ? 'Continue configuring options' : 'Review current configuration'}
            >
              {showSummary ? 'Continue Configuring' : 'Review Configuration'}
            </button>
            )}
            
            {/* Phase 3: Additional Action Buttons */}
            {/* Preferences button hidden */}
            {false && (
            <button
              onClick={() => setShowPreferences(true)}
              className={`w-full font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ${
                highContrast 
                  ? 'bg-gray-700 text-white border border-gray-500 hover:bg-gray-600 focus:ring-gray-400' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-blue-500'
              }`}
              aria-label="Open configurator preferences"
            >
              ⚙️ Preferences
            </button>
            )}
            
            {/* Validation button hidden */}
            {false && (
            <button
              onClick={() => setShowValidationPanel(!showValidationPanel)}
              className={`w-full font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ${
                highContrast 
                  ? 'bg-gray-700 text-white border border-gray-500 hover:bg-gray-600 focus:ring-gray-400' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-blue-500'
              }`}
              aria-label={showValidationPanel ? 'Hide validation panel' : 'Show validation panel'}
            >
              🔍 {showValidationPanel ? 'Hide' : 'Show'} Validation
            </button>
            )}
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

      {/* Unified Option Variation Popup */}
      <OptionVariationPopup useStore={true} />

      {/* Phase 3: Configurator Preferences Modal */}
      <ConfiguratorPreferences
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
        onPreferencesUpdate={(preferences) => {
          // Handle preferences update
          announceToScreenReader('Preferences updated successfully', 'polite');
        }}
      />
      </div>
    </ConfiguratorErrorBoundary>
  );
};

export default ModelConfigurator;