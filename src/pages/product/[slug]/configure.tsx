import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import ModelConfigurator from 'components/configurator/ModelConfigurator';
import { ConfigurableProductSchema, ConfiguratorCategory, SavedConfigurationExtended } from 'lib/interfaces/configurator';
import { getProductBySlug } from 'lib/contentful/contentful';
import { sanitizeConfigurableProduct, sanitizeSSRProps } from 'lib/utils/product-sanitizer';
import { extractImageUrl } from 'lib/utils/image';
import { LoadingOverlay } from 'components/ui';
import { useConfiguratorStore } from 'stores/configuratorStore';

interface ConfigurePageProps {
  baseModel: ConfigurableProductSchema | null;
  categories: ConfiguratorCategory[];
  error?: string;
  isEditMode?: boolean;
  editSessionData?: {
    cartItemId: string;
    sessionId: string;
    isEditMode: boolean;
  };
  seoMeta?: {
    title: string;
    description: string;
  };
}

const ConfigurePage: React.FC<ConfigurePageProps> = ({
  baseModel,
  categories,
  error,
  isEditMode = false,
  editSessionData,
  seoMeta
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const clearAllState = useConfiguratorStore(state => state.clearAllState);

  // Load edit session data on mount if in edit mode
  useEffect(() => {
    if (isEditMode && editSessionData?.sessionId) {
      console.log('🔧 Loading edit session data for session:', editSessionData.sessionId);
      
      try {
        const storedSessionData = localStorage.getItem(`hsm_edit_session_${editSessionData.sessionId}`);
        if (storedSessionData) {
          const parsedSessionData = JSON.parse(storedSessionData);
          console.log('🔧 Loaded edit session data from localStorage:', parsedSessionData);
          
          // Validate session data matches current context
          if (parsedSessionData.cartItemId === editSessionData.cartItemId &&
              parsedSessionData.productSlug === router.query.slug) {
            console.log('🔧 Edit session data validated successfully');
          } else {
            console.warn('🔧 Edit session data mismatch:', {
              stored: parsedSessionData,
              current: editSessionData
            });
          }
        } else {
          console.warn('🔧 No edit session data found in localStorage for session:', editSessionData.sessionId);
        }
      } catch (error) {
        console.error('🔧 Error loading edit session data:', error);
      }
    }
  }, [isEditMode, editSessionData?.sessionId, editSessionData?.cartItemId, router.query.slug]);

  // Handle add to cart - use WooCommerce data directly
  const handleAddToCart = async (configuration: any) => {
    setLoading(true);
    try {
      // Use the cart store directly with WooCommerce product data
      const { useCartStore } = await import('stores/cartStore');
      const { addToCart, replaceCartItem } = useCartStore.getState();
      
      // Calculate total price from base product + selected options
      const selectedOptions = configuration.selectedOptions || [];
      const basePrice = baseModel?.price || 0;
      const optionsTotal = selectedOptions.reduce((sum: number, option: any) => {
        const price = typeof option.price === 'number' ? option.price : parseFloat(option.price || '0');
        return sum + (price * (option.quantity || 1));
      }, 0);
      const totalPrice = basePrice + optionsTotal;
      
      // Create cart item from WooCommerce product data matching CartProduct interface
      const cartItem = {
        // ProductSchema required fields
        title: baseModel?.name || baseModel?.title || '',
        slug: baseModel?.slug || '',
        description: baseModel?.description || '',
        shortDescription: baseModel?.shortDescription || '',
        featuredImage: baseModel?.image?.sourceUrl || baseModel?.featuredImage || '',
        productSpecifications: baseModel?.productSpecifications || '',
        productPictures: baseModel?.productPictures || [],
        price: totalPrice,
        affiliate: baseModel?.affiliate || false,
        productId: baseModel?.productId,
        
        // CartProduct specific fields
        quantity: 1,
        options: selectedOptions.map((option: any) => ({
          name: option.name || option.title || '',
          type: option.optionType || 'option',
          priceModifier: parseFloat(option.price || '0'),
          selected: true,
          quantity: option.quantity || 1,
          value: option.slug || option.id
        })),
        
        // Additional fields from baseModel
        variations: baseModel?.variations || [],
        _related_options: baseModel?._related_options || [],
        _related_options_products: baseModel?._related_options_products || []
      };
      
      // Check if we're in edit mode
      if (isEditMode && editSessionData?.cartItemId) {
        // Replace existing cart item instead of adding duplicate
        replaceCartItem(editSessionData.cartItemId, cartItem);
        console.log('Replaced existing cart item:', editSessionData.cartItemId);
      } else {
        // Add new item to cart (with duplicate checking)
        addToCart(cartItem);
      }
      
      // Navigate to cart on success
      router.push('/cart?added=true');
    } catch (error) {
      console.error('Failed to add configuration to cart:', error);
      // TODO: Show error notification using SessionContext
    } finally {
      setLoading(false);
    }
  };

  // Handle save configuration - use local storage or implement WooCommerce save
  const handleSaveConfiguration = async (name: string, notes?: string): Promise<SavedConfigurationExtended> => {
    try {
      // For now, save configuration to local storage until WooCommerce save endpoint is implemented
      const configId = `config_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const savedConfig = {
        id: configId,
        name,
        notes: notes || '',
        createdAt: new Date().toISOString(),
        modelSlug: baseModel?.slug || '',
        modelName: baseModel?.name || '',
        // TODO: Get actual selected options from configurator component state
        selectedOptions: [],
        basePrice: baseModel?.price || 0,
        totalPrice: baseModel?.price || 0
      };
      
      // Store in localStorage for now
      const existingConfigs = JSON.parse(localStorage.getItem('savedConfigurations') || '[]');
      existingConfigs.push(savedConfig);
      localStorage.setItem('savedConfigurations', JSON.stringify(existingConfigs));
      
      // Convert to extended format expected by component
      return {
        ...savedConfig,
        baseModel: baseModel!,
        updatedAt: savedConfig.createdAt,
      };
    } catch (error) {
      console.error('Failed to save configuration:', error);
      throw error;
    }
  };

  // Handle share configuration - create shareable URL from current state
  const handleShareConfiguration = async () => {
    try {
      // Create shareable URL with current product configuration
      // TODO: Include actual selected options in URL params when configurator state is available
      const shareUrl = `${window.location.origin}/product/${baseModel?.slug}/configure`;
      
      if (navigator.share) {
        await navigator.share({
          title: `${baseModel?.name} Configuration`,
          text: 'Check out my mobility solution configuration',
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        // TODO: Show success toast - URL copied to clipboard
        console.log('Configuration URL copied to clipboard:', shareUrl);
      }
    } catch (error) {
      console.error('Failed to share configuration:', error);
      throw error;
    }
  };

  // Handle category options loading - use the same WooCommerce data source
  const handleFetchCategoryOptions = async (categoryId: string): Promise<ConfigurableProductSchema[]> => {
    console.log(`🔧 Fetching options for category: ${categoryId}`);
    
    // Find the category in the already-loaded categories from WooCommerce
    const category = categories.find(cat => cat.id === categoryId);
    
    if (category && category.options && category.options.length > 0) {
      console.log(`🔧 Found ${category.options.length} options for category ${categoryId}`);
      // Return the options that were already fetched from WooCommerce in getServerSideProps
      return category.options;
    }
    
    // If category exists but has no options, try to reload the related options
    if (category && (!category.options || category.options.length === 0)) {
      console.log(`🔧 Category ${categoryId} found but has no options, attempting to reload...`);
      
      try {
        // Re-fetch related products if they exist
        if (baseModel && baseModel._related_options && baseModel._related_options.length > 0) {
          const { fetchOptionProductsByIds } = await import('../../../lib/woocommerce');
          const relatedProducts = await fetchOptionProductsByIds(baseModel._related_options);
          
          console.log(`🔧 Re-fetched ${relatedProducts.length} related products`);
          
          // Filter products that would belong to this category
          const categoryProducts = relatedProducts.filter((product: any) => {
            const nameParts = product.name.split(' - ');
            const productCategoryName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : 'Options';
            const productCategoryId = productCategoryName.toLowerCase().replace(/\s+/g, '-');
            return productCategoryId === categoryId;
          });
          
          console.log(`🔧 Found ${categoryProducts.length} products for category ${categoryId}`);
          return categoryProducts;
        }
      } catch (error) {
        console.error(`🔧 Error re-fetching options for category ${categoryId}:`, error);
      }
    }
    
    // If category not found, return empty array
    console.warn(`🔧 Category ${categoryId} not found in pre-loaded WooCommerce data`);
    return [];
  };

  // Handle configuration save for edit mode
  const handleConfigurationSave = async (config: any) => {
    if (!isEditMode || !editSessionData?.cartItemId) {
      console.warn('handleConfigurationSave called outside edit mode');
      return;
    }

    try {
      setLoading(true);
      
      // Import cart store dynamically to avoid SSR issues
      const { useCartStore } = await import('stores/cartStore');
      const { updateCartItem } = useCartStore.getState();
      
      // Calculate updated price
      const selectedOptions = config.selectedOptions || [];
      const basePrice = baseModel?.price || 0;
      const optionsTotal = selectedOptions.reduce((sum: number, option: any) => {
        const price = typeof option.price === 'number' ? option.price : parseFloat(option.price || '0');
        return sum + (price * (option.quantity || 1));
      }, 0);
      const totalPrice = basePrice + optionsTotal;
      
      // Update cart item with new configuration
      updateCartItem(editSessionData.cartItemId, {
        options: selectedOptions,
        price: totalPrice,
        // Store configuration metadata in description for now
        description: `${baseModel?.description || ''} [Last configured: ${new Date().toLocaleString()}]`
      });
      
            // TODO: End edit session - implement proper session management
      // For now, we'll just log that the session should be ended
      if (editSessionData.sessionId) {
        console.log('Edit session should be ended:', editSessionData.sessionId);
      }
      
      // TODO: Show success notification - implement proper notification system
      console.log('Configuration saved successfully!');
      
      // Navigate back to cart
      router.push('/cart?updated=' + encodeURIComponent(editSessionData.cartItemId));
    } catch (error) {
      console.error('Failed to save edited configuration:', error);
      // Handle error - could show toast notification
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Handle edit session completion
  const handleEditSessionComplete = async (cartItemId: string, updatedConfig: any) => {
    try {
      await handleConfigurationSave(updatedConfig);
    } catch (error) {
      console.error('Failed to complete edit session:', error);
      // Fallback - just return to cart
      router.push('/cart');
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
      
      {/* Loading Overlay */}
      <LoadingOverlay
        show={loading}
        variant="overlay"
        message="Processing your configuration..."
        ariaLabel="Loading configuration"
      />
      
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
              {isEditMode ? 'Edit Configuration' : 'Configure Your'} {baseModel.name}
            </h1>
            <p className="text-lg text-gray-600">
              {isEditMode 
                ? 'Modify your existing configuration and save changes to your cart'
                : 'Customize your mobility solution with our comprehensive configuration options'
              }
            </p>
            {isEditMode && (
              <div className="flex items-center gap-2 text-sm text-blue-600 mt-2">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                <span>You&apos;re editing an item from your cart. Changes will be saved automatically.</span>
              </div>
            )}
          </div>

          {/* Debug Clear Button */}
          <div className="mb-4">
            <button
              onClick={() => {
                console.log('🔧 Manual configurator state clear triggered');
                clearAllState();
              }}
              className="text-sm text-red-600 hover:text-red-800 underline"
            >
              Clear Configurator State
            </button>
          </div>

          {/* ModelConfigurator Component */}
          <ModelConfigurator
            baseModel={baseModel}
            categories={categories}
            loading={loading}
            // Edit mode props
            editSessionId={editSessionData?.sessionId}
            cartItemId={editSessionData?.cartItemId}
            isEditMode={isEditMode}
            // initialConfiguration will be loaded client-side for edit mode
            initialConfiguration={undefined}
            // Event handlers
            onAddToCart={handleAddToCart}
            onSaveConfiguration={handleSaveConfiguration}
            onConfigurationSave={handleConfigurationSave}
            onEditSessionComplete={handleEditSessionComplete}
            onShareConfiguration={handleShareConfiguration}
            onFetchCategoryOptions={handleFetchCategoryOptions}
            onConfigurationChange={(config) => {
              // TODO: Track configuration changes for analytics
            }}
          />
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { params, query } = context;
  const slug = params?.slug as string;
  
  // Parse query parameters for edit session
  const isEditMode = query?.edit === 'true';
  const cartItemId = query?.cartItemId as string;
  const sessionId = query?.sessionId as string;

  if (!slug) {
    return {
      notFound: true,
    };
  }

  try {
    // Fetch the base model directly from WooCommerce - single source of truth
    const { fetchGraphQLProducts } = await import('../../../lib/woocommerce');
    const allProducts = await fetchGraphQLProducts();
    
    // Find product by slug from WooCommerce data
    const product = allProducts.find((p: any) => p.slug === slug);
    
    if (!product) {
      console.error(`Product with slug "${slug}" not found in WooCommerce data`);
      return {
        props: sanitizeSSRProps({
          baseModel: null,
          categories: [],
          error: 'Product not found'
        })
      };
    }

    // Check if this is an option product (has relatedOptions pointing to main product)
    if (product._related_options && product._related_options.length > 0) {
      // This is an option product - find the main product it belongs to
      const mainProductId = product._related_options[0];
      const mainProduct = allProducts.find((p: any) => p.databaseId === mainProductId);
      
      if (mainProduct) {
        console.log(`Product "${slug}" is an option for main product "${mainProduct.slug}". Redirecting to main product configuration.`);
        return {
          redirect: {
            destination: `/product/${mainProduct.slug}/configure`,
            permanent: false,
          }
        };
      }
    }

    console.log(`Found product for configure page:`, product.name, `ID: ${product.databaseId}`);
    
    // Convert WooCommerce product to ProductSchema format first
    const { mapWooToProductSchema } = await import('../../../lib/contentful/contentful');
    const mappedProduct = mapWooToProductSchema(product);
    
    console.log(`Mapped product:`, mappedProduct.title, `Related options: ${mappedProduct._related_options?.length || 0}`);

    // Convert WooCommerce product to ConfigurableProductSchema
    const baseModel: ConfigurableProductSchema = {
      id: mappedProduct.productId || mappedProduct.slug,
      databaseId: mappedProduct.productId ? parseInt(mappedProduct.productId) : undefined,
      name: mappedProduct.title,
      slug: mappedProduct.slug,
      title: mappedProduct.title,
      description: mappedProduct.description || '',
      shortDescription: mappedProduct.shortDescription || '',
      featuredImage: mappedProduct.featuredImage,
      image: mappedProduct.featuredImage ? {
        sourceUrl: extractImageUrl(mappedProduct.featuredImage) || '',
        altText: `${mappedProduct.title} image`
      } : undefined,
      price: typeof mappedProduct.price === 'number' ? mappedProduct.price : parseFloat(String(mappedProduct.price || '0')),
      regularPrice: mappedProduct.price ? String(typeof mappedProduct.price === 'number' ? mappedProduct.price : parseFloat(String(mappedProduct.price || '0'))) : undefined,
      // salePrice will be sanitized by sanitizeConfigurableProduct - don't set to undefined
      // sku will be sanitized by sanitizeConfigurableProduct
      // type: 'configurable',
      affiliate: mappedProduct.affiliate || false,
      productId: mappedProduct.productId,

      // Configurator-specific fields
      baseModel: true,
      configuratorCategories: [],
      compatibilityRules: [],
      installationRequired: false,
      financingAvailable: false,
      insuranceCoverage: [],
      // safetyRating will be sanitized by sanitizeConfigurableProduct
      adaCompliant: false,
      // weightCapacity will be sanitized by sanitizeConfigurableProduct
      // Additional fields
      productPictures: mappedProduct.productPictures || [],
      variations: [], // Variations will be loaded separately
      options: mappedProduct.options || [],
      _related_options: mappedProduct._related_options || [],
      productSpecifications: mappedProduct.productSpecifications || ''
    };

    // Fetch configuration categories from WooCommerce related options
    let categories: ConfiguratorCategory[] = [];
    
    try {
      // Use the WooCommerce data that was already fetched
      if (mappedProduct._related_options && mappedProduct._related_options.length > 0) {
        console.log(`Processing ${mappedProduct._related_options.length} related options for product ${mappedProduct.title}`);
        
        // Fetch the actual option products using fetchOptionProductsByIds since they are VARIABLE products
        // not included in the SIMPLE products from fetchGraphQLProducts
        const { fetchOptionProductsByIds } = await import('../../../lib/woocommerce');
        const relatedProducts = await fetchOptionProductsByIds(mappedProduct._related_options);
        
        console.log(`Found ${relatedProducts.length} related products:`, relatedProducts.map((p: any) => p.name));
        
        // Group related products into configuration categories
        const categoryMap = new Map<string, ConfigurableProductSchema[]>();
        
        relatedProducts.forEach((relatedProduct: any) => {
          // Only extract category from explicit "Product Name - Category" pattern
          const nameParts = relatedProduct.name.split(' - ');
          let categoryName = '';
          
          if (nameParts.length > 1) {
            // Use the last part as category name only if it's explicit
            categoryName = nameParts[nameParts.length - 1].trim();
            console.log(`🔧 Found explicit category "${categoryName}" for product "${relatedProduct.name}"`);
          } else {
            // Skip products that don't have explicit category indicators
            // This prevents generic categories like "Warranty", "Fabric Color", etc. from being created
            console.warn(`🔧 Skipping product "${relatedProduct.name}" - no explicit category pattern (Product Name - Category)`);
            return;
          }
          
          // Validate that this is a legitimate category (not generic)
          if (categoryName && categoryName !== 'Options' && categoryName.length > 0) {
            // Additional validation to prevent generic categories
            const genericCategories = ['warranty', 'delivery', 'installation', 'customization', 'service', 'fabric', 'color', 'factory', 'options'];
            if (genericCategories.includes(categoryName.toLowerCase())) {
              console.warn(`🔧 Skipping generic category "${categoryName}" for product "${relatedProduct.name}"`);
              return;
            }
            
            // Option products from fetchOptionProductsByIds are already in ConfigurableProductSchema format
            if (!categoryMap.has(categoryName)) {
              categoryMap.set(categoryName, []);
            }
            categoryMap.get(categoryName)!.push(relatedProduct);
            console.log(`🔧 Added "${relatedProduct.name}" to category "${categoryName}"`);
          } else {
            console.warn(`🔧 Skipping product "${relatedProduct.name}" - invalid category name: "${categoryName}"`);
          }
        });
        
        // Convert category map to ConfiguratorCategory array with validation
        let displayOrder = 0;
        categories = Array.from(categoryMap.entries())
          .filter(([categoryName, options]) => {
            // Validate that category has legitimate options
            const validOptions = options.filter(option => {
              // Ensure option belongs to this product
              const belongsToProduct = (mappedProduct.productId && option._related_options?.includes(mappedProduct.productId)) || 
                                     (mappedProduct.productId && option.compatibleBaseModels?.includes(parseInt(mappedProduct.productId))) ||
                                     option.productId === mappedProduct.productId?.toString();
              
              if (!belongsToProduct) {
                console.warn(`🔧 Option "${option.name}" does not belong to product "${mappedProduct.title}"`);
                return false;
              }
              
              // Ensure option has valid data
              const hasValidData = option.name && option.name.trim().length > 0 && 
                                  option.price !== undefined && option.price !== null;
              
              if (!hasValidData) {
                console.warn(`🔧 Option "${option.name}" has invalid data`);
                return false;
              }
              
              return true;
            });
            
            if (validOptions.length === 0) {
              console.warn(`🔧 Category "${categoryName}" has no valid options for product "${mappedProduct.title}"`);
              return false;
            }
            
            return true;
          })
          .map(([categoryName, options]) => {
            // Filter options to only include valid ones
            const validOptions = options.filter(option => {
              const belongsToProduct = (mappedProduct.productId && option._related_options?.includes(mappedProduct.productId)) || 
                                     (mappedProduct.productId && option.compatibleBaseModels?.includes(parseInt(mappedProduct.productId))) ||
                                     option.productId === mappedProduct.productId?.toString();
              const hasValidData = option.name && option.name.trim().length > 0 && 
                                option.price !== undefined && option.price !== null;
              return belongsToProduct && hasValidData;
            });
            
            return {
              id: categoryName.toLowerCase().replace(/\s+/g, '-'),
              name: categoryName,
              slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
              description: `${categoryName} for ${mappedProduct.title}`,
              displayOrder: displayOrder++,
              required: false,
              multiSelect: false,
              options: validOptions,
              maxSelections: 1,
              minSelections: 0,
              loadingState: 'loaded' as const,
              icon: '',
              helpText: `Choose from available ${categoryName.toLowerCase()} options`,
              collapsed: false
            };
          });
        
        console.log(`Found ${categories.length} configuration categories from WooCommerce data:`, categories.map(c => c.name));
      } else {
        console.warn('No related options found for product:', mappedProduct.slug);
        // Still allow configuration with empty categories - the configurator can handle this
        categories = [];
      }
      
    } catch (error) {
      console.error('Error processing WooCommerce configuration data:', error);
      // Don't fail completely - allow configuration with empty categories
      categories = [];
    }

    // Validate edit session if in edit mode
    // Note: Cart item lookup must be done client-side due to SSR limitations
    // The cart uses localStorage which isn't available during server-side rendering
    let cartItemConfiguration = null;
    if (isEditMode) {
      if (!cartItemId || !sessionId) {
        return {
          redirect: {
            destination: '/cart?error=invalid_edit_params',
            permanent: false,
          }
        };
      }
      
      // For edit mode, we'll pass the cartItemId to the client and let it handle
      // the configuration loading after hydration. This avoids SSR cart access issues.
      if (process.env.NODE_ENV === 'development') {
        console.log('Edit mode detected - cart item configuration will be loaded client-side');
      }
    }

    const seoMeta = {
      title: isEditMode ? `Edit Configuration | ${mappedProduct.title}` : `Configure ${mappedProduct.title} | HSMobility`,
      description: isEditMode 
        ? `Edit your ${mappedProduct.title} configuration`
        : `Customize your ${mappedProduct.title} with our comprehensive configuration options. Choose from safety features, comfort options, installation services, and accessories.`
    };

    // Sanitize baseModel to prevent SSR serialization errors
    const sanitizedBaseModel = sanitizeConfigurableProduct(baseModel);

    return {
      props: sanitizeSSRProps({
        baseModel: sanitizedBaseModel,
        categories,
        seoMeta,
        isEditMode,
        editSessionData: isEditMode ? {
          cartItemId,
          sessionId,
          isEditMode: true
        } : null,
        error: null
      })
    };

  } catch (error) {
    return {
      props: sanitizeSSRProps({
        baseModel: null,
        categories: [],
        error: 'Failed to load configuration options'
      })
    };
  }
};

export default ConfigurePage;