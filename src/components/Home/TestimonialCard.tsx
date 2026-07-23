import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Testimonial } from '../../lib/data/testimonials';

interface TestimonialCardProps {
  testimonial: Testimonial;
  index: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial, index }) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex h-full flex-col rounded-[24px] bg-white p-6 text-center"
    >
      {/* Header */}
      <div className="flex flex-col items-center mb-4 text-center">
        {testimonial.image ? (
          <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
            <Image
              src={testimonial.image}
              alt={testimonial.name}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#0b1f3a] to-[#3fa2a3]">
            <span className="text-lg font-semibold text-white">
              {testimonial.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
        )}
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
            {testimonial.verified && (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#3fa2a3]">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600">{testimonial.location}</p>
        </div>
      </div>

      {/* Rating */}
      <div className="mb-4 flex flex-col items-center justify-center gap-2">
        <div className="flex justify-center gap-1">
          {renderStars(testimonial.rating)}
        </div>
        <span className="text-sm text-gray-600">{testimonial.rating}/5</span>
      </div>

      {/* Testimonial Text */}
      <blockquote className="mb-4 flex-1 text-gray-700">
        "{testimonial.text}"
      </blockquote>

      {/* Product */}
      <div className="border-t border-gray-100 pt-4 text-center">
        <div className="flex flex-col items-center justify-center gap-1">
          <span className="text-sm font-medium text-[#153a5f]">
            {testimonial.product}
          </span>
          <div className="text-xs text-gray-500">
            Verified Purchase
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TestimonialCard;
