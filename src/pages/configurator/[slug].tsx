import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import ModelConfigurator from 'components/configurator/ModelConfigurator';
import { ConfigurableProductSchema, ConfiguratorCategory } from 'lib/interfaces/configurator';
import { getProductBySlug } from 'lib/contentful/contentful';
import { fetchProductsByDatabaseIds } from 'lib/woocommerce';
import { configuratorAPI } from 'lib/graphql/configurator';

interface ConfiguratorPageProps {
  baseModel: ConfigurableProductSchema | null;
  categories: ConfiguratorCategory[];
  error?: string;
  seoMeta?: {
    title: string;
    description: string;
  };
}

const ConfiguratorPage: React.FC<ConfiguratorPageProps> = ({
  baseModel,
  categories,
  error,
  seoMeta
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Handle add to cart
  const handleAddToCart = async (configuration: any) => {
    setLoading(true);
    try {
      // Use GraphQL to add configuration to cart
      const result = await configuratorAPI.addConfigurationToCart({
        baseProductId: baseModel?.databaseId || 1,
        optionIds: configuration.selectedOptions?.map((opt: any) => opt.databaseId) || [],
        configurationName: configuration.name || `Configured ${baseModel?.name}`,
        customerNotes: configuration.notes || '',
      });

      if (result.addConfigurationToCart.errors?.length > 0) {
        throw new Error(result.addConfigurationToCart.errors[0].message);
      }

      router.push('/cart');
    } catch (error) {
      console.error('Failed to add configuration to cart:', error);
      // TODO: Show error notification
      alert('Failed to add configuration to cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle save configuration
  const handleSaveConfiguration = async (name: string, notes?: string) => {
    try {
      // TODO: Implement save configuration functionality
      console.log('Saving configuration:', { name, notes });
      
      // Return proper SavedConfigurationExtended format
      return {
        id: `config_${Date.now()}`,
        name,
        notes: notes || '',
        baseModel: baseModel!,
        selectedOptions: [], // TODO: Get from configurator state
        totalPrice: baseModel?.price || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to save configuration:', error);
      throw error;
    }
  };

  // Handle share configuration
  const handleShareConfiguration = (configuration: any) => {
    // TODO: Implement share functionality
    console.log('Sharing configuration:', configuration);
  };

  // Handle fetching category options - this was missing!
  const handleFetchCategoryOptions = async (categoryId: string): Promise<ConfigurableProductSchema[]> => {
    try {
      console.log('Fetching options for category:', categoryId);
      
      // Find the category to get its options
      const category = categories.find(c => c.id === categoryId);
      if (!category) {
        console.warn('Category not found:', categoryId);
        return [];
      }

      // If options are already loaded from GraphQL, return them
      if (category.options && category.options.length > 0) {
        console.log(`Using pre-loaded options for category ${categoryId}:`, category.options.length);
        return category.options;
      }

      // Fallback: if no options are pre-loaded, try to fetch using related option IDs
      // This handles cases where we have product IDs but need to fetch the full product data
      if (category.options && category.options.length === 0) {
        console.log('No options found for category:', categoryId);
        return [];
      }

      // If we have partial data (just IDs), fetch full product details
      const optionIds = category.options?.map(opt => opt.databaseId).filter((id): id is number => typeof id === 'number') || [];
      if (optionIds.length > 0) {
        console.log(`Fetching full product details for ${optionIds.length} options`);
        const products = await fetchProductsByDatabaseIds(optionIds);
        
        // Convert to ConfigurableProductSchema format
        const options: ConfigurableProductSchema[] = products.map(product => ({
          id: product.id || product.productId || product.slug,
          databaseId: product.databaseId || (product.productId ? parseInt(product.productId) : undefined),
          name: product.name || product.title,
          slug: product.slug,
          title: product.title || product.name,
          description: product.description || '',
          shortDescription: product.shortDescription || '',
          featuredImage: product.featuredImage || product.image?.sourceUrl,
          image: product.image || (product.featuredImage ? {
            sourceUrl: product.featuredImage,
            altText: `${product.title || product.name} image`
          } : undefined),
          price: typeof product.price === 'number' ? product.price : parseFloat(product.price || '0'),
          regularPrice: product.regularPrice || product.price?.toString(),
          salePrice: product.salePrice,
          sku: product.sku,
          affiliate: product.affiliate || false,
          productId: product.productId || product.databaseId,
          
          // Option-specific fields
          baseModel: false,
          configuratorCategories: [],
          compatibilityRules: product.compatibilityRules || [],
          
          // Additional fields
          productPictures: product.productPictures || [],
          productSpecifications: product.productSpecifications || '',
          variations: product.variations || [],
          options: product.options || [],
          _related_options: product._related_options || [],
          _related_options_products: product._related_options_products || []
        }));

        console.log(`Fetched ${options.length} option products for category ${categoryId}`);
        return options;
      }

      console.log('No option data found for category:', categoryId);
      return [];
    } catch (error) {
      console.error('Failed to fetch category options:', error);
      throw error;
    }
  };

  if (error || !baseModel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Configuration Unavailable</h3>
            <p className="text-red-700 mb-4">
              {error || 'The requested product could not be found or configured.'}
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {seoMeta && (
        <Head>
          <title>{seoMeta.title}</title>
          <meta name="description" content={seoMeta.description} />
        </Head>
      )}
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <button
                  onClick={() => router.push('/')}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li>
                <button
                  onClick={() => router.push(`/product/${baseModel.slug}`)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {baseModel.name}
                </button>
              </li>
              <li>
                <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li>
                <span className="text-gray-900 font-medium">Configure</span>
              </li>
            </ol>
          </nav>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Configure Your {baseModel.name}
            </h1>
            <p className="text-lg text-gray-600">
              Customize your mobility solution with our comprehensive configuration options
            </p>
          </div>

          {/* ModelConfigurator Component */}
          <ModelConfigurator
            baseModel={baseModel}
            categories={categories}
            loading={loading}
            onAddToCart={handleAddToCart}
            onSaveConfiguration={handleSaveConfiguration}
            onShareConfiguration={handleShareConfiguration}
            onFetchCategoryOptions={handleFetchCategoryOptions}
            onConfigurationChange={(config) => {
              // TODO: Track configuration changes for analytics
              console.log('Configuration changed:', config);
            }}
          />
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { params } = context;
  const slug = params?.slug as string;

  if (!slug) {
    return {
      notFound: true,
    };
  }

  try {
    // Try to fetch from GraphQL first, fallback to Contentful
    let product;
    let categories: ConfiguratorCategory[] = [];

    try {
      const graphqlResult = await configuratorAPI.getModelWithCategories(slug);
      if (graphqlResult && 'data' in graphqlResult && graphqlResult.data) {
        product = graphqlResult.data.product;
        categories = product?.configuratorCategories || [];
      } else {
        throw new Error('No data returned from GraphQL');
      }
    } catch (graphqlError) {
      console.warn('GraphQL fetch failed, falling back to Contentful:', graphqlError);
      
      // Fallback to Contentful
      product = await getProductBySlug(slug);
      
      if (!product) {
        return {
          props: {
            baseModel: null,
            categories: [],
            error: 'Product not found'
          }
        };
      }
    }

    // Convert product to ConfigurableProductSchema (handles both GraphQL and Contentful)
    const baseModel: ConfigurableProductSchema = {
      id: product.id || product.productId || product.slug,
      databaseId: product.databaseId || (product.productId ? parseInt(product.productId) : undefined),
      name: product.name || product.title,
      slug: product.slug,
      title: product.title || product.name,
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      featuredImage: product.featuredImage || product.image?.sourceUrl,
      image: product.image || (product.featuredImage ? {
        sourceUrl: product.featuredImage,
        altText: `${product.title || product.name} image`
      } : undefined),
      price: typeof product.price === 'number' ? product.price : parseFloat(product.price || '0'),
      regularPrice: product.regularPrice || product.price?.toString(),
      salePrice: product.salePrice,
      sku: product.sku,
      affiliate: product.affiliate || false,
      productId: product.productId || product.databaseId,
      
      // Configurator-specific fields
      baseModel: true,
      configuratorCategories: product.configuratorCategories || [],
      compatibilityRules: product.compatibilityRules || [],
      installationRequired: product.installationRequired || false,
      financingAvailable: product.financingAvailable || false,
      insuranceCoverage: product.insuranceCoverage || [],
      safetyRating: product.safetyRating,
      adaCompliant: product.adaCompliant || false,
      weightCapacity: product.weightCapacity,
      
      // Additional fields
      productPictures: product.productPictures || [],
      productSpecifications: product.productSpecifications || '',
      variations: product.variations || [],
      options: product.options || [],
      _related_options: product._related_options || [],
      _related_options_products: product._related_options_products || []
    };

    // Ensure categories are available from live endpoint only
    if (categories.length === 0) {
      // If no categories are available from GraphQL, return error instead of mock data
      console.error('No configuration categories available for product:', product.slug || product.id);
      return {
        props: {
          baseModel: null,
          categories: [],
          error: 'Product configuration is currently unavailable. Please try again later or contact support for assistance.'
        }
      };
    }

    // TODO: Populate categories with actual options from related products
    // This would typically involve fetching from WooCommerce or GraphQL

    const seoMeta = {
      title: `Configure ${product.title} | HSMobility`,
      description: `Customize your ${product.title} with our comprehensive configuration options. Choose from safety features, comfort options, installation services, and accessories.`
    };

    return {
      props: {
        baseModel,
        categories,
        seoMeta,
        error: null
      }
    };

  } catch (error) {
    console.error('Error loading configurator page:', error);
    return {
      props: {
        baseModel: null,
        categories: [],
        error: 'Failed to load configuration options'
      }
    };
  }
};

export default ConfiguratorPage;