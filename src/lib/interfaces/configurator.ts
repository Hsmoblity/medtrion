import { ProductSchema } from './schema';

// Enhanced interfaces for HSM Mobility Model Configurator
export interface ConfigurableProductSchema extends Omit<ProductSchema, 'shortDescription'> {
  // Base product configuration fields
  baseModel?: boolean;
  configuratorCategories?: ConfiguratorCategory[];
  compatibilityRules?: CompatibilityRule[];
  installationRequired?: boolean;
  financingAvailable?: boolean;
  insuranceCoverage?: string[];
  
  // Option-specific fields
  optionType?: 'SAFETY' | 'COMFORT' | 'INSTALLATION' | 'ACCESSORY' | 'DELIVERY' | 'WARRANTY';
  compatibleBaseModels?: number[];
  installationTime?: number; // in hours
  warrantyPeriod?: number; // in months
  
  // Type and variation fields for option selection
  type?: 'SIMPLE' | 'VARIABLE' | 'GROUP';
  variableType?: 'radio' | 'checkbox';
  
  // Additional HSM-specific fields
  safetyRating?: string;
  adaCompliant?: boolean;
  weightCapacity?: number;
  
  // Database ID for GraphQL compatibility
  databaseId?: number;
  id?: string;
  name?: string;
  image?: {
    sourceUrl?: string;
    altText?: string;
  };
  regularPrice?: string;
  salePrice?: string;
  sku?: string;
  shortDescription?: string; // Optional override of ProductSchema's required field
  
  // Override _related_options_products to allow ConfigurableProductSchema array for nested options
  _related_options_products?: Array<ConfigurableProductSchema>;
  
  // Variation selection support
  selectedVariations?: Array<{
    id: string;
    databaseId: number;
    name: string;
    price: number;
    sku: string;
    image?: {
      sourceUrl: string;
      altText: string;
    };
    attributes: Array<{
      id: string;
      name: string;
      value: string;
    }>;
    stockStatus?: 'instock' | 'outofstock' | 'onbackorder';
  }>;
  totalPrice?: number; // Total price including selected variations
}

export interface ConfiguratorCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  required: boolean;
  multiSelect: boolean; // Allow multiple options from this category
  options?: ConfigurableProductSchema[];
  maxSelections?: number;
  minSelections?: number;
  loadingState?: 'idle' | 'loading' | 'loaded' | 'error';
  validationError?: string;
  progressCount?: {
    selected: number;
    total: number;
  };
  icon?: string;
  helpText?: string;
  collapsed?: boolean;
}

export interface CompatibilityRule {
  id: string;
  name: string;
  type: 'REQUIRED' | 'CONFLICTING' | 'RECOMMENDED';
  requiredOptions?: number[];
  conflictingOptions?: number[];
  message: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
  resolutionSuggestion?: string;
  category?: string;
  conditions?: {
    if: number[]; // Option IDs that trigger this rule
    then: 'REQUIRE' | 'FORBID' | 'RECOMMEND';
    options: number[]; // Option IDs affected by the rule
  };
}

export interface CompatibilityIssue {
  rule: CompatibilityRule;
  affectedOptions: number[];
  autoResolvable: boolean;
}

export interface FinancingOption {
  id: string;
  name: string;
  monthlyPayment: number;
  termMonths: number;
  interestRate: number;
  downPayment: number;
  totalCost: number;
}

export interface InsuranceEstimate {
  estimatedCoverage: number;
  outOfPocketCost: number;
  coverageTypes: string[];
  requiresPreApproval: boolean;
}

// Additional interfaces for complete configurator suite
export interface ConfigurationSummaryData {
  baseModel: ConfigurableProductSchema;
  selectedOptions: ConfigurableProductSchema[];
  totalPrice: number;
  basePrice: number;
  optionsPrice: number;
  installationPrice: number;
  shippingPrice: number;
  taxAmount: number;
  deliveryEstimate: string;
  financingOption?: FinancingOption;
  insuranceEstimate?: InsuranceEstimate;
}

export interface SavedConfigurationExtended {
  id: string;
  name: string;
  notes?: string;
  baseModel: ConfigurableProductSchema;
  selectedOptions: ConfigurableProductSchema[];
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface GraphQLError {
  message: string;
  extensions?: {
    code?: string;
    path?: string[];
  };
}

export interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
  loading: boolean;
}

// Event interfaces for configurator
export interface ConfiguratorEvents {
  'configuration-change': {
    baseModel?: ConfigurableProductSchema;
    selectedOptions: ConfigurableProductSchema[];
    totalPrice: number;
  };
  'option-toggle': {
    option: ConfigurableProductSchema;
    selected: boolean;
    categoryId: string;
  };
  'add-to-cart': {
    configuration: ConfigurationSummaryData;
  };
  'save-configuration': {
    configuration: SavedConfiguration;
  };
  'financing-change': {
    financingOption: FinancingOption;
  };
  'insurance-check': {
    insuranceEstimate: InsuranceEstimate;
  };
}

export interface ConfigurationSummary {
  basePrice: number;
  optionsTotal: number;
  installationCost: number;
  shippingCost: number;
  taxAmount: number;
  grandTotal: number;
  estimatedDelivery: string;
  financingOptions?: FinancingOption[];
  insuranceEstimate?: InsuranceEstimate;
}

export interface SavedConfiguration {
  id: string;
  name: string;
  baseModelId: number;
  optionIds: number[];
  totalPrice: number;
  createdAt: string;
  notes?: string;
}

export interface ConfiguratorState {
  model: ConfigurableProductSchema | null;
  categories: ConfiguratorCategory[];
  selectedOptions: Record<string, ConfigurableProductSchema[]>;
  summary: ConfigurationSummary;
  compatibilityIssues: CompatibilityIssue[];
  loading: boolean;
  error: string | null;
  savedConfigurations: SavedConfiguration[];
}

// OptionCard specific interfaces
export interface HSMOptionCardProps {
  // Required Props
  option: ConfigurableProductSchema;
  
  // Configuration Props
  categoryId?: string;
  baseModelId?: number;
  isSelected?: boolean;
  disabled?: boolean;
  loading?: boolean;
  
  // Display Props
  variant?: 'default' | 'compact' | 'featured' | 'accessibility';
  size?: 'small' | 'medium' | 'large' | 'extra-large';
  showDetails?: boolean;
  showPrice?: boolean;
  showFinancing?: boolean;
  showInsurance?: boolean;
  showCompatibility?: boolean;
  showInstallation?: boolean;
  showSafety?: boolean;
  
  // Accessibility Props
  highContrast?: boolean;
  largeText?: boolean;
  reducedMotion?: boolean;
  screenReaderOptimized?: boolean;
  
  // Interaction Props
  allowQuickAdd?: boolean;
  allowComparison?: boolean;
  allowSaving?: boolean;
  
  // Data Props
  compatibilityIssues?: CompatibilityIssue[];
  financingOptions?: FinancingOption[];
  insuranceEstimate?: InsuranceEstimate;
  
  // Event Handlers
  onToggle?: (option: ConfigurableProductSchema, categoryId?: string) => void;
  onSelect?: (option: ConfigurableProductSchema, categoryId?: string) => void;
  onDeselect?: (option: ConfigurableProductSchema, categoryId?: string) => void;
  onViewDetails?: (option: ConfigurableProductSchema) => void;
  onQuickAdd?: (option: ConfigurableProductSchema) => void;
  onCompare?: (option: ConfigurableProductSchema) => void;
  onSave?: (option: ConfigurableProductSchema) => void;
  onCheckCompatibility?: (option: ConfigurableProductSchema) => Promise<CompatibilityIssue[]>;
  onCalculateFinancing?: (option: ConfigurableProductSchema) => Promise<FinancingOption[]>;
  onCheckInsurance?: (option: ConfigurableProductSchema) => Promise<InsuranceEstimate>;
  onError?: (option: ConfigurableProductSchema, error: Error) => void;
}

// Event interfaces for type safety
export interface HSMOptionCardEvents {
  'option-toggle': {
    option: ConfigurableProductSchema;
    categoryId: string;
    isSelected: boolean;
    timestamp: Date;
  };
  'option-select': {
    option: ConfigurableProductSchema;
    categoryId: string;
    selectionMethod: 'click' | 'keyboard' | 'touch';
    timestamp: Date;
  };
  'option-deselect': {
    option: ConfigurableProductSchema;
    categoryId: string;
    timestamp: Date;
  };
  'load-options': {
    categoryId: string;
    timestamp: Date;
  };
  'category-expand': {
    categoryId: string;
    timestamp: Date;
  };
  'view-details': {
    option: ConfigurableProductSchema;
    timestamp: Date;
  };
  'check-compatibility': {
    option: ConfigurableProductSchema;
    timestamp: Date;
  };
  'compatibility-check': {
    option: ConfigurableProductSchema;
    issues: CompatibilityIssue[];
    timestamp: Date;
  };
  'compatibility-warning': {
    option: ConfigurableProductSchema;
    warning: CompatibilityIssue;
    timestamp: Date;
  };
  'compatibility-error': {
    option: ConfigurableProductSchema;
    error: CompatibilityIssue;
    timestamp: Date;
  };
  'financing-change': {
    option: ConfigurableProductSchema;
    financingOptions: FinancingOption[];
    timestamp: Date;
  };
  'insurance-check': {
    option: ConfigurableProductSchema;
    estimate: InsuranceEstimate;
    timestamp: Date;
  };
  'error': {
    option: ConfigurableProductSchema;
    error: Error;
    context: string;
    timestamp: Date;
  };
}