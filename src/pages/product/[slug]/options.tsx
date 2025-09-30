import { GetServerSideProps } from 'next';
import Head from 'next/head';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import ModelConfigurator from 'components/configurator/ModelConfigurator';
import { ConfigurableProductSchema, ConfiguratorCategory } from 'lib/interfaces/configurator';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
const OptionsClientWrapper = dynamic(() => import('components/OptionsClientWrapper'), { ssr: false });
import { fetchProductsByDatabaseIds } from 'lib/woocommerce';
import { normalizeImageUrl } from 'lib/utils/image';

const OptionsPage = ({ product, editingCartItem, editSessionData, seoMeta, error, baseModel, categories }: any) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Handle add to cart
    const handleAddToCart = async (configuration: any) => {
        setLoading(true);
        try {
            // TODO: Implement GraphQL mutation to add configuration to cart
            console.log('Adding configuration to cart:', configuration);
            
            // For now, simulate success and redirect to cart
            await new Promise(resolve => setTimeout(resolve, 1000));
            router.push('/cart');
        } catch (error) {
            console.error('Failed to add configuration to cart:', error);
            // TODO: Show error notification
        } finally {
            setLoading(false);
        }
    };

    // Handle save configuration
    const handleSaveConfiguration = async (name: string, notes?: string): Promise<any> => {
        try {
            // TODO: Implement save configuration functionality
            console.log('Saving configuration:', { name, notes });
            return { 
                id: 'temp-id', 
                name, 
                notes,
                baseModel: {} as any,
                selectedOptions: [],
                totalPrice: 0,
                createdAt: new Date(),
                updatedAt: new Date()
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

    // Handle configuration save for edit mode
    const handleConfigurationSave = async (config: any) => {
        try {
            // TODO: Implement edit mode save functionality
            console.log('Saving edited configuration:', config);
            // This should update the cart item and return to cart
            router.push('/cart');
        } catch (error) {
            console.error('Failed to save edited configuration:', error);
            throw error;
        }
    };

    // Handle edit session completion
    const handleEditSessionComplete = (cartItemId: string, updatedConfig: any) => {
        console.log('Edit session completed:', { cartItemId, updatedConfig });
        // TODO: Update cart item and return to cart
        router.push('/cart');
    };

    if (!product) {
        return (
            <div className="py-24 mx-auto p-6 max-w-screen-xl px-5">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">Product Options Unavailable</h3>
                    <p className="text-yellow-700 mb-4">
                        {error || 'The requested product could not be found.'}
                    </p>
                    <p className="text-sm text-yellow-600">Please check the product URL or contact support if the issue persists.</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {seoMeta && (
                <Head>
                    <title>{seoMeta.title}</title>
                    <meta name="description" content={seoMeta.description} />
                    {seoMeta.noIndex && <meta name="robots" content="noindex, nofollow" />}
                </Head>
            )}
            <div className="py-24 mx-auto p-6 max-w-screen-xl px-5">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-2">
                        {editingCartItem ? 'Edit Configuration' : `${product.title} — Choose Options`}
                    </h1>
                    {editingCartItem && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
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
                
                {/* Use ModelConfigurator for both new and edit modes */}
                {baseModel && categories ? (
                    <ModelConfigurator
                        baseModel={baseModel}
                        categories={categories}
                        loading={loading}
                        // Edit mode props
                        editSessionId={editSessionData?.sessionId}
                        cartItemId={editSessionData?.cartItemId}
                        isEditMode={editingCartItem}
                        initialConfiguration={editingCartItem ? product : undefined}
                        // Event handlers
                        onAddToCart={handleAddToCart}
                        onSaveConfiguration={handleSaveConfiguration}
                        onConfigurationSave={handleConfigurationSave}
                        onEditSessionComplete={handleEditSessionComplete}
                        onShareConfiguration={handleShareConfiguration}
                        onConfigurationChange={(config) => {
                            console.log('Configuration changed:', config);
                        }}
                    />
                ) : (
                    // Fallback to old system if configurator data not available
                    <div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                            <h3 className="text-lg font-semibold text-blue-800 mb-2">Configuration Loading</h3>
                            <p className="text-blue-700 mb-4">
                                Loading configuration options for {product.title}...
                            </p>
                            <p className="text-sm text-blue-600">
                                If this message persists, please refresh the page or contact support.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { params, query } = context || {};
    const rawSlug = params?.slug;
    const slug = Array.isArray(rawSlug) ? rawSlug[0] : (rawSlug ?? '');
    
    // Parse query parameters for edit session
    const isEditMode = query?.edit === 'true';
    const cartItemId = query?.cartItemId as string;
    const sessionId = query?.sessionId as string;
    
    try {
        // Single source of truth: WooCommerce GraphQL only
        const { fetchGraphQLProducts } = await import('../../../lib/woocommerce');
        const allProducts = await fetchGraphQLProducts();
        
        // Find product by slug from WooCommerce data
        const wooProduct = allProducts.find((p: any) => p.slug === slug);
        
        if (!wooProduct) {
            console.error(`Product with slug "${slug}" not found in WooCommerce data`);
            return { props: { product: null, error: 'Product not found' } };
        }

        // Convert WooCommerce product to ProductSchema format
        const { mapWooToProductSchema } = await import('../../../lib/contentful/contentful');
        const product = mapWooToProductSchema(wooProduct);
        
        console.log(`Found product for options page:`, product.title, `ID: ${product.productId}`);
        
        // Validate edit session if in edit mode
        if (isEditMode) {
            if (!cartItemId || !sessionId) {
                console.warn('Edit mode requires both cartItemId and sessionId');
                return {
                    redirect: {
                        destination: '/cart?error=invalid_edit_params',
                        permanent: false,
                    }
                };
            }
            
            // For server-side validation, we can't access localStorage
            // but we can validate the basic parameters and let client-side
            // handle the full session validation
            console.log('Edit session requested:', { cartItemId, sessionId, productSlug: slug });
        }

        // If server did not attach the related product objects, fetch them here
        try {
            const relatedIds = Array.isArray(product._related_options) ? product._related_options.map((x: any) => Number(x)).filter((n: any) => !isNaN(n)) : [];
            if (relatedIds.length > 0 && (!Array.isArray(product._related_options_products) || product._related_options_products.length === 0)) {
                const { fetchProductsByIds } = await import('lib/woocommerce');
                try {
                    const related = await fetchProductsByIds(relatedIds, { format: 'display' });
                    // Attach the exact shape produced by fetchProductsByIds so
                    // server and client share the same minimal shape.
                    product._related_options_products = Array.isArray(related) ? related : [];
                } catch (err) {
                    console.warn('Options page: failed to fetch related product objects server-side (relatedProducts)', err);
                    product._related_options_products = product._related_options_products || [];
                }
            }
        } catch (err) {
            console.warn('Options page: failed to fetch related product objects server-side', err);
        }

        // Determine editing mode and pass edit session data
        const editingCartItem = isEditMode && cartItemId;
        
        // Add SEO meta tags for edit mode (noindex)
        const seoMeta = isEditMode ? {
            noIndex: true,
            title: `Edit Configuration | ${product.title}`,
            description: 'Editing product configuration'
        } : null;
        
        // Convert Contentful product to ConfigurableProductSchema for ModelConfigurator
        const baseModel: ConfigurableProductSchema = {
            id: product.productId || product.slug,
            databaseId: product.productId ? parseInt(product.productId) : undefined,
            name: product.title,
            slug: product.slug,
            title: product.title,
            description: product.description || '',
            shortDescription: product.shortDescription || '',
            featuredImage: product.featuredImage,
            image: product.featuredImage ? {
                sourceUrl: product.featuredImage,
                altText: `${product.title} image`
            } : undefined,
            price: typeof product.price === 'number' ? product.price : parseFloat(product.price || '0'),
            regularPrice: product.price?.toString(),
            salePrice: undefined,
            sku: undefined,
            type: 'SIMPLE' as const,
            affiliate: product.affiliate || false,
            productId: product.productId,
            
            // Configurator-specific fields
            baseModel: true,
            configuratorCategories: [],
            compatibilityRules: [],
            installationRequired: false,
            financingAvailable: false,
            insuranceCoverage: [],
            safetyRating: undefined,
            adaCompliant: false,
            weightCapacity: undefined,
            productSpecifications: product.productSpecifications || '',
            
            // Additional fields
            productPictures: product.productPictures || [],
            variations: product.variations || [],
            options: product.options || [],
            _related_options: product._related_options || [],
            _related_options_products: (product._related_options_products || []) as any
        };

        // Generate configuration categories from WooCommerce related options
        let categories: ConfiguratorCategory[] = [];
        
        try {
            // Use the WooCommerce data that was already fetched
            if (product._related_options && product._related_options.length > 0) {
                console.log(`Processing ${product._related_options.length} related options for product ${product.title}`);
                
                // Find related option products by their IDs from the already-fetched data
                const relatedProducts = allProducts.filter((p: any) => 
                    product._related_options?.includes(p.databaseId)
                );
                
                console.log(`Found ${relatedProducts.length} related products:`, relatedProducts.map((p: any) => p.name));
                
                // Group related products into configuration categories
                const categoryMap = new Map<string, ConfigurableProductSchema[]>();
                
                relatedProducts.forEach((relatedProduct: any) => {
                    // Extract category from product name (e.g., "Product Name - Category")
                    const nameParts = relatedProduct.name.split(' - ');
                    const categoryName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : 'Options';
                    
                    // Convert to ConfigurableProductSchema
                    const configurableOption: ConfigurableProductSchema = {
                        // Core ProductSchema fields
                        title: relatedProduct.name,
                        slug: relatedProduct.slug,
                        description: relatedProduct.description || '',
                        shortDescription: relatedProduct.shortDescription || '',
                        featuredImage: relatedProduct.image?.sourceUrl || '',
                        productSpecifications: relatedProduct.productSpecifications || '',
                        productPictures: relatedProduct.galleryImages?.nodes?.map((img: any) => ({ fields: { file: { url: img.sourceUrl } } })) || [],
                        price: parseFloat(relatedProduct.price?.replace(/[^0-9.-]/g, '') || '0'),
                        affiliate: false,
                        
                        // ConfigurableProductSchema fields
                        id: relatedProduct.id,
                        databaseId: relatedProduct.databaseId,
                        name: relatedProduct.name,
                        image: relatedProduct.image,
                        regularPrice: relatedProduct.regularPrice ? String(parseFloat(relatedProduct.regularPrice.replace(/[^0-9.-]/g, '') || '0')) : undefined,
                        salePrice: relatedProduct.salePrice ? String(parseFloat(relatedProduct.salePrice.replace(/[^0-9.-]/g, '') || '0')) : undefined,
                        sku: relatedProduct.sku,
                        
                        // Additional fields
                        options: [],
                        _related_options: relatedProduct.relatedOptions || [],
                        _related_options_products: [],
                        variations: relatedProduct.variations?.nodes || []
                    };
                    
                    if (!categoryMap.has(categoryName)) {
                        categoryMap.set(categoryName, []);
                    }
                    categoryMap.get(categoryName)!.push(configurableOption);
                });
                
                // Convert category map to ConfiguratorCategory array
                let displayOrder = 0;
                categories = Array.from(categoryMap.entries()).map(([categoryName, options]) => ({
                    id: categoryName.toLowerCase().replace(/\s+/g, '-'),
                    name: categoryName,
                    slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
                    description: `${categoryName} for ${product.title}`,
                    displayOrder: displayOrder++,
                    required: false,
                    multiSelect: false,
                    options,
                    maxSelections: 1,
                    minSelections: 0,
                    loadingState: 'loaded' as const,
                    icon: '',
                    helpText: `Choose from available ${categoryName.toLowerCase()} options`,
                    collapsed: false
                }));
                
                console.log(`Found ${categories.length} configuration categories from WooCommerce data:`, categories.map(c => c.name));
            } else {
                console.warn('No related options found for product:', product.slug);
                // Still allow configuration with empty categories - the configurator can handle this
                categories = [];
            }
            
        } catch (error) {
            console.error('Error processing WooCommerce configuration data:', error);
            // Don't fail completely - allow configuration with empty categories
            categories = [];
        }

        return { 
            props: { 
                product, 
                editingCartItem,
                editSessionData: isEditMode ? {
                    cartItemId,
                    sessionId,
                    isEditMode: true
                } : null,
                seoMeta,
                baseModel,
                categories,
                error: null 
            } 
        };
    } catch (e) {
        console.error('Error loading options page', e);
        return { props: { product: null, error: e instanceof Error ? e.message : 'Failed to load product options' } };
    }
};

export default OptionsPage;
