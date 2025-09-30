// Mock version of woocommerce.ts for Storybook
// This prevents Node.js specific imports from breaking in browser environment

export const getProducts = async (params?: any) => {
  // Return mock data for Storybook
  return {
    products: [
      {
        id: 'prod_001',
        title: 'VivaLift Ultra PLR4955S Lift Chair',
        slug: 'vivalift-ultra-plr4955s-lift-chair',
        price: 1299.99,
        featuredImage: '/temp.webp',
        productPictures: [{ fields: { file: { url: '/temp.webp' } } }],
        _related_options: ['opt_001', 'opt_002'],
        _related_options_products: [
          { id: 'opt_001', title: 'Extended Warranty', price: 199.99 },
          { id: 'opt_002', title: 'Delivery & Setup', price: 149.99 }
        ]
      },
      {
        id: 'prod_002',
        title: 'Acorn Stairlift - Basic Model',
        slug: 'acorn-stairlift-basic',
        price: 2499.99,
        featuredImage: '/temp.webp',
        productPictures: [{ fields: { file: { url: '/temp.webp' } } }],
        _related_options: ['opt_003'],
        _related_options_products: [
          { id: 'opt_003', title: 'Professional Installation', price: 299.99 }
        ]
      }
    ],
    totalCount: 2,
    hasNextPage: false,
    hasPreviousPage: false
  };
};

export const getProduct = async (slug: string) => {
  // Return mock product data
  return {
    id: 'prod_001',
    title: 'VivaLift Ultra PLR4955S Lift Chair',
    slug: slug,
    price: 1299.99,
    description: 'The VivaLift Ultra PLR4955S is a premium lift chair designed for maximum comfort and safety.',
    featuredImage: '/temp.webp',
    productPictures: [
      { fields: { file: { url: '/temp.webp' } } },
      { fields: { file: { url: '/temp.webp' } } }
    ],
    variations: [
      { id: 'var_001', name: 'Fabric', options: ['Beige', 'Brown', 'Gray'] },
      { id: 'var_002', name: 'Size', options: ['Small', 'Medium', 'Large'] }
    ],
    _related_options: ['opt_001', 'opt_002'],
    _related_options_products: [
      { 
        id: 'opt_001', 
        title: 'Extended Warranty - 5 Year', 
        price: 199.99,
        description: 'Extended warranty coverage for 5 years',
        image: '/temp.webp'
      },
      { 
        id: 'opt_002', 
        title: 'Professional Delivery & Setup', 
        price: 149.99,
        description: 'White-glove delivery and professional installation',
        image: '/temp.webp'
      }
    ]
  };
};

export const getProductVariations = async (productId: string) => {
  // Return mock variations
  return [
    {
      id: 'var_001',
      name: 'Fabric',
      options: [
        { id: 'opt_beige', name: 'Beige', price: 0 },
        { id: 'opt_brown', name: 'Brown', price: 0 },
        { id: 'opt_gray', name: 'Gray', price: 0 }
      ]
    },
    {
      id: 'var_002',
      name: 'Size',
      options: [
        { id: 'opt_small', name: 'Small', price: 0 },
        { id: 'opt_medium', name: 'Medium', price: 0 },
        { id: 'opt_large', name: 'Large', price: 0 }
      ]
    }
  ];
};

export const getRelatedOptions = async (productId: string) => {
  // Return mock related options
  return [
    {
      id: 'opt_001',
      title: 'Extended Warranty - 5 Year',
      price: 199.99,
      description: 'Extended warranty coverage for 5 years',
      image: '/temp.webp'
    },
    {
      id: 'opt_002',
      title: 'Professional Delivery & Setup',
      price: 149.99,
      description: 'White-glove delivery and professional installation',
      image: '/temp.webp'
    },
    {
      id: 'opt_003',
      title: 'Maintenance Package',
      price: 99.99,
      description: 'Annual maintenance and cleaning service',
      image: '/temp.webp'
    }
  ];
};

// Additional mock functions that are imported by components
export const fetchRelatedProductsByIds = async (ids: string[]) => {
  console.warn('fetchRelatedProductsByIds is deprecated. Use fetchProductsByIds(ids, { format: "display" }) instead.');
  console.log('Mock fetchRelatedProductsByIds:', ids);
  return [
    {
      id: 'opt_001',
      title: 'Extended Warranty - 5 Year',
      price: 199.99,
      description: 'Extended warranty coverage for 5 years',
      image: '/temp.webp'
    },
    {
      id: 'opt_002',
      title: 'Professional Delivery & Setup',
      price: 149.99,
      description: 'White-glove delivery and professional installation',
      image: '/temp.webp'
    }
  ];
};

export const fetchProductsByDatabaseIds = async (ids: string[]) => {
  console.log('Mock fetchProductsByDatabaseIds:', ids);
  return [
    {
      id: 'prod_001',
      title: 'VivaLift Ultra PLR4955S Lift Chair',
      slug: 'vivalift-ultra-plr4955s-lift-chair',
      price: 1299.99,
      featuredImage: '/temp.webp',
      productPictures: [{ fields: { file: { url: '/temp.webp' } } }]
    }
  ];
};

export const fetchGraphQLProducts = async (query: string, variables?: any) => {
  console.log('Mock fetchGraphQLProducts:', { query, variables });
  return {
    products: {
      nodes: [
        {
          id: 'prod_001',
          title: 'VivaLift Ultra PLR4955S Lift Chair',
          slug: 'vivalift-ultra-plr4955s-lift-chair',
          price: 1299.99,
          featuredImage: { node: { sourceUrl: '/temp.webp' } }
        }
      ]
    }
  };
};

// Mock GraphQL client
export const client = {
  request: async (query: string, variables?: any) => {
    console.log('Mock GraphQL request:', { query, variables });
    return { data: {} };
  }
};

// Mock environment variables
export const WP_GRAPHQL_URL = '';
export const NEXT_PUBLIC_WP_GRAPHQL_URL = '';