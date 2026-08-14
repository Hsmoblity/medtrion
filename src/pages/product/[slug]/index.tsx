import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect, useCallback } from "react";
import {
  ConfigurableProductSchema,
  ConfiguratorCategory,
} from "lib/interfaces/configurator";
import { stripHtml } from "lib/utils/text";
import { normalizeImageUrl } from "lib/utils/image";
import { useConfiguratorStore } from "stores/configuratorStore";
import { motion } from "framer-motion";

import Hero from "@/components/common/Hero";
// Import components
import ModelHero from "components/configurator/ModelHero";
import ConfiguratorSidebar from "components/configurator/ConfiguratorSidebar";
import CategoryGroup from "components/configurator/CategoryGroup";
import SummaryPanel from "components/configurator/SummaryPanel";
import CompatibilityAlert from "components/configurator/CompatibilityAlert";
import { Reviews } from "components/reviews";
import FAQ from "components/faq";
import ProductOverview from "components/ProductOverview";
import ProductFAQ from "components/ProductFAQ";
import ProductSpecifications from "components/ProductSpecifications";
import { PrimaryButton, LoadingOverlay } from "components/ui";
import { useOptionProductsWithMetrics } from "hooks/useOptionProducts";
import { LazyOptionProducts } from "components/lazy-loading/LazyOptionProducts";
import { OptionProductsLoadingOverlay } from "components/loading/OptionProductsLoadingOverlay";
import { PERFORMANCE_THRESHOLDS } from "lib/utils/performance-tracking-lazy-load";

interface ProductDetailPageProps {
  product: ConfigurableProductSchema | null;
  categories: ConfiguratorCategory[];
  error?: string;
  seoMeta?: {
    title: string;
    description: string;
  };
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  categories,
  error,
  seoMeta,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [compatibilityIssues, setCompatibilityIssues] = useState<any[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [configuratorCategories, setConfiguratorCategories] = useState<
    ConfiguratorCategory[]
  >([]);

  // Use configurator store for state management
  const {
    selectedOptions,
    summary,
    addOption,
    removeOption,
    clearCategory,
    calculateSummary,
    setModel,
  } = useConfiguratorStore();

  // Initialize configurator store with product data
  useEffect(() => {
    if (product) {
      setModel(product);
    }
  }, [product, setModel]);

  // Lazy load option products with performance tracking
  const relatedOptionIds = (product?._related_options || [])
    .map((id) => (typeof id === "string" ? parseInt(id, 10) : id))
    .filter((id) => !isNaN(id));
  const {
    products: optionProducts,
    loading: optionsLoading,
    error: optionsError,
    hasLoaded: optionsLoaded,
    fetchOptions,
  } = useOptionProductsWithMetrics(relatedOptionIds, {
    immediate: true,
    performanceLabel: `product-detail-options-${product?.slug || "unknown"}`,
    cacheKey: `product-${product?.slug}-options`,
  });

  // Generate configuration categories from option products
  const generateConfigurationCategories = useCallback(
    (optionProducts: ConfigurableProductSchema[]) => {
      if (!optionProducts || optionProducts.length === 0) return;

      if (process.env.NODE_ENV === "development") {
        console.log(
          `Creating configuration categories from ${optionProducts.length} option products`,
        );
      }

      // Group related products into categories based on product name patterns
      const categoryMap = new Map<string, ConfigurableProductSchema[]>();

      optionProducts.forEach((relatedProduct) => {
        // Extract category from product name (e.g., "Product Name - Category")
        const nameParts = relatedProduct.name?.split(" - ") || [];
        let categoryName = "Options"; // Default category

        if (nameParts.length > 1) {
          categoryName = nameParts[nameParts.length - 1];
        } else {
          // Try to infer category from product name patterns
          const name = relatedProduct.name?.toLowerCase() || "";
          if (name.includes("warranty") || name.includes("extended")) {
            categoryName = "Warranty";
          } else if (name.includes("delivery") || name.includes("shipping")) {
            categoryName = "Delivery";
          } else if (
            name.includes("installation") ||
            name.includes("install")
          ) {
            categoryName = "Installation";
          } else if (name.includes("color") || name.includes("fabric")) {
            categoryName = "Customization";
          } else if (
            name.includes("accessories") ||
            name.includes("accessory")
          ) {
            categoryName = "Accessories";
          }
        }

        if (!categoryMap.has(categoryName)) {
          categoryMap.set(categoryName, []);
        }
        categoryMap.get(categoryName)!.push(relatedProduct);
      });

      // Convert category map to ConfiguratorCategory array
      let displayOrder = 0;
      const newCategories = Array.from(categoryMap.entries()).map(
        ([categoryName, options]) => ({
          id: categoryName.toLowerCase().replace(/\s+/g, "-"),
          name: categoryName,
          slug: categoryName.toLowerCase().replace(/\s+/g, "-"),
          description: `${categoryName} options for ${product?.title || product?.name}`,
          displayOrder: displayOrder++,
          required: false,
          multiSelect: categoryName.toLowerCase().includes("accessories"),
          options,
          maxSelections: categoryName.toLowerCase().includes("accessories")
            ? undefined
            : 1,
          minSelections: 0,
          loadingState: "loaded" as const,
          icon: getIconForCategory(categoryName),
          helpText: `Choose from available ${categoryName.toLowerCase()} options`,
          collapsed: false,
          progressCount: {
            selected: 0,
            total: options.length,
          },
        }),
      );

      // Update configurator categories state
      setConfiguratorCategories(newCategories);
      console.log(
        `Created ${newCategories.length} configuration categories:`,
        newCategories.map((c) => c.name),
      );
    },
    [product],
  );

  // Update product with loaded option products and generate categories
  useEffect(() => {
    if (optionsLoaded && optionProducts.length > 0 && product) {
      // Update the product with loaded option products
      product._related_options_products = optionProducts;
      console.log(
        `Updated product with ${optionProducts.length} option products`,
      );

      // Generate configuration categories from loaded option products
      generateConfigurationCategories(optionProducts);
    }
  }, [optionsLoaded, optionProducts, product, generateConfigurationCategories]);

  // Helper function to get icon for category
  const getIconForCategory = (categoryName: string): string => {
    const name = categoryName.toLowerCase();
    if (name.includes("warranty")) return "🛡️";
    if (name.includes("delivery")) return "🚚";
    if (name.includes("installation")) return "🔧";
    if (name.includes("customization") || name.includes("color")) return "🎨";
    if (name.includes("accessories")) return "⚡";
    return "📦";
  };

  // Calculate current price
  const currentPrice = product
    ? parseFloat(product.price?.toString() || "0") +
      Object.values(selectedOptions)
        .flat()
        .reduce(
          (total, option) =>
            total + parseFloat(option.price?.toString() || "0"),
          0,
        )
    : 0;

  // Handle add to cart - use WooCommerce data directly
  const handleAddToCart = async () => {
    if (!product) return;

    setLoading(true);
    try {
      // Use the cart store directly with WooCommerce product data
      const { useCartStore } = await import("stores/cartStore");
      const { addToCart } = useCartStore.getState();

      // Calculate total price from base product + selected options
      const selectedOptionsList = Object.values(selectedOptions).flat();
      const basePrice = product.price || 0;
      const optionsTotal = selectedOptionsList.reduce(
        (sum: number, option: any) => {
          const price =
            typeof option.price === "number"
              ? option.price
              : parseFloat(option.price || "0");
          return sum + price;
        },
        0,
      );
      const totalPrice = basePrice + optionsTotal;

      // Create cart item from WooCommerce product data matching CartProduct interface
      const cartItem = {
        // ProductSchema required fields
        title: product.name || product.title || "",
        slug: product.slug || "",
        description: product.description || "",
        shortDescription: product.shortDescription || "",
        featuredImage: product.image?.sourceUrl || product.featuredImage || "",
        productSpecifications: product.productSpecifications || "",
        productPictures: product.productPictures || [],
        price: totalPrice,
        affiliate: product.affiliate || false,
        productId: product.productId,

        // CartProduct specific fields
        quantity: 1,
        options: selectedOptionsList.map((option: any) => ({
          name: option.name || option.title || "",
          type: option.optionType || "option",
          priceModifier: parseFloat(option.price || "0"),
          selected: true,
          quantity: 1,
          value: option.slug || option.id,
        })),

        // Additional fields from product
        variations: product.variations || [],
        _related_options: product._related_options || [],
        _related_options_products: product._related_options_products || [],
      };

      addToCart(cartItem);

      // Navigate to cart on success
      router.push("/cart?added=true");
    } catch (error) {
      console.error("Failed to add configuration to cart:", error);
      alert("Failed to add configuration to cart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Removed handleConfigure function since this page is already a configuration interface

  // Handle option selection using configurator store
  const handleOptionToggle = useCallback(
    (categoryId: string, option: ConfigurableProductSchema) => {
      console.log("Product page: handleOptionToggle called", {
        categoryId,
        optionId: option.id,
        optionName: option.name,
      });

      const category = configuratorCategories.find((c) => c.id === categoryId);
      const categoryOptions = selectedOptions[categoryId] || [];
      const isSelected = categoryOptions.some(
        (selected) => selected.databaseId === option.databaseId,
      );

      if (isSelected) {
        // Remove option from store
        removeOption(option.databaseId!, categoryId);
      } else {
        // Add option to store
        if (category?.multiSelect) {
          // Check max selections
          if (
            category.maxSelections &&
            categoryOptions.length >= category.maxSelections
          ) {
            console.warn(
              `Cannot add more options to ${categoryId}, max selections reached`,
            );
            return;
          }
          addOption(option, categoryId);
        } else {
          // Single select - clear category first, then add
          clearCategory(categoryId);
          addOption(option, categoryId);
        }
      }
    },
    [
      configuratorCategories,
      selectedOptions,
      addOption,
      removeOption,
      clearCategory,
    ],
  );

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="rounded-[24px] border border-[#0b1f3a]/10 bg-white p-8 shadow-[0_20px_60px_rgba(11,31,58,0.08)]">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#0b1f3a] mb-2">
              Product Not Found
            </h3>
            <p className="text-gray-600 mb-6">
              {error || "The requested product could not be found."}
            </p>
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#f7a236] to-[#3fa2a3] px-6 py-2.5 font-semibold text-white shadow-[0_10px_30px_rgba(247,162,54,0.35)] transition-all duration-200 hover:shadow-[0_14px_36px_rgba(63,162,163,0.4)] hover:-translate-y-0.5"
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

      {/* Loading overlay for option products */}
      <LoadingOverlay
        show={optionsLoading && !optionsLoaded}
        variant="overlay"
        message="Loading configuration options..."
        ariaLabel="Loading product configuration options"
      />

      {/* Hero Section */}
      <Hero
        badge="Product"
        title={product.title || product.name || "Product"}
        description={stripHtml(product.shortDescription || product.description || "").slice(0, 160)}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: product.title || product.name || "Product" },
        ]}
      />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Model Hero Section */}
          <div className="mb-12 rounded-[28px] border border-[#0b1f3a]/10 bg-gradient-to-br from-white via-[#f8fbff] to-[#f2fbfa] p-6 sm:p-8 shadow-[0_20px_60px_rgba(11,31,58,0.08)]">
            <ModelHero
              model={product}
              totalPrice={currentPrice}
              basePrice={parseFloat(product.price?.toString() || "0")}
              selectedOptionsCount={
                Object.values(selectedOptions).flat().length
              }
              loading={loading}
            />

            {/* Add to Cart Button */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleAddToCart}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-full bg-[#3fa2a3] px-10 py-3.5 font-semibold text-white transition-colors duration-200 hover:bg-[#f7a236] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Adding to Cart...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                      />
                    </svg>
                    Add to Cart
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Product Overview Section */}
          {product?.productExtraDetails?.overviewContent && (
          <ProductOverview 
            content={product.productExtraDetails.overviewContent}
            featureTabs={product.productExtraDetails.featureTabs}
          />
        )}

          {/* Main Configuration Area */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <ConfiguratorSidebar
                categories={configuratorCategories}
                currentCategoryId={currentCategory || undefined}
                onCategorySelect={setCurrentCategory}
              />
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2">
              {showSummary ? (
                <div className="rounded-[28px] border border-[#0b1f3a]/10 bg-gradient-to-br from-white via-[#f8fbff] to-[#f2fbfa] p-8 shadow-[0_20px_60px_rgba(11,31,58,0.08)]">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-[#0b1f3a]">
                      Configuration Summary
                    </h2>
                    <div className="mt-3 h-1.5 w-16 rounded-full bg-gradient-to-r from-[#f7a236] to-[#3fa2a3]" />
                  </div>
                  <div className="space-y-4">
                    <div className="border-b border-[#0b1f3a]/10 pb-4">
                      <h3 className="font-semibold text-[#0b1f3a]">
                        {product.title || product.name || "Product"}
                      </h3>
                      <p className="text-gray-600">Base Model</p>
                      <p className="text-lg font-bold text-[#3fa2a3]">
                        $
                        {parseFloat(product.price?.toString() || "0").toFixed(
                          2,
                        )}
                      </p>
                    </div>

                    {Object.entries(selectedOptions).map(
                      ([categoryId, options]) => {
                        const category = configuratorCategories.find(
                          (c) => c.id === categoryId,
                        );
                        if (!options.length) return null;

                        return (
                          <div
                            key={categoryId}
                            className="border-b border-[#0b1f3a]/10 pb-4"
                          >
                            <h4 className="font-semibold text-[#0b1f3a]">
                              {category?.name}
                            </h4>
                            {options.map((option) => (
                              <div
                                key={option.id}
                                className="flex justify-between items-center py-2"
                              >
                                <span className="text-gray-600">
                                  {option.name}
                                </span>
                                <span className="font-medium text-[#0b1f3a]">
                                  $
                                  {parseFloat(
                                    option.price?.toString() || "0",
                                  ).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      },
                    )}

                    <div className="pt-4">
                      <div className="flex justify-between items-center text-xl font-bold">
                        <span className="text-[#0b1f3a]">Total</span>
                        <span className="text-[#3fa2a3]">
                          $
                          {(
                            summary?.grandTotal ||
                            parseFloat(product.price?.toString() || "0")
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : currentCategory ? (
                <CategoryGroup
                  category={
                    configuratorCategories.find(
                      (c) => c.id === currentCategory,
                    )!
                  }
                  selectedOptions={selectedOptions[currentCategory] || []}
                  onToggleOption={(option: ConfigurableProductSchema) =>
                    handleOptionToggle(currentCategory, option)
                  }
                  compatibilityIssues={compatibilityIssues}
                />
              ) : (
                <div className="rounded-[28px] border border-[#0b1f3a]/10 bg-gradient-to-br from-white via-[#f8fbff] to-[#f2fbfa] p-8 text-center shadow-[0_20px_60px_rgba(11,31,58,0.08)]">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#fef7eb] text-[#f7a236]">
                    <svg
                      className="h-8 w-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-[#0b1f3a] mb-2">
                    Configure Your {product.title || product.name || "Product"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Select a category from the sidebar to start customizing your
                    mobility solution.
                  </p>
                  {/* Removed Start Configuration button since this page is already a configuration interface */}
                </div>
              )}
            </div>

            {/* Summary Panel */}
            <div className="lg:col-span-1">
              <SummaryPanel
                configuration={{
                  basePrice:
                    summary?.basePrice ||
                    parseFloat(product.price?.toString() || "0"),
                  optionsTotal: summary?.optionsTotal || 0,
                  installationCost: summary?.installationCost || 0,
                  shippingCost: summary?.shippingCost || 0,
                  taxAmount: summary?.taxAmount || 0,
                  grandTotal:
                    summary?.grandTotal ||
                    parseFloat(product.price?.toString() || "0"),
                  estimatedDelivery: summary?.estimatedDelivery || "2-3 weeks",
                }}
                onAddToCart={handleAddToCart}
                loading={loading}
              />
            </div>
          </div>

          {/* Compatibility Issues */}
          {compatibilityIssues.length > 0 && (
            <div className="mt-8">
              <CompatibilityAlert issues={compatibilityIssues} />
            </div>
          )}

          {/* Product Reviews */}
          <div className="mt-16">
            <Reviews />
          </div>

          {/* Product FAQ Section - Dynamic based on product */}
         {product?.productExtraDetails?.faqs && product.productExtraDetails.faqs.length > 0 && (
            <ProductFAQ faqs={product.productExtraDetails.faqs} />
          )}

          {/* Product Specifications Section - Dynamic based on product */}
          {product?.productExtraDetails?.specifications && product.productExtraDetails.specifications.length > 0 && (
            <ProductSpecifications
              specifications={product.productExtraDetails.specifications}
            />
          )}

          {/* Lazy Loaded Option Products Section */}
          {relatedOptionIds && relatedOptionIds.length > 0 && (
            <div className="mt-16">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-[#0b1f3a] mb-4">
                  Available Options & Accessories
                </h2>
                <div className="mx-auto mb-4 h-1.5 w-24 rounded-full bg-gradient-to-r from-[#f7a236] to-[#3fa2a3]" />
                <p className="text-lg text-gray-600">
                  Customize your {product.title || product.name} with these
                  compatible options
                </p>
              </div>

              <LazyOptionProducts
                relatedOptionIds={relatedOptionIds}
                performanceLabel={`product-detail-lazy-options-${product.slug}`}
                groupByCategory={true}
                maxProductsPerCategory={8}
                enableNoJSFallback={true}
                className="max-w-7xl mx-auto"
                onLoadComplete={(loadedProducts) => {
                  console.log(
                    `Successfully lazy loaded ${loadedProducts.length} option products`,
                  );
                  // Generate categories from loaded products if not already done
                  if (configuratorCategories.length === 0) {
                    generateConfigurationCategories(loadedProducts);
                  }
                }}
                onLoadError={(error) => {
                  console.error("Failed to lazy load option products:", error);
                }}
                onLoadTimeout={() => {
                  console.warn("Option products loading timed out");
                }}
                errorComponent={
                  <div className="rounded-[24px] border border-[#f7a236]/30 bg-[#fef7eb] p-6 text-center">
                    <div className="text-[#0b1f3a]">
                      <h3 className="font-semibold mb-2">
                        Options Temporarily Unavailable
                      </h3>
                      <p className="text-sm mb-4">
                        We're having trouble loading product options right now.
                        Please refresh the page or contact us for assistance.
                      </p>
                      <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#f7a236] to-[#3fa2a3] px-6 py-2.5 font-semibold text-white shadow-[0_10px_30px_rgba(247,162,54,0.35)] transition-all duration-200 hover:shadow-[0_14px_36px_rgba(63,162,163,0.4)] hover:-translate-y-0.5"
                      >
                        Refresh Page
                      </button>
                    </div>
                  </div>
                }
                emptyComponent={
                  <div className="text-center py-12">
                    <div className="text-gray-500">
                      <h3 className="font-semibold mb-2 text-[#0b1f3a]">
                        No Additional Options
                      </h3>
                      <p className="text-sm">
                        This product doesn't have additional customization
                        options available at this time.
                      </p>
                    </div>
                  </div>
                }
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Helper function to get icon for category
const getIconForCategory = (categoryName: string): string => {
  const name = categoryName.toLowerCase();
  if (name.includes("warranty") || name.includes("extended")) {
    return "🛡️";
  } else if (name.includes("delivery") || name.includes("shipping")) {
    return "🚚";
  } else if (name.includes("installation") || name.includes("install")) {
    return "🔧";
  } else if (
    name.includes("color") ||
    name.includes("fabric") ||
    name.includes("custom")
  ) {
    return "🎨";
  } else if (name.includes("accessories") || name.includes("accessory")) {
    return "⚙️";
  } else if (name.includes("safety")) {
    return "🦺";
  } else if (name.includes("comfort")) {
    return "🪑";
  }
  return "📦"; // Default icon
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
    // Single source of truth: WooCommerce GraphQL slug query
    let product;
    let categories: ConfiguratorCategory[] = [];

    // Fetch product data using new slug-based query
    const { configuratorAPI, normalizeSlugQueryResponse } = await import(
      "../../../lib/graphql/configurator"
    );
    const slugResult = await configuratorAPI.getProductBySlug(slug);

    if (slugResult.error || !slugResult.data) {
      // Product not found via slug query
      if (process.env.NODE_ENV === "development") {
        console.error(`Product with slug "${slug}" not found via slug query`);
      }
      return {
        props: {
          product: null,
          categories: [],
          error: "Product not found",
        },
      };
    }

    // Normalize the slug query response to ConfigurableProductSchema
    product = normalizeSlugQueryResponse(slugResult.data);

    if (!product) {
      if (process.env.NODE_ENV === "development") {
        console.error(`Failed to normalize product data for slug "${slug}"`);
      }
      return {
        props: {
          product: null,
          categories: [],
          error: "Product data normalization failed",
        },
      };
    }

    // Log product info only in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `Found product via slug query:`,
        product.title,
        `ID: ${product.databaseId}`,
        `Related options: ${product._related_options?.length || 0}`,
      );
      console.log(
        `Product "${product.title}" has ${product._related_options?.length || 0} related options (will be loaded client-side)`,
      );
    }

    // Note: Configuration categories are now generated client-side after option products are loaded
    // This improves initial page load performance
    categories = [];

    // Sanitize product data to ensure all undefined values are converted to null for SSR serialization
    const sanitizeProduct = (prod: any): any => {
      if (prod === null || prod === undefined) return null;
      if (typeof prod !== "object") return prod;
      if (Array.isArray(prod)) return prod.map(sanitizeProduct);

      const sanitized: any = {};
      for (const [key, value] of Object.entries(prod)) {
        if (value === undefined) {
          sanitized[key] = null;
        } else if (typeof value === "object" && value !== null) {
          sanitized[key] = sanitizeProduct(value);
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    };

    const sanitizedProduct = sanitizeProduct(product);

    // Check if product exists before accessing its properties
    if (!product) {
      return {
        props: {
          product: null,
          categories: [],
          error: "Product not found",
        },
      };
    }

    // const seoMeta = {
    //   title: `${product.title || product.name || "Product"} | Medtrion`,
    //   description: `Discover ${product.title || product.name || "Product"} - ${product.shortDescription || product.description?.substring(0, 150) || "Premium mobility solution"}. Configure your perfect mobility equipment with our comprehensive options.`,
    // };
    const seoMeta = {
  title: product.seo?.title || `${product.title || product.name || "Product"} | Medtrion`,
  description: product.seo?.description || `Discover ${product.title || product.name || "Product"} - ${product.shortDescription || product.description?.substring(0, 150) || "Premium mobility solution"}. Configure your perfect mobility equipment with our comprehensive options.`,
};
 
    return {
      props: {
        product: sanitizedProduct,
        categories: [], // Categories are now generated client-side
        seoMeta,
        error: null,
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    if (process.env.NODE_ENV === "development") {
      console.error("Error loading product detail page:", error);
    }

    // Provide more specific error messages
    let userFriendlyError = "Failed to load product details";
    if (errorMessage.includes("timeout")) {
      userFriendlyError = "Request timed out. Please try again.";
    } else if (errorMessage.includes("network")) {
      userFriendlyError = "Network error. Please check your connection.";
    }

    return {
      props: {
        product: null,
        categories: [],
        error: userFriendlyError,
      },
    };
  }
};

export default ProductDetailPage;
