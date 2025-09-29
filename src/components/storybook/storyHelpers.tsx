import { ReactNode, useEffect, useMemo, useState } from 'react';
import CartVisibilityContext from 'contexts/cartVisibilityContext';
import { CartProduct, ProductSchema } from 'lib/interfaces';
import { useCartStore } from 'stores/cartStore';

type PartialProduct = Partial<ProductSchema> & Pick<ProductSchema, 'title' | 'slug' | 'description' | 'shortDescription' | 'featuredImage' | 'productSpecifications' | 'productPictures' | 'price' | 'affiliate'>;

const baseProduct: PartialProduct = {
  title: 'Acorn 180 Stairlift',
  slug: 'acorn-180-stairlift',
  description: 'Reliable stairlift with smooth ride and customizable options.',
  shortDescription: 'A dependable solution for curved staircases.',
  featuredImage: '/temp.webp',
  productSpecifications: 'Weight capacity 300 lbs',
  productPictures: [
    { fields: { file: { url: '/temp.webp' } } },
    { fields: { file: { url: '/temp.webp' } } }
  ],
  price: 2899,
  affiliate: false
};

export const makeProduct = (overrides: Partial<ProductSchema> = {}): ProductSchema => ({
  ...baseProduct,
  productSpecifications: overrides.productSpecifications ?? baseProduct.productSpecifications,
  productPictures: overrides.productPictures ?? baseProduct.productPictures,
  price: overrides.price ?? baseProduct.price,
  affiliate: overrides.affiliate ?? baseProduct.affiliate,
  _related_options: overrides._related_options ?? [],
  _related_options_products: overrides._related_options_products ?? [],
  variations: overrides.variations ?? [],
  options: overrides.options ?? [],
  productId: overrides.productId ?? 'prod_1',
  ...overrides
});

export const makeCartProduct = (overrides: Partial<CartProduct> = {}): CartProduct => ({
  ...makeProduct(overrides),
  cartItemId: overrides.cartItemId ?? 'ci_abc123',
  quantity: overrides.quantity ?? 1,
  variationId: overrides.variationId,
  options: overrides.options ?? [
    { name: 'Installation', priceModifier: 199, quantity: 1 },
    { name: 'Extended Warranty', priceModifier: 149, quantity: 1 }
  ]
});

// Configurator-specific mock data
import { 
  ConfigurableProductSchema, 
  CompatibilityIssue, 
  FinancingOption, 
  InsuranceEstimate,
  ConfiguratorCategory 
} from 'lib/interfaces/configurator';

export const makeConfigurableProduct = (overrides: Partial<ConfigurableProductSchema> = {}): ConfigurableProductSchema => ({
  ...baseProduct,
  databaseId: overrides.databaseId ?? Math.floor(Math.random() * 1000) + 1,
  id: overrides.id ?? `product-${Math.floor(Math.random() * 1000)}`,
  name: overrides.name ?? overrides.title ?? baseProduct.title,
  image: overrides.image ?? {
    sourceUrl: overrides.featuredImage || baseProduct.featuredImage || '/temp.webp',
    altText: `${overrides.name || baseProduct.title} option image`
  },
  sku: overrides.sku ?? `SKU-${Math.floor(Math.random() * 10000)}`,
  regularPrice: overrides.regularPrice ?? overrides.price?.toString() ?? baseProduct.price.toString(),
  salePrice: overrides.salePrice,
  baseModel: overrides.baseModel ?? false,
  optionType: overrides.optionType ?? 'SAFETY',
  installationRequired: overrides.installationRequired ?? false,
  financingAvailable: overrides.financingAvailable ?? true,
  insuranceCoverage: overrides.insuranceCoverage ?? ['Medicare', 'Private Insurance'],
  safetyRating: overrides.safetyRating ?? 'A+',
  adaCompliant: overrides.adaCompliant ?? true,
  weightCapacity: overrides.weightCapacity ?? 300,
  installationTime: overrides.installationTime ?? 2,
  warrantyPeriod: overrides.warrantyPeriod ?? 24,
  ...overrides
});

// Sample mobility equipment options
export const mockSafetyRail: ConfigurableProductSchema = makeConfigurableProduct({
  name: 'Safety Rail System',
  shortDescription: 'Enhanced safety rails with anti-slip grip for secure stairlift operation.',
  price: 299,
  optionType: 'SAFETY',
  adaCompliant: true,
  safetyRating: 'A+',
  installationRequired: true,
  installationTime: 1
});

export const mockPremiumSeat: ConfigurableProductSchema = makeConfigurableProduct({
  name: 'Premium Comfort Seat',
  shortDescription: 'Ergonomic seat with memory foam padding and adjustable armrests.',
  price: 449,
  optionType: 'COMFORT',
  adaCompliant: true,
  weightCapacity: 350,
  warrantyPeriod: 36
});

export const mockProfessionalInstallation: ConfigurableProductSchema = makeConfigurableProduct({
  name: 'Professional Installation Service',
  shortDescription: 'Expert installation by certified technicians with 2-year service warranty.',
  price: 399,
  optionType: 'INSTALLATION',
  installationRequired: true,
  installationTime: 4,
  warrantyPeriod: 24
});

export const mockRemoteControl: ConfigurableProductSchema = makeConfigurableProduct({
  name: 'Wireless Remote Control',
  shortDescription: 'Convenient wireless remote with large buttons and emergency stop feature.',
  price: 129,
  optionType: 'ACCESSORY',
  adaCompliant: true,
  safetyRating: 'A'
});

export const mockBatteryBackup: ConfigurableProductSchema = makeConfigurableProduct({
  name: 'Emergency Battery Backup',
  shortDescription: 'Backup power system ensures operation during power outages.',
  price: 229,
  optionType: 'SAFETY',
  safetyRating: 'A+',
  installationRequired: true,
  installationTime: 0.5
});

// Sample categories
export const mockSafetyCategory: ConfiguratorCategory = {
  id: 'safety-features',
  name: 'Safety Features',
  slug: 'safety-features',
  description: 'Enhanced safety options for secure mobility',
  displayOrder: 1,
  required: false,
  multiSelect: true,
  options: [mockSafetyRail, mockBatteryBackup]
};

export const mockComfortCategory: ConfiguratorCategory = {
  id: 'comfort-options',
  name: 'Comfort Options',
  slug: 'comfort-options',
  description: 'Comfort enhancements for better user experience',
  displayOrder: 2,
  required: false,
  multiSelect: false,
  options: [mockPremiumSeat]
};

// Sample compatibility issues
export const mockCompatibilityIssues: CompatibilityIssue[] = [
  {
    rule: {
      id: 'conflict-1',
      name: 'Seat Compatibility',
      type: 'CONFLICTING',
      conflictingOptions: [2, 3],
      message: 'Premium seats are not compatible with basic safety rails',
      severity: 'WARNING'
    },
    affectedOptions: [2, 3],
    autoResolvable: true
  }
];

// Sample financing options
export const mockFinancingOptions: FinancingOption[] = [
  {
    id: 'plan-12',
    name: '12-Month Plan',
    monthlyPayment: 45.99,
    termMonths: 12,
    interestRate: 0.05,
    downPayment: 0,
    totalCost: 551.88
  },
  {
    id: 'plan-24',
    name: '24-Month Plan',
    monthlyPayment: 25.99,
    termMonths: 24,
    interestRate: 0.08,
    downPayment: 0,
    totalCost: 623.76
  }
];

// Sample insurance estimate
export const mockInsuranceEstimate: InsuranceEstimate = {
  estimatedCoverage: 400,
  outOfPocketCost: 99,
  coverageTypes: ['Medicare', 'Private Insurance'],
  requiresPreApproval: false
};

// Enhanced mock categories with full configuration
export const mockConfiguratorCategories: ConfiguratorCategory[] = [
  {
    ...mockSafetyCategory,
    loadingState: 'loaded',
    progressCount: { selected: 0, total: 2 },
    icon: '🛡️',
    helpText: 'Safety features are essential for secure operation',
    maxSelections: 3,
    minSelections: 1,
    required: true
  },
  {
    ...mockComfortCategory,
    loadingState: 'loaded',
    progressCount: { selected: 0, total: 1 },
    icon: '🪑',
    helpText: 'Optional comfort upgrades for enhanced experience',
    maxSelections: 1,
    required: false
  },
  {
    id: 'installation-services',
    name: 'Installation Services',
    slug: 'installation-services',
    description: 'Professional installation and setup services',
    displayOrder: 3,
    required: false,
    multiSelect: false,
    loadingState: 'loaded',
    progressCount: { selected: 0, total: 1 },
    icon: '🔧',
    helpText: 'We recommend professional installation for optimal safety',
    options: [mockProfessionalInstallation]
  }
];

// Mock base model for configurator
export const mockBaseStairlift: ConfigurableProductSchema = makeConfigurableProduct({
  databaseId: 100,
  name: 'Acorn 130 Straight Stairlift',
  shortDescription: 'Our most popular straight stairlift with proven reliability and comfort',
  regularPrice: '3495.00',
  salePrice: '2995.00',
  sku: 'ACN-130-ST',
  baseModel: true,
  configuratorCategories: mockConfiguratorCategories,
  installationRequired: true,
  financingAvailable: true,
  insuranceCoverage: ['Medicare Part B', 'Private Insurance', 'HSA/FSA'],
  adaCompliant: true,
  safetyRating: 'A+',
  weightCapacity: 300
});

// Mock configuration summary
export const mockConfigurationSummary = {
  baseModel: mockBaseStairlift,
  selectedOptions: [mockSafetyRail, mockPremiumSeat],
  totalPrice: 4994,
  basePrice: 2995,
  optionsPrice: 1499,
  installationPrice: 500,
  shippingPrice: 0,
  taxAmount: 399.52,
  deliveryEstimate: '2-3 weeks after installation appointment',
  financingOption: mockFinancingOptions[1],
  insuranceEstimate: mockInsuranceEstimate
};

// GraphQL mock queries and mutations
export const mockModelQuery = `
  query GetConfigurableModel($slug: String!) {
    product(idType: SLUG, id: $slug) {
      databaseId
      name
      shortDescription
      regularPrice
      salePrice
      image { sourceUrl altText }
      ... on ConfigurableProduct {
        baseModel
        adaCompliant
        installationRequired
        financingAvailable
        insuranceCoverage
        safetyRating
        weightCapacity
      }
    }
  }
`;

export const mockAddToCartMutation = `
  mutation AddConfigurationToCart($input: AddConfigurationToCartInput!) {
    addConfigurationToCart(input: $input) {
      success
      cartItem { key quantity total }
      errors { field message }
    }
  }
`;

// Mock GraphQL error responses
export const mockGraphQLError = {
  errors: [
    {
      message: 'Unable to load configurator data',
      extensions: { code: 'INTERNAL_ERROR', path: ['product'] }
    }
  ]
};

export const mockNetworkError = {
  errors: [
    {
      message: 'Network connection failed',
      extensions: { code: 'NETWORK_ERROR' }
    }
  ]
};

export const sampleCartItems: CartProduct[] = [
  makeCartProduct(),
  makeCartProduct({
    cartItemId: 'ci_xyz987',
    title: 'Straight Stairlift',
    slug: 'straight-stairlift',
    price: 1999,
    quantity: 2,
    variationId: 'var_size_medium',
    variations: [
      {
        id: 'var_size_medium',
        databaseId: 101,
        price: 1999,
        sku: 'STRAIGHT-MED',
        attributes: [
          { id: 'attr_1', name: 'Rail', value: 'Straight' },
          { id: 'attr_2', name: 'Finish', value: 'Bronze' }
        ]
      }
    ]
  })
];

export const useMockCartStore = (cartItems: CartProduct[] = sampleCartItems, cartVisible = true) => {
  useEffect(() => {
    const store = useCartStore.getState();
    useCartStore.setState({
      ...store,
      cart: cartItems,
      cartVisibility: cartVisible
    }, true);
    return () => {
      useCartStore.setState({
        ...store,
        cart: store.cart,
        cartVisibility: store.cartVisibility
      }, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems, cartVisible]);
};

export const CartProviders = ({
  children,
  initialCart = sampleCartItems,
  cartVisible = true
}: {
  children: ReactNode;
  initialCart?: CartProduct[];
  cartVisible?: boolean;
}) => {
  const [visible, setVisible] = useState(cartVisible);
  const toggleCartVisibility = () => setVisible((prev) => !prev);

  // Initialize Zustand store with initial cart items for Storybook
  useEffect(() => {
    if (initialCart.length > 0) {
      const { bulkAddToCart, clearCart } = useCartStore.getState();
      clearCart();
      bulkAddToCart(initialCart);
    }
  }, [initialCart]);

  return (
    <CartVisibilityContext.Provider value={{ cartVisibility: visible, toggleCartVisibility }}>
      {children}
    </CartVisibilityContext.Provider>
  );
};

export const withCartEnvironment = (cartItems: CartProduct[] = sampleCartItems, cartVisible = true) =>
  function CartEnvironmentDecorator(Story: () => ReactNode) {
    useMockCartStore(cartItems, cartVisible);
    return (
      <CartProviders initialCart={cartItems} cartVisible={cartVisible}>
        {Story()}
      </CartProviders>
    );
  };

export const sampleRichText = {
  nodeType: 'document',
  data: {},
  content: [
    {
      nodeType: 'paragraph',
      data: {},
      content: [
        {
          nodeType: 'text',
          value: 'Compact design fits most staircases with ease.',
          marks: [],
          data: {}
        }
      ]
    }
  ]
};

export const sampleHeadingsRichText = {
  nodeType: 'document',
  data: {},
  content: [
    {
      nodeType: 'heading-1',
      data: {},
      content: [
        { nodeType: 'text', value: 'Overview', marks: [], data: {} }
      ]
    },
    {
      nodeType: 'heading-2',
      data: {},
      content: [
        { nodeType: 'text', value: 'Specifications', marks: [], data: {} }
      ]
    },
    {
      nodeType: 'heading-3',
      data: {},
      content: [
        { nodeType: 'text', value: 'Warranty', marks: [], data: {} }
      ]
    }
  ]
};

export const sampleReviews = [
  {
    name: 'Amelia G.',
    rating: 5,
    title: 'Changed our lives',
    comment: 'Installation was quick and the ride is very smooth.'
  },
  {
    name: 'Jordan T.',
    rating: 4,
    title: 'Solid investment',
    comment: 'Great support team and reliable product.'
  }
];
