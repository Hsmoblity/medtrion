import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { 
  ConfigurableProductSchema, 
  ConfiguratorCategory, 
  CompatibilityIssue as ConfiguratorCompatibilityIssue,
  ConfigurationSummaryData,
  FinancingOption,
  InsuranceEstimate,
  SavedConfigurationExtended,
  GraphQLResponse 
} from '../../lib/interfaces/configurator';
import ClientOnly from '../ClientOnly';

// Local interface for CompatibilityAlert component compatibility
interface CompatibilityAlertIssue {
  rule: {
    id: string;
    name: string;
    description: string;
    severity: 'ERROR' | 'WARNING' | 'INFO';
    message: string;
  };
  affectedOptions: number[];
  autoResolvable: boolean;
}
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
  onCheckCompatibility?: (selectedOptions: ConfigurableProductSchema[]) => Promise<ConfiguratorCompatibilityIssue[]>;
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
  onAddToCart,
  onSaveConfiguration,
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
  
  // Local state
  const [categories, setCategories] = useState<ConfiguratorCategory[]>(initialCategories);
  const [currentCategoryId, setCurrentCategoryId] = useState<string>(initialCategories[0]?.id || '');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, ConfigurableProductSchema[]>>({});
  const [compatibilityIssues, setCompatibilityIssues] = useState<CompatibilityAlertIssue[]>([]);
  const [selectedFinancing, setSelectedFinancing] = useState<FinancingOption | undefined>();
  const [showSummary, setShowSummary] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveModalLoading, setSaveModalLoading] = useState(false);
  const [saveModalError, setSaveModalError] = useState<string | undefined>();
  const [addToCartLoading, setAddToCartLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Zustand store
  const {
    model,
    setModel,
    summary,
    calculateSummary,
    checkCompatibility: storeCheckCompatibility
  } = useConfiguratorStore();

  // Initialize base model
  useEffect(() => {
    setModel(baseModel);
  }, [baseModel, setModel]);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Calculate configuration summary
  const getConfigurationSummary = useCallback((): ConfigurationSummaryData => {
    const allSelectedOptions = isHydrated ? Object.values(selectedOptions).flat() : [];
    const basePrice = parseFloat(baseModel.regularPrice || '0');
    const optionsPrice = allSelectedOptions.reduce((sum, option) => {
      return sum + parseFloat(option.regularPrice || '0');
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

  // Check compatibility when selections change
  useEffect(() => {
    const checkCompatibilityAsync = async () => {
      const allSelectedOptions = Object.values(selectedOptions).flat();
      
      if (allSelectedOptions.length === 0) {
        setCompatibilityIssues([]);
        return;
      }

      try {
        let issues: ConfiguratorCompatibilityIssue[] = [];
        
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
        const transformedIssues = issues.map(issue => ({
          rule: {
            id: issue.rule.id,
            name: issue.rule.name,
            description: issue.rule.message || 'No description available',
            severity: issue.rule.severity,
            message: issue.rule.message || 'No message available'
          },
          affectedOptions: issue.affectedOptions,
          autoResolvable: issue.autoResolvable
        }));
        
        setCompatibilityIssues(transformedIssues);
      } catch (error) {
        setCompatibilityIssues([]);
      }
    };

    checkCompatibilityAsync();
  }, [selectedOptions, onCheckCompatibility, storeCheckCompatibility]);

  // Handle option toggle
  const handleOptionToggle = useCallback(async (option: ConfigurableProductSchema, categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    setSelectedOptions(prev => {
      const categoryOptions = prev[categoryId] || [];
      const isSelected = categoryOptions.some(selected => selected.databaseId === option.databaseId);
      
      if (isSelected) {
        // Remove option
        return {
          ...prev,
          [categoryId]: categoryOptions.filter(selected => selected.databaseId !== option.databaseId)
        };
      } else {
        // Add option
        if (category.multiSelect) {
          // Check max selections
          if (category.maxSelections && categoryOptions.length >= category.maxSelections) {
            return prev; // Don't add if at max
          }
          return {
            ...prev,
            [categoryId]: [...categoryOptions, option]
          };
        } else {
          // Single select - replace existing
          return {
            ...prev,
            [categoryId]: [option]
          };
        }
      }
    });
  }, [categories]);

  // Handle category loading
  const handleCategorySelect = useCallback(async (categoryId: string) => {
    setCurrentCategoryId(categoryId);
    
    const category = categories.find(c => c.id === categoryId);
    if (!category || category.loadingState === 'loaded' || !onFetchCategoryOptions) {
      return;
    }

    // Update category loading state
    setCategories(prev => prev.map(c => 
      c.id === categoryId 
        ? { ...c, loadingState: 'loading' as const }
        : c
    ));

    try {
      const options = await onFetchCategoryOptions(categoryId);
      
      setCategories(prev => prev.map(c => 
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
      ));
    } catch (error) {      
      setCategories(prev => prev.map(c => 
        c.id === categoryId 
          ? { ...c, loadingState: 'error' as const }
          : c
      ));
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

  // Helper function to convert CompatibilityAlertIssue back to ConfiguratorCompatibilityIssue
  const convertToConfiguratorIssue = (alertIssue: CompatibilityAlertIssue): ConfiguratorCompatibilityIssue => ({
    rule: {
      id: alertIssue.rule.id,
      name: alertIssue.rule.name,
      type: 'CONFLICTING' as const, // Default type since we don't have it
      message: alertIssue.rule.message,
      severity: alertIssue.rule.severity
    },
    affectedOptions: alertIssue.affectedOptions,
    autoResolvable: alertIssue.autoResolvable
  });

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
          totalPrice={isHydrated ? getConfigurationSummary().totalPrice : parseFloat(baseModel.regularPrice || '0')}
          basePrice={isHydrated ? getConfigurationSummary().basePrice : parseFloat(baseModel.regularPrice || '0')}
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
      <div className="configurator-layout grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Section: Configuration Options Sidebar */}
        <aside className="configurator-sidebar configurator-section-left lg:col-span-1">
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
          />
        </aside>

        {/* Center Section: Option Cards Display */}
        <main className="configurator-content configurator-section-center lg:col-span-2">
          {showSummary ? (
            isHydrated ? (
              <ConfigurationSummary
                configuration={getConfigurationSummary()}
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
                .map(convertToConfiguratorIssue)
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
        <aside className="configurator-summary configurator-section-right lg:col-span-1">
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
              configuration={getConfigurationSummary()}
              selectedFinancing={selectedFinancing}
              sticky={true}
              onFinancingChange={setSelectedFinancing}
              onAddToCart={handleAddToCart}
              onSaveConfiguration={() => setShowSaveModal(true)}
              onShareConfiguration={handleShareConfiguration}
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