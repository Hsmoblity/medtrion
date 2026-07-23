import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { testimonials } from '../../lib/data/testimonials';
import TestimonialCard from './TestimonialCard';
import { PrimaryButton } from '../ui';

const TestimonialCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Pause auto-play on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-[#f4f8fb] via-[#f7fbfd] to-[#fef7eb]">
      <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-[#0b1f3a] md:text-4xl">
            What Our Customers Say
          </h2>
          <div className="mx-auto mb-4 h-1.5 w-24 rounded-full bg-gradient-to-r from-[#f7a236] to-[#3fa2a3]" />
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Don't just take our word for it. Here's what real customers have to say about their experience with Medtrion.
          </p>
        </motion.div>

        <div className="rounded-[28px] p-6 sm:p-8 text-center">
        {/* Desktop Carousel */}
        <div className="hidden lg:block">
          <div 
            className="relative mx-auto max-w-[600px]"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Main Testimonial */}
            <div className="relative h-96 mb-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <TestimonialCard 
                    testimonial={testimonials[currentIndex]} 
                    index={0}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Dots Navigation */}
            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-3 w-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'scale-125 bg-[#3fa2a3]'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Grid */}
        <div className="lg:hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.slice(0, 4).map((testimonial, index) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <PrimaryButton href="/contact" size="lg">
              Join Our Happy Customers
            </PrimaryButton>
            <PrimaryButton href="/#reviews" size="lg" variant="secondary">
              Read More Reviews
            </PrimaryButton>
          </div>
        </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialCarousel;
