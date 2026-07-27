import React, { useEffect, useState } from "react";
import { ProductSchema } from "../../lib/interfaces";
import { getProducts } from "../../lib/contentful/contentful";
import { PrimaryButton, LoadingOverlay } from "components/ui";
import ProductCard from "../ui/ProductCard";
import { mapToProductCardView } from "../../lib/interfaces/homepage";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

interface BestSellerSectionProps {
  initialProducts?: ProductSchema[];
}

const BestSellerSection: React.FC<BestSellerSectionProps> = ({
  initialProducts = [],
}) => {
  const [products, setProducts] = useState<ProductSchema[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBestSellers = async () => {
      if (initialProducts.length > 0) return; // Use initial products if provided

      setLoading(true);
      try {
        const response = await getProducts("");
        if (response.error) {
          setError(response.error);
        } else {
          // Filter for featured/best seller products or take first 6
          const bestSellers = Array.isArray(response.items)
            ? response.items.slice(0, 6)
            : [];
          setProducts(bestSellers);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load products",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, [initialProducts]);

  if (loading) {
    return (
      <section className="py-16 md:py-20 bg-white">
        <div className="container-center">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-primary font-bold text-[#0d163c] mb-4">
              Explore Our Best Sellers
            </h2>
            <p className="text-lg md:text-xl text-[#4b5563] max-w-2xl mx-auto font-primary">
              Discover our most popular mobility solutions, trusted by thousands
              of customers.
            </p>
          </div>
          <LoadingOverlay
            show={true}
            variant="skeleton"
            skeletonCount={6}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            ariaLabel="Loading best seller products"
          />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 md:py-20 bg-white">
        <div className="container-center">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-primary font-bold text-[#0d163c] mb-4">
              Explore Our Best Sellers
            </h2>
            <div className="bg-[#fef3e2] border border-[#f7a236] rounded-lg p-6 max-w-md mx-auto">
              <p className="text-[#d97706]">
                Unable to load products at this time.
              </p>
              <p className="text-sm text-[#b45309] mt-2">
                Please try again later.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null; // Don't render if no products
  }

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container-center">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-primary font-bold text-[#0d163c] mb-4">
            Explore Our Best Sellers
          </h2>
          <div className="mx-auto mb-4 h-1.5 w-24 rounded-full bg-gradient-to-r from-[#f7a236] to-[#3fa2a3]" />
          <p className="text-lg md:text-xl text-[#4b5563] max-w-2xl mx-auto font-primary">
            Discover our most popular mobility solutions, trusted by thousands
            of customers worldwide.
          </p>
        </div>

        {/* Product Grid */}
        <>
          {/* Desktop & Tablet Grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {products.map((product, index) => {
              const productCardView = mapToProductCardView(product);

              if (index < 2) {
                productCardView.badges = ["Best Seller"];
              }

              return (
                <ProductCard
                  key={product.slug || index}
                  product={productCardView}
                  variant="hero"
                  priority={index < 3}
                  position={index}
                  showConfigureButton={false}
                  showAddToCartButton={false}
                  cardClickBehavior="configurator"
                  onHeroClick={(slug, badge, position) => {
                    if (typeof window !== "undefined") {
                      try {
                        const gtag = (window as any).gtag;
                        if (gtag) {
                          gtag("event", "best_seller_click", {
                            product_slug: slug,
                            badge,
                            position,
                            section: "best_sellers",
                          });
                        }
                      } catch (error) {
                        console.warn("Analytics tracking failed:", error);
                      }
                    }

                    console.log("Best seller clicked:", {
                      slug,
                      badge,
                      position,
                    });
                  }}
                />
              );
            })}
          </div>

          {/* Mobile Slider */}
          <div className="md:hidden mb-12">
            <Swiper
              modules={[Pagination]}
              spaceBetween={20}
              slidesPerView={1.1}
              centeredSlides
              pagination={{
                clickable: true,
              }}
              breakpoints={{
                480: {
                  slidesPerView: 1.2,
                },
                640: {
                  slidesPerView: 1.4,
                },
              }}
            >
              {products.map((product, index) => {
                const productCardView = mapToProductCardView(product);

                if (index < 2) {
                  productCardView.badges = ["Best Seller"];
                }

                return (
                  <SwiperSlide key={product.slug || index}>
                    <ProductCard
                      product={productCardView}
                      variant="hero"
                      priority={index < 3}
                      position={index}
                      showConfigureButton={false}
                      showAddToCartButton={false}
                      cardClickBehavior="configurator"
                      onHeroClick={(slug, badge, position) => {
                        if (typeof window !== "undefined") {
                          try {
                            const gtag = (window as any).gtag;
                            if (gtag) {
                              gtag("event", "best_seller_click", {
                                product_slug: slug,
                                badge,
                                position,
                                section: "best_sellers",
                              });
                            }
                          } catch (error) {
                            console.warn("Analytics tracking failed:", error);
                          }
                        }

                        console.log("Best seller clicked:", {
                          slug,
                          badge,
                          position,
                        });
                      }}
                    />
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        </>

        {/* Call to Action */}
        <div className="text-center">
          <PrimaryButton href="/products" size="lg">
            View All Products
            <svg
              className="ml-2 -mr-1 w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
};

export default BestSellerSection;
