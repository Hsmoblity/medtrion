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
      <section className="relative z-10 overflow-hidden bg-gradient-to-br from-[#07162d] via-[#0f2d4c] to-[#2f8f8f] px-4 pt-10 pb-12 md:pt-16 md:pb-20">
        <div className="container-center relative">
          <LoadingOverlay show={true} />
        </div>
      </section>
    );
  }

  if (error) {
    // Fallback to original hero content
    return (
      <section className="relative z-10 overflow-hidden bg-gradient-to-br from-[#07162d] via-[#0f2d4c] to-[#2f8f8f] px-4 pt-10 pb-12 md:pt-16 md:pb-20">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute left-[-8%] top-[-10%] h-56 w-56 rounded-full bg-[#f7a236]/35 blur-3xl" />
          <div className="absolute bottom-[-8%] right-[-6%] h-64 w-64 rounded-full bg-[#3fa2a3]/30 blur-3xl" />
        </div>
        <div className="container-center relative text-center">
          <div className="mx-auto max-w-3xl rounded-[32px] border border-white/20 bg-white/10 p-8 shadow-[0_25px_80px_rgba(0,0,0,0.2)] backdrop-blur-xl sm:p-10">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-[#f7a236]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#f7a236]" />
              Trusted mobility solutions
            </span>
            <h1 className="text-4xl md:text-6xl font-poppins font-semibold leading-tight text-white mb-6">
              Express Your Freedom with Medtrion
            </h1>
            <p className="text-lg text-blue-50/90 mb-8 leading-relaxed">
              Empowering 1000+ Satisfied Customers to Stay Independent with Exceptional mobility products
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <PrimaryButton href="/products" size="lg">
                Explore Products
              </PrimaryButton>
              <PrimaryButton href="/consultation/google-form" size="lg" variant="secondary">
                Get Free Quote
              </PrimaryButton>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative z-10 overflow-hidden bg-gradient-to-br from-[#07162d] via-[#0f2d4c] to-[#2f8f8f] px-4 pt-14 pb-12 md:pt-20 md:pb-20">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute left-[-8%] top-[-10%] h-56 w-56 rounded-full bg-[#f7a236]/35 blur-3xl" />
        <div className="absolute bottom-[-8%] right-[-6%] h-64 w-64 rounded-full bg-[#3fa2a3]/30 blur-3xl" />
      </div>

      <div className="container-center relative">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Dynamic Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-[#f7a236] backdrop-blur-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-[#f7a236]" />
              Trusted mobility solutions
            </span>

            <h1 className="text-left font-poppins text-3.5xl sm:text-4xl lg:text-5xl font-semibold leading-[1.05] text-white mb-5">
              {content.title}
            </h1>
            
            <p className="text-base sm:text-lg text-blue-50/90 mb-7 leading-relaxed">
              {content.subtitle}
            </p>
            
            {/* Animated Statistics */}
            {content.statistics.length > 0 && (
              <div className="mb-8 grid gap-4 sm:grid-cols-3">
                {content.statistics.map((stat, index) => (
                  <div key={index} className="rounded-[20px] border border-white/15 p-4 text-left">
                    <AnimatedCounter
                      value={stat.value}
                      label={stat.label}
                      delay={index * 200}
                      icon={stat.icon}
                    />
                  </div>
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
                  variant={button.variant === 'secondary' ? 'secondary' : 'primary'}
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
            className="relative flex justify-end pr-0"
          >
            <div className="rounded-[32px] overflow-hidden max-w-[640px] w-full pr-0">
              <ProductShowcaseCarousel 
                products={content.featuredProducts}
                currentSlide={currentSlide}
                onSlideChange={setCurrentSlide}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default EnhancedHero;
