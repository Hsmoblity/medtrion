import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useHeroContent } from '../../lib/hooks/useHeroContent';
import { PrimaryButton } from '../ui';
import AnimatedCounter from '../ui/AnimatedCounter';
import ProductShowcaseCarousel from './ProductShowcaseCarousel';
import { LoadingOverlay } from '../ui';

const EnhancedHero: React.FC = () => {
  const { content, loading, error } = useHeroContent();
  const [currentSlide, setCurrentSlide] = useState(0);

  if (loading) {
    return (
      <section className="relative z-10 w-full bg-[url('/nnnoise.svg')] bg-cover bg-repeat px-4 pt-8 md:pt-12 pb-12 md:pb-16">
        <div className="container mx-auto">
          <LoadingOverlay show={true} />
        </div>
      </section>
    );
  }

  if (error) {
    // Fallback to original hero content
    return (
      <section className="relative z-10 w-full bg-[url('/nnnoise.svg')] bg-cover bg-repeat px-4 pt-8 md:pt-12 pb-12 md:pb-16 flex flex-col">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-poppins font-semibold text-black mb-6">
            Express Your Freedom with Medtrion
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Empowering 1000+ Satisfied Customers to Stay Independent with Exceptional mobility products
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <PrimaryButton href="/products" size="lg">
              Explore Products
            </PrimaryButton>
            <PrimaryButton href="/consultation/google-form" size="lg" className="bg-gray-600 hover:bg-gray-700">
              Get Free Quote
            </PrimaryButton>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative z-10 w-full bg-[url('/nnnoise.svg')] bg-cover bg-repeat px-4 pt-8 md:pt-12 pb-12 md:pb-16">
      <div className="container mx-auto">
        <div className="flex md:flex-row flex-col items-center gap-12">
          {/* Dynamic Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1"
          >
            <h1 className="text-left font-poppins md:text-6xl text-5xl font-semibold text-black mb-6 leading-tight">
              {content.title}
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              {content.subtitle}
            </p>
            
            {/* Animated Statistics */}
            {content.statistics.length > 0 && (
              <div className="grid grid-cols-3 gap-6 mb-8">
                {content.statistics.map((stat, index) => (
                  <AnimatedCounter
                    key={index}
                    value={stat.value}
                    label={stat.label}
                    delay={index * 200}
                    icon={stat.icon}
                  />
                ))}
              </div>
            )}
            
            {/* Dynamic CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              {content.ctaButtons.map((button, index) => (
                <PrimaryButton
                  key={index}
                  href={button.href}
                  size="lg"
                  className={button.variant === 'secondary' ? 'bg-gray-600 hover:bg-gray-700' : ''}
                >
                  {button.text}
                </PrimaryButton>
              ))}
            </div>
          </motion.div>
          
          {/* Product Showcase Carousel */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1"
          >
            <ProductShowcaseCarousel 
              products={content.featuredProducts}
              currentSlide={currentSlide}
              onSlideChange={setCurrentSlide}
            />
          </motion.div>
        </div>
      </div>
      
      {/* Decorative bottom section */}
      <div className="md:h-24 h-12 relative bottom-12 bg-[url('/nnnoise.svg')] bg-cover bg-repeat w-full -skew-y-6 -z-10"></div>
    </section>
  );
};

export default EnhancedHero;
