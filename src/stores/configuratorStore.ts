import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ConfigurableProductSchema,
  ConfiguratorCategory,
  CompatibilityIssue,
  ConfigurationSummary,
  SavedConfiguration,
  FinancingOption,
  InsuranceEstimate
} from 'lib/interfaces/configurator';
import { configuratorAPI } from 'lib/graphql/configurator';

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

  // Actions
  setModel: (model: ConfigurableProductSchema) => void;
  setCategories: (categories: ConfiguratorCategory[]) => void;
  addOption: (option: ConfigurableProductSchema, categoryId: string) => void;
  removeOption: (optionId: number, categoryId: string) => void;
  clearCategory: (categoryId: string) => void;
  checkCompatibility: () => void;
  calculateSummary: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearConfiguration: () => void;
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
import { CartProduct } from 'lib/interfaces/cart';

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
      
      // Edit session state
      editSession: {
        isEditMode: false,
        sessionId: null,
        cartItemId: null,
        originalConfiguration: null
      },

      // Actions
      setModel: (model) => {
        set({ model });
        get().calculateSummary();
      },

      setCategories: (categories) => {
        set({ categories });
      },

      addOption: (option, categoryId) => {
        const state = get();
        const category = state.categories.find(c => c.id === categoryId);
        
        set((state) => {
          const newSelectedOptions = { ...state.selectedOptions };
          
          if (!newSelectedOptions[categoryId]) {
            newSelectedOptions[categoryId] = [];
          }
          
          // Check if multiSelect is allowed
          if (category?.multiSelect) {
            // Add to existing selections if not already selected
            const exists = newSelectedOptions[categoryId].some(
              opt => opt.databaseId === option.databaseId
            );
            if (!exists) {
              newSelectedOptions[categoryId].push(option);
            }
          } else {
            // Replace existing selection
            newSelectedOptions[categoryId] = [option];
          }
          
          return { selectedOptions: newSelectedOptions };
        });
        
        get().checkCompatibility();
        get().calculateSummary();
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
      },

      clearCategory: (categoryId) => {
        set((state) => {
          const newSelectedOptions = { ...state.selectedOptions };
          delete newSelectedOptions[categoryId];
          return { selectedOptions: newSelectedOptions };
        });
        
        get().checkCompatibility();
        get().calculateSummary();
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
          
          const basePrice = parseFloat(model?.price?.toString() || '0');
          const optionsTotal = Object.values(selectedOptions)
            .flat()
            .reduce((total, option) => total + parseFloat(option.price?.toString() || '0'), 0);
          
          const installationCost = model?.installationRequired ? 300 : 0;
          const shippingCost = 50;
          const subtotal = basePrice + optionsTotal + installationCost + shippingCost;
          const taxAmount = subtotal * 0.08; // 8% tax rate
          const grandTotal = subtotal + taxAmount;
          
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

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      clearConfiguration: () => {
        set({
          selectedOptions: {},
          compatibilityIssues: [],
          summary: defaultSummary
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
          console.log('Updating cart item:', cartItemId, cartProductUpdates);
          
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
          
          if (data?.product) {
            const model = data.product;
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
          const updatedCategory = data?.configuratorCategories?.find((c: any) => c.id === categoryId);
          
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
          
          if (data?.checkCompatibility?.issues) {
            // Transform GraphQL response to internal format
            const issues = data.checkCompatibility.issues.map((issue: any) => ({
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