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
    return (
    <section className="relative z-10 overflow-hidden bg-gradient-to-br from-[#07162d] via-[#0f2d4c] to-[#2f8f8f] px-4 pt-10 pb-10 sm:pt-20 md:pt-20 md:pb-20">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute left-[-8%] top-[-10%] h-40 w-40 sm:h-56 sm:w-56 rounded-full bg-[#f7a236]/35 blur-3xl" />
        <div className="absolute bottom-[-8%] right-[-6%] h-48 w-48 sm:h-64 sm:w-64 rounded-full bg-[#3fa2a3]/30 blur-3xl" />
      </div>

      <div className="container-center relative">
        <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-[1.05fr_0.95fr]">

          {/* Product Showcase Carousel — hidden on mobile, visible from lg up */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:flex relative justify-end order-2 pr-0"
          >
            <div className="rounded-[32px] overflow-hidden max-w-[640px] w-full pr-0 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
              <ProductShowcaseCarousel
                products={content.featuredProducts}
                currentSlide={currentSlide}
                onSlideChange={setCurrentSlide}
              />
            </div>
          </motion.div>

          {/* Text content — badge, heading, paragraph, buttons only on mobile */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl order-1 text-center lg:text-left mx-auto lg:mx-0"
          >
            <span className="mb-4 sm:mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-sm font-semibold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#f7a236] backdrop-blur-sm">
              <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-[#f7a236] animate-pulse" />
              Trusted mobility solutions
            </span>

            <h1 className="font-poppins text-[1.75rem] leading-[1.2] sm:text-3.5xl sm:leading-[1.1] lg:text-5xl font-semibold text-white mb-4 sm:mb-5">
              {content.title}
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-blue-50/90 mb-6 sm:mb-7 leading-relaxed">
              {content.subtitle}
            </p>

            {/* Animated Statistics — hidden on mobile, visible from sm up */}
            {content.statistics.length > 0 && (
              <div className="hidden sm:grid mb-8 grid-cols-3 gap-4">
                {content.statistics.map((stat, index) => (
                  <div
                    key={index}
                    className="rounded-[20px] border border-white/15 bg-white/[0.03] p-4 text-left transition-colors hover:border-white/25"
                  >
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

            {/* Dynamic CTAs — always one row, smaller on mobile */}
            <div className="flex flex-row gap-2 sm:gap-4 justify-center lg:justify-start">
              {content.ctaButtons.map((button, index) => (
                <PrimaryButton
                  key={index}
                  href={button.href}
                  size="sm"
                  className="text-xs px-4 py-2 sm:text-base sm:px-7 sm:py-3 sm:size-lg"
                  variant={button.variant === 'secondary' ? 'secondary' : 'primary'}
                >
                  {button.text}
                </PrimaryButton>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
  }

  return (
    <section className="relative z-10 overflow-hidden bg-gradient-to-br from-[#07162d] via-[#0f2d4c] to-[#2f8f8f] px-4 pt-14 pb-10 sm:pt-20 md:pt-20 md:pb-20">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute left-[-8%] top-[-10%] h-40 w-40 sm:h-56 sm:w-56 rounded-full bg-[#f7a236]/35 blur-3xl" />
        <div className="absolute bottom-[-8%] right-[-6%] h-48 w-48 sm:h-64 sm:w-64 rounded-full bg-[#3fa2a3]/30 blur-3xl" />
      </div>

      <div className="container-center relative">
        <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-[1.05fr_0.95fr]">

          {/* Product Showcase Carousel — hidden on mobile, visible from lg up */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:flex relative justify-end order-2 pr-0"
          >
            <div className=" max-w-[640px] w-full p-0">
              <ProductShowcaseCarousel
                products={content.featuredProducts}
                currentSlide={currentSlide}
                onSlideChange={setCurrentSlide}
              />
            </div>
          </motion.div>

          {/* Text content — badge, heading, paragraph, buttons only on mobile */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl order-1 text-center lg:text-left mx-auto lg:mx-0"
          >
            <span className="mb-4 sm:mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-sm font-semibold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#f7a236] backdrop-blur-sm">
              <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-[#f7a236] animate-pulse" />
              Trusted mobility solutions
            </span>

            <h1 className="font-poppins text-[1.75rem] leading-[1.2] sm:text-3.5xl sm:leading-[1.1] lg:text-5xl font-semibold text-white mb-4 sm:mb-5">
              {content.title}
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-blue-50/90 mb-6 sm:mb-7 leading-relaxed">
              {content.subtitle}
            </p>

            {/* Animated Statistics — hidden on mobile, visible from sm up */}
            {content.statistics.length > 0 && (
              <div className="hidden sm:grid mb-8 grid-cols-3 gap-4">
                {content.statistics.map((stat, index) => (
                  <div
                    key={index}
                    className="rounded-[20px] border border-white/15 bg-white/[0.03] p-4 text-left transition-colors hover:border-white/25"
                  >
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
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
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

        </div>
      </div>
    </section>
  );
};

export default EnhancedHero;