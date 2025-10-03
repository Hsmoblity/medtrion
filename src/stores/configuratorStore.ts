import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ConfigurableProductSchema,
  ConfiguratorCategory,
  CompatibilityIssue,
  ConfigurationSummary,
  SavedConfiguration,
  FinancingOption,
  InsuranceEstimate,
  // Enhanced User Flow Interfaces
  Variation,
  SelectedOption,
  OptionPopupState,
  ConfigurationSummaryData
} from '../lib/interfaces/configurator';
import { configuratorAPI } from '../lib/graphql/configurator';
import { 
  calculateOptionPrice, 
  calculateConfigurationTotal, 
  calculatePricePreview,
  calculateFinancingOptions as calculateFinancingOptionsUtil,
  calculateInsuranceEstimate as calculateInsuranceEstimateUtil
} from '../lib/utils/price-calculations';

interface ConfiguratorStore {
  // State
  model: ConfigurableProductSchema | null;
  categories: ConfiguratorCategory[];
  selectedOptions: Record<string, ConfigurableProductSchema[]>;
  summary: ConfigurationSummary;
  previousSummary: ConfigurationSummary | null;
  compatibilityIssues: CompatibilityIssue[];
  loading: boolean;
  error: string | null;
  savedConfigurations: SavedConfiguration[];
  
  // Enhanced User Flow State
  selectedOptionsWithVariations: SelectedOption[];
  optionPopup: OptionPopupState;
  configurationSummary: ConfigurationSummaryData;
  optionProducts: ConfigurableProductSchema[];

  // Actions
  setModel: (model: ConfigurableProductSchema) => void;
  setCategories: (categories: ConfiguratorCategory[]) => void;
  setCompatibilityIssues: (issues: CompatibilityIssue[]) => void;
  addOption: (option: ConfigurableProductSchema, categoryId: string) => void;
  updateOption: (option: ConfigurableProductSchema, categoryId: string) => void;
  removeOption: (optionId: number, categoryId: string) => void;
  clearCategory: (categoryId: string) => void;
  checkCompatibility: () => void;
  calculateSummary: () => void;
  updateProgressCount: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearConfiguration: () => void;
  clearAllState: () => void;
  saveConfiguration: (name: string, notes?: string) => void;
  loadConfiguration: (configId: string) => void;
  deleteConfiguration: (configId: string) => void;

  // GraphQL Integration Actions
  loadModelWithCategories: (slug: string) => Promise<void>;
  fetchCategoryOptions: (categoryId: string) => Promise<ConfigurableProductSchema[]>;
  checkCompatibilityLive: () => Promise<void>;
  addConfigurationToCart: () => Promise<void>;
  saveConfigurationLive: (name: string, notes?: string) => Promise<SavedConfiguration>;
  updateCartItemConfiguration: (cartItemId: string) => Promise<void>;
  
  // Enhanced User Flow Actions
  loadMainProduct: (product: ConfigurableProductSchema) => void;
  loadOptionProducts: (optionIds: number[]) => Promise<void>;
  openOptionPopup: (option: ConfigurableProductSchema) => void;
  closeOptionPopup: () => void;
  selectVariation: (variation: Variation) => void;
  deselectVariation: (variation: Variation) => void;
  addToConfiguration: (option: ConfigurableProductSchema, variations: Variation[], calculatedPrice?: number) => void;
  removeFromConfiguration: (optionId: string) => void;
  updateConfigurationSummary: () => void;
  calculateTotalPrice: () => number;
  calculateOptionPrice: (option: ConfigurableProductSchema, variations: Variation[]) => number;

  // Computed getters
  getSelectedOptionsForCategory: (categoryId: string) => ConfigurableProductSchema[];
  isOptionSelected: (optionId: number, categoryId: string) => boolean;
  getOptionCompatibilityIssues: (optionId: number) => CompatibilityIssue[];
  getTotalSelectedOptions: () => number;
  hasCompatibilityErrors: () => boolean;
}

// Default summary state
const defaultSummary: ConfigurationSummary = {
  basePrice: 0,
  optionsTotal: 0,
  installationCost: 0,
  shippingCost: 0,
  taxAmount: 0,
  grandTotal: 0,
  estimatedDelivery: '2-3 weeks',
  financingOptions: [],
  insuranceEstimate: undefined
};

// Utility functions
const calculateFinancingOptions = (total: number): FinancingOption[] => {
  if (total === 0) return [];
  
  return [
    {
      id: 'plan-12',
      name: '12-Month Plan',
      monthlyPayment: Math.round((total * 1.05) / 12 * 100) / 100,
      termMonths: 12,
      interestRate: 0.05,
      downPayment: 0,
      totalCost: Math.round(total * 1.05 * 100) / 100
    },
    {
      id: 'plan-24',
      name: '24-Month Plan',
      monthlyPayment: Math.round((total * 1.08) / 24 * 100) / 100,
      termMonths: 24,
      interestRate: 0.08,
      downPayment: 0,
      totalCost: Math.round(total * 1.08 * 100) / 100
    },
    {
      id: 'plan-60',
      name: '60-Month Plan',
      monthlyPayment: Math.round((total * 1.12) / 60 * 100) / 100,
      termMonths: 60,
      interestRate: 0.12,
      downPayment: Math.round(total * 0.1 * 100) / 100,
      totalCost: Math.round(total * 1.12 * 100) / 100
    }
  ];
};

const calculateInsuranceEstimate = (total: number): InsuranceEstimate => {
  return {
    estimatedCoverage: Math.round(total * 0.8 * 100) / 100,
    outOfPocketCost: Math.round(total * 0.2 * 100) / 100,
    coverageTypes: ['Medicare', 'Private Insurance'],
    requiresPreApproval: total > 3000
  };
};

// Import conversion utilities and types
import { 
  configurationToCartProduct, 
  cartProductToConfiguration,
  Configuration
} from '../utils/conversionUtils';
import { CartProduct } from '../lib/interfaces/cart';

// Edit session state interface (aligned with standardized specs)
interface EditSessionState {
  isEditMode: boolean;
  sessionId: string | null;
  cartItemId: string | null;
  originalConfiguration: Configuration | null;
}

// Enhanced store interface with edit session support
interface EnhancedConfiguratorStore extends ConfiguratorStore {
  // Edit session state
  editSession: EditSessionState;
  
  // Edit session actions
  startEditSession: (sessionId: string, cartItemId: string, originalConfig: Configuration) => void;
  stopEditSession: () => void;
  loadFromEditSession: (sessionId: string) => void;
  updateCartItem: (cartItemId: string) => Promise<any>;
  toggleOption: (categoryId: string, option: ConfigurableProductSchema) => void;
  
  // Conversion utilities
  configurationToCartProduct: (config: Configuration) => Partial<CartProduct>;
  cartProductToConfiguration: (item: CartProduct) => Configuration;
}

export const useConfiguratorStore = create<EnhancedConfiguratorStore>()(
  persist(
    (set, get) => ({
      // Initial State
      model: null,
      categories: [],
      selectedOptions: {},
      summary: defaultSummary,
      previousSummary: null,
      compatibilityIssues: [],
      loading: false,
      error: null,
      savedConfigurations: [],
      
      // Enhanced User Flow State
      selectedOptionsWithVariations: [],
      optionPopup: {
        isOpen: false,
        selectedOption: null,
        selectedVariations: [],
        tempSelections: [],
        pricePreview: 0,
        isAlreadyInConfiguration: false,
        selectionType: 'radio'
      },
      configurationSummary: {
        baseModel: null as any,
        selectedOptions: [],
        totalPrice: 0,
        basePrice: 0,
        optionsPrice: 0,
        installationPrice: 0,
        shippingPrice: 0,
        taxAmount: 0,
        deliveryEstimate: '2-3 weeks'
      },
      optionProducts: [],
      
      // Edit session state
      editSession: {
        isEditMode: false,
        sessionId: null,
        cartItemId: null,
        originalConfiguration: null
      },

      // Actions
      setModel: (model) => {
        // Clear categories and selected options when switching products
        // to prevent wrong options from appearing
        console.log(`🔧 DEBUG: Setting new model: ${model.name} (${model.slug}) - clearing all state`);
        set({ 
          model,
          categories: [],
          selectedOptions: {},
          compatibilityIssues: [],
          optionProducts: [],
          selectedOptionsWithVariations: [],
          configurationSummary: {
            baseModel: null as any,
            selectedOptions: [],
            basePrice: 0,
            optionsPrice: 0,
            installationPrice: 0,
            shippingPrice: 0,
            taxAmount: 0,
            totalPrice: 0,
            deliveryEstimate: '2-3 weeks',
            financingOption: undefined,
            insuranceEstimate: undefined
          }
        });
        get().calculateSummary();
      },

      setCategories: (categories) => {
        // Validate categories to ensure they belong to the current model
        const { model } = get();
        if (!model) {
          console.warn('🔧 Cannot set categories without a model');
          return;
        }
        
        console.log(`🔧 DEBUG: Setting categories for model "${model.name}" (${model.slug}):`, categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          optionsCount: cat.options?.length || 0,
          options: cat.options?.map(opt => ({ 
            name: opt.name, 
            id: opt.id,
            productId: opt.productId,
            _related_options: opt._related_options
          })) || []
        })));
        
        // Filter out invalid categories
        const validCategories = categories.filter(category => {
          // Ensure category has valid options
          if (!category.options || category.options.length === 0) {
            console.warn(`🔧 Category "${category.name}" has no options`);
            return false;
          }
          
          // Validate that options belong to the current model
          const validOptions = category.options.filter(option => {
            const belongsToModel = (model.databaseId && option._related_options?.includes(model.databaseId)) || 
                                  (model.databaseId && option.compatibleBaseModels?.includes(model.databaseId)) ||
                                  option.productId === model.databaseId?.toString();
            
            if (!belongsToModel) {
              console.warn(`🔧 Option "${option.name}" does not belong to model "${model.name}" (${model.databaseId})`);
              console.warn(`🔧 Option details:`, {
                name: option.name,
                productId: option.productId,
                _related_options: option._related_options,
                compatibleBaseModels: option.compatibleBaseModels
              });
              return false;
            }
            
            return true;
          });
          
          if (validOptions.length === 0) {
            console.warn(`🔧 Category "${category.name}" has no valid options for model "${model.name}"`);
            return false;
          }
          
          return true;
        });
        
        console.log(`🔧 Setting ${validCategories.length} valid categories for model "${model.name}"`);
        set({ categories: validCategories });
      },

      setCompatibilityIssues: (issues) => {
        set({ compatibilityIssues: issues });
      },

      addOption: (option, categoryId) => {
        const state = get();
        const category = state.categories.find(c => c.id === categoryId);
        
        // Debug logging
        console.log('Adding/Updating option to configurator store:', {
          optionId: option.id,
          optionName: option.name,
          categoryId,
          hasVariations: option.selectedVariations ? option.selectedVariations.length > 0 : false,
          selectedVariations: option.selectedVariations?.map(v => ({ id: v.id, name: v.name, price: v.price })),
          totalPrice: option.totalPrice,
          basePrice: option.price
        });
        
        set((state) => {
          const newSelectedOptions = { ...state.selectedOptions };
          
          if (!newSelectedOptions[categoryId]) {
            newSelectedOptions[categoryId] = [];
          }
          
          // Find if option already exists
          const existingIndex = newSelectedOptions[categoryId].findIndex(
            opt => opt.databaseId === option.databaseId
          );
          
          const exists = existingIndex !== -1;
          
          if (category?.multiSelect) {
            // Multi-select category
            if (exists) {
              // ✅ UPDATE existing option (replace with new variation selection)
              console.log('Updating existing option at index:', existingIndex);
              newSelectedOptions[categoryId][existingIndex] = option;
            } else {
              // ✅ ADD new option
              console.log('Adding new option to multi-select category');
              newSelectedOptions[categoryId].push(option);
            }
          } else {
            // Single-select category
            if (exists && newSelectedOptions[categoryId][0].databaseId === option.databaseId) {
              // ✅ UPDATE same option with new variations
              console.log('Updating option variations in single-select category');
              newSelectedOptions[categoryId][0] = option;
            } else {
              // ✅ REPLACE with new option
              console.log('Replacing category selection');
              newSelectedOptions[categoryId] = [option];
            }
          }
          
          console.log('Updated selectedOptions:', newSelectedOptions[categoryId]);
          
          return { selectedOptions: newSelectedOptions };
        });
        
        get().checkCompatibility();
        get().calculateSummary();
        get().updateProgressCount();
      },

      updateOption: (option, categoryId) => {
        const state = get();
        
        console.log('Updating existing option in configurator store:', {
          optionId: option.id,
          optionName: option.name,
          categoryId,
          hasVariations: option.selectedVariations ? option.selectedVariations.length > 0 : false,
          selectedVariations: option.selectedVariations?.map(v => ({ id: v.id, name: v.name, price: v.price })),
          totalPrice: option.totalPrice,
          basePrice: option.price
        });
        
        set((state) => {
          const newSelectedOptions = { ...state.selectedOptions };
          
          if (!newSelectedOptions[categoryId]) {
            console.warn('Cannot update option in non-existent category');
            return state;
          }
          
          // Find and update the specific option
          const optionIndex = newSelectedOptions[categoryId].findIndex(
            opt => opt.databaseId === option.databaseId
          );
          
          if (optionIndex === -1) {
            console.warn('Option not found in category, cannot update');
            return state;
          }
          
          console.log('Updating option at index:', optionIndex, 'with new data:', {
            oldVariations: newSelectedOptions[categoryId][optionIndex].selectedVariations,
            newVariations: option.selectedVariations,
            oldPrice: newSelectedOptions[categoryId][optionIndex].totalPrice,
            newPrice: option.totalPrice
          });
          
          // Update the option at the found index
          newSelectedOptions[categoryId][optionIndex] = option;
          
          return { selectedOptions: newSelectedOptions };
        });
        
        get().checkCompatibility();
        get().calculateSummary();
        get().updateProgressCount();
      },

      removeOption: (optionId, categoryId) => {
        set((state) => {
          const newSelectedOptions = { ...state.selectedOptions };
          
          if (newSelectedOptions[categoryId]) {
            newSelectedOptions[categoryId] = newSelectedOptions[categoryId].filter(
              opt => opt.databaseId !== optionId
            );
            
            // Remove category key if empty
            if (newSelectedOptions[categoryId].length === 0) {
              delete newSelectedOptions[categoryId];
            }
          }
          
          return { selectedOptions: newSelectedOptions };
        });
        
        get().checkCompatibility();
        get().calculateSummary();
        get().updateProgressCount();
      },

      clearCategory: (categoryId) => {
        set((state) => {
          const newSelectedOptions = { ...state.selectedOptions };
          delete newSelectedOptions[categoryId];
          return { selectedOptions: newSelectedOptions };
        });
        
        get().checkCompatibility();
        get().calculateSummary();
        get().updateProgressCount();
      },

      checkCompatibility: () => {
        const { model, selectedOptions, categories } = get();
        if (!model) return;
        
        const allSelectedOptions = Object.values(selectedOptions).flat();
        const issues: CompatibilityIssue[] = [];
        
        // Check model compatibility rules
        model.compatibilityRules?.forEach(rule => {
          const selectedIds = allSelectedOptions.map(opt => opt.databaseId || 0);
          
          if (rule.type === 'REQUIRED' && rule.requiredOptions) {
            const hasRequired = rule.requiredOptions.some(reqId => 
              selectedIds.includes(reqId)
            );
            if (!hasRequired) {
              issues.push({
                rule,
                affectedOptions: rule.requiredOptions,
                autoResolvable: false
              });
            }
          }
          
          if (rule.type === 'CONFLICTING' && rule.conflictingOptions) {
            const hasConflicting = rule.conflictingOptions.filter(confId =>
              selectedIds.includes(confId)
            );
            if (hasConflicting.length > 1) {
              issues.push({
                rule,
                affectedOptions: hasConflicting,
                autoResolvable: true
              });
            }
          }
        });
        
        // Check individual option compatibility rules
        allSelectedOptions.forEach(option => {
          option.compatibilityRules?.forEach(rule => {
            const selectedIds = allSelectedOptions.map(opt => opt.databaseId || 0);
            
            if (rule.type === 'CONFLICTING' && rule.conflictingOptions) {
              const conflicts = rule.conflictingOptions.filter(confId =>
                selectedIds.includes(confId) && confId !== option.databaseId
              );
              if (conflicts.length > 0) {
                issues.push({
                  rule,
                  affectedOptions: [option.databaseId || 0, ...conflicts],
                  autoResolvable: true
                });
              }
            }
          });
        });
        
        set({ compatibilityIssues: issues });
      },

      calculateSummary: () => {
        set((state) => {
          const { model, selectedOptions } = state;
          
          // Debug logging for store price calculation
          console.log('🔧 Store Price Calculation Debug:', {
            selectedOptionsKeys: Object.keys(selectedOptions),
            selectedOptionsCount: Object.values(selectedOptions).flat().length,
            selectedOptionsByCategory: Object.keys(selectedOptions).map(categoryId => ({
              categoryId,
              count: selectedOptions[categoryId]?.length || 0,
              options: selectedOptions[categoryId]?.map(opt => ({ id: opt.id, name: opt.name, price: opt.price, totalPrice: opt.totalPrice }))
            }))
          });
          
          const basePrice = parseFloat(model?.price?.toString() || '0');
          const optionsTotal = Object.values(selectedOptions)
            .flat()
            .reduce((total, option) => {
              // Use totalPrice if available (includes variations), otherwise use base price
              const optionPrice = option.totalPrice || parseFloat(option.price?.toString() || '0');
              console.log(`🔧 Adding option price: ${option.name} = ${optionPrice}`);
              return total + optionPrice;
            }, 0);
          
          const installationCost = model?.installationRequired ? 300 : 0;
          const shippingCost = 0; // No shipping calculation in configurator
          const subtotal = basePrice + optionsTotal + installationCost;
          const taxAmount = 0; // No tax calculation in configurator
          const grandTotal = subtotal;
          
          const newSummary: ConfigurationSummary = {
            basePrice,
            optionsTotal,
            installationCost,
            shippingCost,
            taxAmount: Math.round(taxAmount * 100) / 100,
            grandTotal: Math.round(grandTotal * 100) / 100,
            estimatedDelivery: '2-3 weeks',
            financingOptions: calculateFinancingOptions(grandTotal),
            insuranceEstimate: calculateInsuranceEstimate(grandTotal)
          };
          
          return { summary: newSummary, previousSummary: state.summary };
        });
      },

      updateProgressCount: () => {
        set((state) => {
          const { categories, selectedOptions } = state;
          
          // Debug logging
          console.log('Updating progress count:', {
            categoriesCount: categories.length,
            selectedOptionsCount: Object.values(selectedOptions).flat().length,
            selectedOptionsByCategory: Object.keys(selectedOptions).map(categoryId => ({
              categoryId,
              count: selectedOptions[categoryId]?.length || 0
            }))
          });
          
          const updatedCategories = categories.map(category => {
            const categorySelectedOptions = selectedOptions[category.id] || [];
            const selectedCount = categorySelectedOptions.length;
            const totalCount = category.options?.length || 0;
            
            console.log('Category progress update:', {
              categoryId: category.id,
              categoryName: category.name,
              selectedCount,
              totalCount,
              previousProgressCount: category.progressCount
            });
            
            return {
              ...category,
              progressCount: {
                selected: selectedCount,
                total: totalCount
              }
            };
          });
          
          return { categories: updatedCategories };
        });
      },

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      clearConfiguration: () => {
        console.log(`🔧 DEBUG: Clearing configuration completely`);
        set({
          selectedOptions: {},
          compatibilityIssues: [],
          summary: defaultSummary,
          selectedOptionsWithVariations: [],
          configurationSummary: {
            baseModel: null as any,
            selectedOptions: [],
            basePrice: 0,
            optionsPrice: 0,
            installationPrice: 0,
            shippingPrice: 0,
            taxAmount: 0,
            totalPrice: 0,
            deliveryEstimate: '2-3 weeks',
            financingOption: undefined,
            insuranceEstimate: undefined
          }
        });
        
        get().updateProgressCount();
      },
      
      // Clear all configurator state (including model and categories)
      clearAllState: () => {
        console.log(`🔧 DEBUG: Clearing ALL configurator state`);
        set({
          model: null,
          categories: [],
          selectedOptions: {},
          compatibilityIssues: [],
          summary: defaultSummary,
          selectedOptionsWithVariations: [],
          optionProducts: [],
          configurationSummary: {
            baseModel: null as any,
            selectedOptions: [],
            basePrice: 0,
            optionsPrice: 0,
            installationPrice: 0,
            shippingPrice: 0,
            taxAmount: 0,
            totalPrice: 0,
            deliveryEstimate: '2-3 weeks',
            financingOption: undefined,
            insuranceEstimate: undefined
          }
        });
      },

      saveConfiguration: (name, notes) => {
        const { model, selectedOptions, summary } = get();
        if (!model) return;
        
        const allSelectedOptions = Object.values(selectedOptions).flat();
        const config: SavedConfiguration = {
          id: 'config_' + Date.now(),
          name,
          baseModelId: model.databaseId || 0,
          optionIds: allSelectedOptions.map(opt => opt.databaseId || 0),
          totalPrice: summary.grandTotal,
          createdAt: new Date().toISOString(),
          notes
        };
        
        set((state) => ({
          savedConfigurations: [...state.savedConfigurations, config]
        }));
      },

      loadConfiguration: (configId) => {
        const { savedConfigurations, categories } = get();
        const config = savedConfigurations.find(c => c.id === configId);
        if (!config) return;
        
        // Reconstruct selected options from saved configuration
        const newSelectedOptions: Record<string, ConfigurableProductSchema[]> = {};
        
        categories.forEach(category => {
          const categoryOptions = category.options?.filter(option =>
            config.optionIds.includes(option.databaseId || 0)
          ) || [];
          
          if (categoryOptions.length > 0) {
            newSelectedOptions[category.id] = categoryOptions;
          }
        });
        
        set({ selectedOptions: newSelectedOptions });
        get().checkCompatibility();
        get().calculateSummary();
      },

      deleteConfiguration: (configId) => {
        set((state) => ({
          savedConfigurations: state.savedConfigurations.filter(c => c.id !== configId)
        }));
      },

      // Computed getters
      getSelectedOptionsForCategory: (categoryId) => {
        return get().selectedOptions[categoryId] || [];
      },

      isOptionSelected: (optionId, categoryId) => {
        const categoryOptions = get().selectedOptions[categoryId] || [];
        return categoryOptions.some(opt => opt.databaseId === optionId);
      },

      getOptionCompatibilityIssues: (optionId) => {
        return get().compatibilityIssues.filter(issue =>
          issue.affectedOptions.includes(optionId)
        );
      },

      getTotalSelectedOptions: () => {
        return Object.values(get().selectedOptions).flat().length;
      },

      hasCompatibilityErrors: () => {
        return get().compatibilityIssues.some(issue => issue.rule.severity === 'ERROR');
      },
      
      // Edit session actions
      startEditSession: (sessionId: string, cartItemId: string, originalConfig: Configuration) => {
        set((state) => ({
          editSession: {
            isEditMode: true,
            sessionId,
            cartItemId,
            originalConfiguration: originalConfig
          },
          selectedOptions: originalConfig.selectedOptions || {}
        }));
        
        get().calculateSummary();
      },
      
      stopEditSession: () => {
        set({
          editSession: {
            isEditMode: false,
            sessionId: null,
            cartItemId: null,
            originalConfiguration: null
          }
        });
      },
      
      loadFromEditSession: (sessionId: string) => {
        // Load from localStorage or session management
        const sessionData = localStorage.getItem(`hsm_edit_session_${sessionId}`);
        if (sessionData) {
          try {
            const parsed = JSON.parse(sessionData);
            set((state) => ({
              selectedOptions: parsed.selectedOptions || {},
              editSession: {
                ...state.editSession,
                sessionId,
                isEditMode: true
              }
            }));
            
            get().calculateSummary();
          } catch (err) {
            console.error('Failed to load edit session:', err);
          }
        }
      },
      
      toggleOption: (categoryId: string, option: ConfigurableProductSchema) => {
        const { selectedOptions } = get();
        const categoryOptions = selectedOptions[categoryId] || [];
        const isSelected = categoryOptions.some(opt => opt.databaseId === option.databaseId);
        
        if (isSelected) {
          get().removeOption(option.databaseId || 0, categoryId);
        } else {
          get().addOption(option, categoryId);
        }
      },
      
      updateCartItem: async (cartItemId: string) => {
        const { model, selectedOptions, summary } = get();
        if (!model || !selectedOptions) return;
        
        set({ loading: true });
        
        try {
          // Create configuration object
          const config: Configuration = {
            baseModel: model,
            selectedOptions,
            summary,
            compatibilityIssues: get().compatibilityIssues
          };
          
          // Convert to cart product format
          const cartProductUpdates = configurationToCartProduct(config);
          
          // Update cart via cart store (would need to integrate with cart store)
          // This is a placeholder - actual implementation would use cart store
          
          get().stopEditSession();
          return { success: true };
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to update cart item' });
          console.error('Update cart item error:', err);
          throw err;
        } finally {
          set({ loading: false });
        }
      },
      
      // Conversion utilities
      configurationToCartProduct: (config: Configuration) => {
        return configurationToCartProduct(config);
      },
      
      cartProductToConfiguration: (item: CartProduct) => {
        return cartProductToConfiguration(item);
      },

      // GraphQL Integration Methods
      loadModelWithCategories: async (slug: string) => {
        set({ loading: true, error: null });
        
        try {
          const data = await configuratorAPI.getModelWithCategories(slug);
          
          if ((data as any)?.product) {
            const model = (data as any).product;
            set({ 
              model: {
                ...model,
                // Ensure all required ConfigurableProductSchema fields are present
                title: model.title || model.name || '',
                description: model.description || '',
                featuredImage: model.image?.sourceUrl || '',
                productSpecifications: model.productSpecifications || '',
                productPictures: model.productPictures || [],
                price: parseFloat(model.price || model.regularPrice || '0'),
                affiliate: false
              }
            });
            
            if (model.configuratorCategories) {
              set({ categories: model.configuratorCategories });
            }
            
            get().calculateSummary();
          }
        } catch (error) {
          console.error('Failed to load model with categories:', error);
          set({ error: 'Failed to load configuration data' });
        } finally {
          set({ loading: false });
        }
      },

      fetchCategoryOptions: async (categoryId: string): Promise<ConfigurableProductSchema[]> => {
        const { model } = get();
        if (!model) return [];

        try {
          // First check if we already have the category options loaded
          const categories = get().categories;
          const category = categories.find(c => c.id === categoryId);
          
          if (category?.options?.length) {
            return category.options;
          }
          
          // If category has no options loaded, fetch them from the API
          const data = await configuratorAPI.getConfigurationCategories(model.id || '');
          const updatedCategory = (data as any)?.configuratorCategories?.find((c: any) => c.id === categoryId);
          
          if (updatedCategory?.options) {
            // Update store with fetched options
            set(state => ({
              categories: state.categories.map(cat => 
                cat.id === categoryId 
                  ? { ...cat, options: updatedCategory.options }
                  : cat
              )
            }));
            return updatedCategory.options;
          }
          
          return [];
        } catch (error) {
          console.error('Failed to fetch category options:', error);
          return [];
        }
      },

      checkCompatibilityLive: async () => {
        const { selectedOptions } = get();
        const allSelectedOptions = Object.values(selectedOptions).flat();
        
        if (allSelectedOptions.length === 0) {
          set({ compatibilityIssues: [] });
          return;
        }

        try {
          const selectedOptionIds = allSelectedOptions
            .map(opt => opt.databaseId?.toString() || opt.id?.toString())
            .filter((id): id is string => Boolean(id));

          const data = await configuratorAPI.checkCompatibility(selectedOptionIds);
          
          if (data?.data?.checkCompatibility?.issues) {
            // Transform GraphQL response to internal format
            const issues = data.data.checkCompatibility.issues.map((issue: any) => ({
              rule: issue.rule,
              affectedOptions: issue.affectedOptions,
              autoResolvable: issue.autoResolvable
            }));
            
            set({ compatibilityIssues: issues });
          }
        } catch (error) {
          console.error('Failed to check compatibility:', error);
          // Fall back to local compatibility checking
          get().checkCompatibility();
        }
      },

      addConfigurationToCart: async () => {
        const { model, selectedOptions, summary } = get();
        if (!model) throw new Error('No model selected');

        set({ loading: true, error: null });

        try {
          const configuration = {
            baseModel: model,
            selectedOptions,
            summary
          };

          const input = {
            baseProductId: parseInt(model.databaseId?.toString() || model.id?.toString() || '0'),
            optionIds: Object.values(selectedOptions)
              .flat()
              .map(opt => parseInt(opt.databaseId?.toString() || opt.id?.toString() || '0'))
              .filter(id => id > 0),
            configurationName: `${model.title} Configuration`,
            totalPrice: summary.grandTotal
          };

          const data = await configuratorAPI.addConfigurationToCart(input);
          
          if (data?.addConfigurationToCart?.cart) {
            // Configuration successfully added to cart
            // Clear the configurator state
            get().clearConfiguration();
            return data.addConfigurationToCart.cart;
          } else if (data?.addConfigurationToCart?.errors) {
            throw new Error(data.addConfigurationToCart.errors[0]?.message || 'Failed to add to cart');
          }
        } catch (error) {
          console.error('Failed to add configuration to cart:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to add to cart' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      saveConfigurationLive: async (name: string, notes?: string): Promise<SavedConfiguration> => {
        const { model, selectedOptions, summary } = get();
        if (!model) throw new Error('No model selected');

        set({ loading: true, error: null });

        try {
          const input = {
            name,
            notes,
            baseModelId: parseInt(model.databaseId?.toString() || model.id?.toString() || '0'),
            optionIds: Object.values(selectedOptions)
              .flat()
              .map(opt => parseInt(opt.databaseId?.toString() || opt.id?.toString() || '0'))
              .filter(id => id > 0)
          };

          const data = await configuratorAPI.saveConfiguration(input);
          
          if (data?.saveConfiguration?.configuration) {
            const savedConfig: SavedConfiguration = {
              id: data.saveConfiguration.configuration.id,
              name: data.saveConfiguration.configuration.name,
              baseModelId: parseInt(model.databaseId?.toString() || model.id?.toString() || '0'),
              optionIds: Object.values(selectedOptions)
                .flat()
                .map(opt => parseInt(opt.databaseId?.toString() || opt.id?.toString() || '0'))
                .filter(id => id > 0),
              totalPrice: data.saveConfiguration.configuration.totalPrice,
              createdAt: data.saveConfiguration.configuration.createdAt,
              notes: data.saveConfiguration.configuration.notes
            };

            // Add to local saved configurations
            set(state => ({
              savedConfigurations: [...state.savedConfigurations, savedConfig]
            }));

            return savedConfig;
          } else if (data?.saveConfiguration?.errors) {
            throw new Error(data.saveConfiguration.errors[0]?.message || 'Failed to save configuration');
          }
          
          throw new Error('Invalid response from server');
        } catch (error) {
          console.error('Failed to save configuration:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to save configuration' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      updateCartItemConfiguration: async (cartItemId: string) => {
        const { model, selectedOptions, summary } = get();
        if (!model) throw new Error('No model selected');

        set({ loading: true, error: null });

        try {
          const input = {
            cartItemKey: cartItemId,
            optionIds: Object.values(selectedOptions)
              .flat()
              .map(opt => parseInt(opt.databaseId?.toString() || opt.id?.toString() || '0'))
              .filter(id => id > 0)
          };

          const data = await configuratorAPI.updateCartItemConfiguration(input);
          
          if (data?.updateCartItemConfiguration?.cart) {
            // Successfully updated cart item
            get().stopEditSession();
            return data.updateCartItemConfiguration.cart;
          } else if (data?.updateCartItemConfiguration?.errors) {
            throw new Error(data.updateCartItemConfiguration.errors[0]?.message || 'Failed to update cart item');
          }
        } catch (error) {
          console.error('Failed to update cart item configuration:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to update cart item' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      // Enhanced User Flow Actions
      loadMainProduct: (product: ConfigurableProductSchema) => {
        set({ 
          model: product,
          configurationSummary: {
            ...get().configurationSummary,
            baseModel: product,
            basePrice: parseFloat(product.price?.toString() || product.regularPrice?.toString() || '0')
          }
        });
        get().updateConfigurationSummary();
      },

      loadOptionProducts: async (optionIds: number[]) => {
        set({ loading: true, error: null });
        
        try {
          // Import the WooCommerce function
          const { fetchOptionProductsByIds } = await import('../lib/woocommerce');
          const optionProducts = await fetchOptionProductsByIds(optionIds);
          set({ optionProducts, loading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to load option products', loading: false });
        }
      },

      openOptionPopup: (option: ConfigurableProductSchema) => {
        const isAlreadySelected = get().selectedOptionsWithVariations.some(so => so.option.id === option.id);
        const currentVariations = isAlreadySelected 
          ? get().selectedOptionsWithVariations.find(so => so.option.id === option.id)?.selectedVariations || []
          : [];

        const selectionType = option.variableType?.toLowerCase() === 'checkbox' ? 'checkbox' : 'radio';

        set({
          optionPopup: {
            isOpen: true,
            selectedOption: option,
            selectedVariations: currentVariations,
            tempSelections: currentVariations,
            pricePreview: calculateOptionPrice(option, currentVariations),
            isAlreadyInConfiguration: isAlreadySelected,
            selectionType
          }
        });
      },

      closeOptionPopup: () => {
        set({
          optionPopup: {
            isOpen: false,
            selectedOption: null,
            selectedVariations: [],
            tempSelections: [],
            pricePreview: 0,
            isAlreadyInConfiguration: false,
            selectionType: 'radio'
          }
        });
      },

      selectVariation: (variation: Variation) => {
        const { optionPopup } = get();
        if (!optionPopup.isOpen || !optionPopup.selectedOption) return;

        const isSelected = optionPopup.tempSelections.some(v => v.id === variation.id);
        let newTempSelections: Variation[];

        if (optionPopup.selectionType === 'radio') {
          // Radio selection - only one variation allowed
          newTempSelections = isSelected ? [] : [variation];
        } else {
          // Checkbox selection - multiple variations allowed
          if (isSelected) {
            newTempSelections = optionPopup.tempSelections.filter(v => v.id !== variation.id);
          } else {
            newTempSelections = [...optionPopup.tempSelections, variation];
          }
        }

        const pricePreview = calculateOptionPrice(optionPopup.selectedOption, newTempSelections);

        set({
          optionPopup: {
            ...optionPopup,
            tempSelections: newTempSelections,
            pricePreview
          }
        });
      },

      deselectVariation: (variation: Variation) => {
        const { optionPopup } = get();
        if (!optionPopup.isOpen) return;

        const newTempSelections = optionPopup.tempSelections.filter(v => v.id !== variation.id);
        const pricePreview = optionPopup.selectedOption 
          ? calculateOptionPrice(optionPopup.selectedOption, newTempSelections)
          : 0;

        set({
          optionPopup: {
            ...optionPopup,
            tempSelections: newTempSelections,
            pricePreview
          }
        });
      },

      addToConfiguration: (option: ConfigurableProductSchema, variations: Variation[], calculatedPrice?: number) => {
        const { optionPopup } = get();
        
        console.log(`🔧 DEBUG: addToConfiguration called for option "${option.name}" with ${variations.length} variations`, {
          calculatedPriceProvided: calculatedPrice !== undefined,
          calculatedPrice: calculatedPrice
        });
        
        // Remove existing option if it's already in configuration
        if (optionPopup.isAlreadyInConfiguration) {
          const filteredOptions = get().selectedOptionsWithVariations.filter(so => so.option.id !== option.id);
          set({ selectedOptionsWithVariations: filteredOptions });
          console.log(`🔧 DEBUG: Removed existing option "${option.name}" from configuration`);
        }
        
        // Use pre-calculated price if provided, otherwise calculate it
        const totalPrice = calculatedPrice !== undefined ? calculatedPrice : calculateOptionPrice(option, variations);
        
        console.log(`🔧 DEBUG: Price calculation:`, {
          calculatedPriceProvided: calculatedPrice !== undefined,
          calculatedPrice: calculatedPrice,
          recalculatedPrice: calculateOptionPrice(option, variations),
          finalTotalPrice: totalPrice
        });
        
        const selectedOption: SelectedOption = {
          id: `${option.id}-${Date.now()}`,
          option,
          selectedVariations: variations,
          totalPrice,
          quantity: 1,
          addedAt: new Date(),
          category: option.optionType || 'General'
        };

        console.log(`🔧 DEBUG: Adding option to configuration:`, {
          optionId: option.id,
          optionName: option.name,
          totalPrice,
          variationsCount: variations.length,
          category: selectedOption.category
        });

        set(state => ({
          selectedOptionsWithVariations: [...state.selectedOptionsWithVariations, selectedOption]
        }));

        console.log(`🔧 DEBUG: Option added. Total options in configuration: ${get().selectedOptionsWithVariations.length}`);

        // Update configuration summary
        console.log(`🔧 DEBUG: Calling updateConfigurationSummary...`);
        get().updateConfigurationSummary();
        console.log(`🔧 DEBUG: updateConfigurationSummary completed`);
      },

      removeFromConfiguration: (optionId: string) => {
        set(state => ({
          selectedOptionsWithVariations: state.selectedOptionsWithVariations.filter(so => so.id !== optionId)
        }));

        // Update configuration summary
        get().updateConfigurationSummary();
      },

      updateConfigurationSummary: () => {
        const { model, selectedOptionsWithVariations } = get();
        
        console.log(`🔧 DEBUG: updateConfigurationSummary called with ${selectedOptionsWithVariations.length} options`);
        
        if (!model) {
          console.warn(`🔧 DEBUG: updateConfigurationSummary - no model found`);
          return;
        }

        console.log(`🔧 DEBUG: Calculating summary for model "${model.name}" with options:`, selectedOptionsWithVariations.map(so => ({
          optionName: so.option.name,
          totalPrice: so.totalPrice,
          variationsCount: so.selectedVariations.length
        })));

        const calculation = calculateConfigurationTotal(model, selectedOptionsWithVariations);
        
        console.log(`🔧 DEBUG: Price calculation result:`, {
          basePrice: calculation.basePrice,
          optionsPrice: calculation.optionsPrice,
          installationPrice: calculation.installationPrice,
          shippingPrice: calculation.shippingPrice,
          taxAmount: calculation.taxAmount,
          totalPrice: calculation.totalPrice
        });
        
        const summary: ConfigurationSummaryData = {
          baseModel: model,
          selectedOptions: selectedOptionsWithVariations.map(so => so.option),
          totalPrice: calculation.totalPrice,
          basePrice: calculation.basePrice,
          optionsPrice: calculation.optionsPrice,
          installationPrice: calculation.installationPrice,
          shippingPrice: calculation.shippingPrice,
          taxAmount: calculation.taxAmount,
          deliveryEstimate: '2-3 weeks',
          financingOption: calculateFinancingOptions(calculation.totalPrice)[0],
          insuranceEstimate: calculateInsuranceEstimate(calculation.totalPrice)
        };

        console.log(`🔧 DEBUG: Setting configurationSummary:`, summary);
        set({ configurationSummary: summary });
        console.log(`🔧 DEBUG: configurationSummary updated successfully`);
      },

      calculateTotalPrice: () => {
        const { configurationSummary } = get();
        return configurationSummary.totalPrice;
      },

      calculateOptionPrice: (option: ConfigurableProductSchema, variations: Variation[]) => {
        return calculateOptionPrice(option, variations);
      }
    }),
    {
      name: 'hsm-configurator-storage',
      partialize: (state) => ({
        savedConfigurations: state.savedConfigurations,
        selectedOptions: state.selectedOptions,
        editSession: state.editSession
      })
    }
  )
);