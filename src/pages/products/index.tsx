import React from 'react';
import { GetServerSideProps } from 'next';
import { ProductSchema } from '../../lib/interfaces/schema';
import { ProductCardView, mapToProductCardView } from '../../lib/interfaces/homepage';
import { getProducts } from '../../lib/contentful/contentful';
import { sanitizeForSSR, filterConfigurableProducts, handleInsufficientConfigurableProducts } from '../../lib/utils/data-validation';
import ProductCard from '../../components/ui/ProductCard';
import MetaHead from '../../components/MetaHead';
import { PrimaryButton } from '../../components/ui';

interface ProductsPageProps {
  products: ProductCardView[];
  error?: string;
}

/**
 * Curated product selection logic
 * Returns exactly ten spotlight products for the shop page
 * Only includes configurable products (products with non-empty relatedOptions)
 */
const getCuratedProducts = (allProducts: ProductSchema[]): ProductSchema[] => {
  // First filter for configurable products only
  const configurableProducts = filterConfigurableProducts(allProducts);

  // Define curated product slugs for spotlight (only configurable products)
  const curatedSlugs = [
    'vivalift-tranquil-2-plr-935s-lift-chair',
    'acorn-stairlifts-acorn-180-curved-stairlift',
    'vivalift-ultra-plr4955s-lift-chair',
    'acorn-stairlifts-acorn-130-straight-stairlift',
    'vivalift-classic-plr-835s-lift-chair',
    'acorn-stairlifts-acorn-200-straight-stairlift',
    'vivalift-premium-plr-945s-lift-chair',
    'acorn-stairlifts-acorn-190-curved-stairlift',
    'vivalift-deluxe-plr-755s-lift-chair',
    'acorn-stairlifts-acorn-210-straight-stairlift'
  ];

  // Filter configurable products by curated slugs
  const curated = configurableProducts.filter(product => 
    curatedSlugs.includes(product.slug)
  );

  // If we don't have enough curated configurable products, fill with other configurable products
  if (curated.length < 10) {
    const remaining = configurableProducts
      .filter(product => !curatedSlugs.includes(product.slug))
      .slice(0, 10 - curated.length);
    
    return [...curated, ...remaining].slice(0, 10);
  }

  return curated.slice(0, 10);
};

const ProductsPage: React.FC<ProductsPageProps> = ({ products, error }) => {
  if (error) {
    return (
      <>
        <MetaHead 
          title="Products - Medtrion" 
          description="Discover our range of mobility products and stairlifts"
        />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Products Temporarily Unavailable</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <PrimaryButton href="/">
              Return to Home
            </PrimaryButton>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <MetaHead 
        title="Products - Medtrion" 
        description="Discover our curated selection of mobility products including stairlifts and lift chairs. Quality solutions for enhanced independence."
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#0b1f3a] via-[#153a5f] to-[#3fa2a3] text-white pt-20 pb-12 sm:pt-24 sm:pb-16">
          <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-[#f7a236]">
                Shop All Products
              </span>
              <h1 className="text-4xl md:text-5xl font-bold">
                Our Curated Product Collection
              </h1>
              <p className="mt-4 text-lg leading-8 text-blue-100 md:text-xl">
                Discover our handpicked selection of mobility solutions designed to enhance your independence and quality of life.
              </p>
            </div>
          </div>
        </div>

        {/* Product Categories Section */}
        <div className="bg-gradient-to-br from-[#f4f8fb] via-[#f7fbfd] to-[#fef7eb] py-12 sm:py-14">
          <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#0b1f3a] mb-4">
                Product Categories
              </h2>
              <div className="mx-auto mb-4 h-1.5 w-24 rounded-full bg-gradient-to-r from-[#f7a236] to-[#3fa2a3]" />
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Explore our comprehensive range of mobility solutions organized by category.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="rounded-[24px] border border-[#0b1f3a]/10 bg-white p-8 text-center shadow-[0_15px_40px_rgba(11,31,58,0.06)]">
                <div className="bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Stairlifts</h3>
                <p className="text-gray-600 mb-4">
                  Safe and reliable stairlifts for straight and curved staircases, designed for comfort and ease of use.
                </p>
                <a href="/products?category=stairlifts" className="text-blue-600 hover:text-blue-700 font-semibold">
                  View Stairlifts →
                </a>
              </div>
              
              <div className="rounded-[24px] border border-[#0b1f3a]/10 bg-white p-8 text-center shadow-[0_15px_40px_rgba(11,31,58,0.06)]">
                <div className="bg-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Lift Chairs</h3>
                <p className="text-gray-600 mb-4">
                  Comfortable lift chairs with advanced features for enhanced mobility and independence at home.
                </p>
                <a href="/products?category=lift-chairs" className="text-green-600 hover:text-green-700 font-semibold">
                  View Lift Chairs →
                </a>
              </div>
              
              <div className="rounded-[24px] border border-[#0b1f3a]/10 bg-white p-8 text-center shadow-[0_15px_40px_rgba(11,31,58,0.06)]">
                <div className="bg-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Accessories</h3>
                <p className="text-gray-600 mb-4">
                  Essential accessories and add-ons to enhance your mobility solution and improve your daily experience.
                </p>
                <a href="/products?category=accessories" className="text-purple-600 hover:text-purple-700 font-semibold">
                  View Accessories →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0b1f3a] mb-4">
              Featured Products
            </h2>
            <div className="mx-auto mb-4 h-1.5 w-24 rounded-full bg-gradient-to-r from-[#f7a236] to-[#3fa2a3]" />
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Each product has been carefully selected for its quality, reliability, and ability to improve daily living.
            </p>
          </div>

          <div className="rounded-[28px] border border-[#0b1f3a]/10 bg-gradient-to-br from-white via-[#f8fbff] to-[#f2fbfa] p-6 shadow-[0_20px_60px_rgba(11,31,58,0.08)] sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {products.map((product, index) => (
              <ProductCard
                key={product.slug}
                product={product}
                variant="hero"
                priority={index < 3} // Prioritize first three images
                position={index}
                showConfigureButton={false}
                showAddToCartButton={false}
                cardClickBehavior="configurator"
              />
            ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="mx-auto max-w-2xl rounded-[24px] border border-[#0b1f3a]/10 bg-white p-8 shadow-[0_15px_40px_rgba(11,31,58,0.06)]">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Need Help Choosing?
              </h3>
              <p className="text-gray-600 mb-6">
                Our mobility specialists are here to help you find the perfect solution for your needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <PrimaryButton 
                  href="/#contact-us"
                  size="lg"
                >
                  Contact Us
                </PrimaryButton>
                <a 
                  href="/#faq" 
                  className="inline-block bg-gray-200 text-gray-800 px-8 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  View FAQs
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Product Comparison Section */}
        <div id="comparison" className="bg-gradient-to-br from-[#f4f8fb] via-[#f7fbfd] to-[#fef7eb] py-16">
          <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#0b1f3a] mb-4">
                Compare Our Products
              </h2>
              <div className="mx-auto mb-4 h-1.5 w-24 rounded-full bg-gradient-to-r from-[#f7a236] to-[#3fa2a3]" />
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Find the perfect mobility solution by comparing features, specifications, and benefits.
              </p>
            </div>
            
            <div className="overflow-hidden rounded-[28px] border border-[#0b1f3a]/10 bg-white shadow-[0_20px_60px_rgba(11,31,58,0.08)]">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight Capacity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Installation</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warranty</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.slice(0, 5).map((product, index) => (
                      <tr key={product.slug} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              <img className="h-12 w-12 rounded-lg object-cover" src={product.imageUrl || '/placeholder.svg'} alt={product.title} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.title}</div>
                              <div className="text-sm text-gray-500">{product.price ? `$${product.price}` : 'Price on request'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.slug.includes('stairlift') ? 'Stairlift' : 'Lift Chair'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.slug.includes('stairlift') ? 'Up to 300 lbs' : 'Up to 400 lbs'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Professional
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          2 Years
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <a href={`/product/${product.slug}`} className="text-blue-600 hover:text-blue-900">
                            View Details
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <PrimaryButton href="/#comparison">
                View Full Comparison
              </PrimaryButton>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="bg-gradient-to-br from-[#f4f8fb] via-[#f7fbfd] to-[#fef7eb] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#0b1f3a] mb-4">
                What Our Customers Say
              </h2>
              <div className="mx-auto mb-4 h-1.5 w-24 rounded-full bg-gradient-to-r from-[#f7a236] to-[#3fa2a3]" />
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Real stories from real customers who have transformed their lives with our mobility solutions.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-[24px] border border-[#0b1f3a]/10 bg-white p-6 shadow-[0_15px_40px_rgba(11,31,58,0.06)]">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  "The Acorn Stairlift has given me back my independence. I can now safely navigate my home without worrying about falls."
                </p>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">MJ</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Margaret Johnson</p>
                    <p className="text-sm text-gray-500">Stairlift Customer</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  "Excellent service from start to finish. The installation team was professional and the lift chair works perfectly."
                </p>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">RS</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Robert Smith</p>
                    <p className="text-sm text-gray-500">Lift Chair Customer</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  "The financing options made it possible for me to get the mobility solution I needed. Highly recommend Medtrion!"
                </p>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">LD</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Linda Davis</p>
                    <p className="text-sm text-gray-500">Financing Customer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-gradient-to-br from-[#f4f8fb] via-[#f7fbfd] to-[#fef7eb] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#0b1f3a] mb-4">
                Why Choose Medtrion?
              </h2>
              <div className="mx-auto mb-4 h-1.5 w-24 rounded-full bg-gradient-to-r from-[#f7a236] to-[#3fa2a3]" />
            </div>
            
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="rounded-[24px] border border-[#0b1f3a]/10 bg-white p-8 text-center shadow-[0_15px_40px_rgba(11,31,58,0.06)]">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#f7a236] text-white">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Assurance</h3>
                <p className="text-gray-600">
                  All products meet the highest standards for safety, reliability, and performance.
                </p>
              </div>
              
              <div className="rounded-[24px] border border-[#0b1f3a]/10 bg-white p-8 text-center shadow-[0_15px_40px_rgba(11,31,58,0.06)]">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#3fa2a3] text-white">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Support</h3>
                <p className="text-gray-600">
                  Our team provides personalized guidance and ongoing support throughout your journey.
                </p>
              </div>
              
              <div className="rounded-[24px] border border-[#0b1f3a]/10 bg-white p-8 text-center shadow-[0_15px_40px_rgba(11,31,58,0.06)]">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#153a5f] text-white">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Flexible Financing</h3>
                <p className="text-gray-600">
                  We offer flexible payment options to make mobility solutions accessible to everyone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<ProductsPageProps> = async () => {
  try {
    // Fetch all products using existing helper
    const productsData = await getProducts('');
    
    if (productsData.error) {
      console.error('Products page error:', productsData.error);
      return {
        props: {
          products: [],
          error: 'Unable to load products at this time. Please try again later.'
        }
      };
    }

    // Get curated selection of configurable products
    const curatedProducts = getCuratedProducts(productsData.items);
    
    // Handle insufficient configurable products
    const fallbackCheck = handleInsufficientConfigurableProducts(curatedProducts.length, 10, 'Shop page');
    if (fallbackCheck.shouldShowFallback) {
      console.warn(fallbackCheck.message);
    }
    
    // Map to ProductCardView format
    const productCardViews: ProductCardView[] = curatedProducts.map(product => 
      mapToProductCardView(product)
    );

    // Sanitize data for SSR (remove undefined values)
    const sanitizedProducts = productCardViews.map(product => 
      sanitizeForSSR(product)
    );

    return {
      props: {
        products: sanitizedProducts,
      },
    };
  } catch (error) {
    console.error('Error in products page getServerSideProps:', error);
    
    return {
      props: {
        products: [],
        error: 'Unable to load products at this time. Please try again later.'
      },
    };
  }
};

export default ProductsPage;