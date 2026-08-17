import React from 'react';
import { motion } from 'framer-motion';
import { trustIndicators } from '../../lib/data/trust-indicators';
import TrustCard from './TrustCard';

const TrustIndicators: React.FC = () => {
  return (
    <section className="py-16 md:py-20 bg-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-[#0b1f3a] md:text-4xl">
            Why Choose Medtrion?
          </h2>
          <div className="mx-auto mb-4 h-1.5 w-24 rounded-full bg-gradient-to-r from-[#f7a236] to-[#3fa2a3]" />
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Join thousands of satisfied customers who have regained their independence with our exceptional mobility solutions
          </p>
        </motion.div>
        
        {/* Trust Cards Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trustIndicators.map((indicator, index) => (
            <TrustCard
              key={index}
              indicator={indicator}
              index={index}
            />
          ))}
        </div>

        {/* Social Proof Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-[#f0f9f8] to-[#fef3e2] rounded-2xl p-8 border border-[#3fa2a3]/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-5xl font-primary font-bold text-[#3fa2a3] mb-2">1000+</div>
                <div className="text-[#4b5563] font-primary font-medium">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-primary font-bold text-[#f7a236] mb-2">4.9/5</div>
                <div className="text-[#4b5563] font-primary font-medium">Customer Rating</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-primary font-bold text-[#0d163c] mb-2">13+</div>
                <div className="text-[#4b5563] font-primary font-medium">Years Experience</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrustIndicators;
