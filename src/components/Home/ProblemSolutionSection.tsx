import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { problemsSolutions } from '../../lib/data/problems-solutions';
import ProblemCard from './ProblemCard';
import { PrimaryButton } from '../ui';

const ProblemSolutionSection: React.FC = () => {
  const [activeProblem, setActiveProblem] = useState(0);

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-primary font-bold text-[#0d163c] mb-4">
            We Understand Your Challenges
          </h2>
          <div className="mx-auto mb-4 h-1.5 w-24 rounded-full bg-gradient-to-r from-[#f7a236] to-[#3fa2a3]" />
          <p className="text-lg md:text-xl text-[#4b5563] max-w-2xl mx-auto font-primary">
            Every mobility challenge has a solution. Let us help you find yours with our comprehensive range of products and services.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Problem Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-3xl font-primary font-bold text-[#0d163c] mb-6">
              Select Your Challenge
            </h3>
            {problemsSolutions.map((problem, index) => (
              <ProblemCard
                key={index}
                problem={problem}
                isActive={activeProblem === index}
                onClick={() => setActiveProblem(index)}
              />
            ))}
          </motion.div>
          
          {/* Solution Display */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:sticky lg:top-8"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeProblem}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-white to-[#f9f7f3] rounded-2xl shadow-lg border border-[#3fa2a3]/20 p-8"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#3fa2a3]/20 to-[#f7a236]/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#3fa2a3]/40">
                    <span className="text-3xl">
                      {problemsSolutions[activeProblem] ? 
                        (() => {
                          const iconMap: Record<string, string> = {
                            'FaStairs': '🪜',
                            'FaWheelchair': '♿',
                            'FaShieldAlt': '🛡️',
                            'FaTree': '🌳',
                            'FaHandsHelping': '🤝',
                            'FaExclamationTriangle': '⚠️'
                          };
                          return iconMap[problemsSolutions[activeProblem].icon] || '📊';
                        })() : '📊'
                      }
                    </span>
                  </div>
                  <h3 className="text-3xl font-primary font-bold text-[#0d163c] mb-2">
                    Our Solution
                  </h3>
                  <p className="text-lg font-primary font-semibold text-[#3fa2a3]">
                    {problemsSolutions[activeProblem]?.solution}
                  </p>
                </div>
                
                <p className="text-[#4b5563] mb-6 text-center font-primary">
                  {problemsSolutions[activeProblem]?.description}
                </p>
                
                {/* Product List */}
                <div className="mb-6">
                  <h4 className="text-lg font-primary font-semibold text-[#0d163c] mb-4">
                    Recommended Products:
                  </h4>
                  <div className="space-y-3">
                    {problemsSolutions[activeProblem]?.products.map((product, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center p-3 bg-blue-50 rounded-lg"
                      >
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-700 font-medium">{product}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                {/* CTA Buttons */}
                <div className="space-y-3">
                  <PrimaryButton 
                    href="/products" 
                    className="w-full"
                  >
                    Explore All Solutions
                  </PrimaryButton>
                  <PrimaryButton 
                    href="/consultation/google-form" 
                    variant="secondary"
                    className="w-full"
                  >
                    Get Free Consultation
                  </PrimaryButton>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-16"
        >
          <div className="w-full bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Still Not Sure Which Solution Is Right For You?
            </h3>
            <p className="text-gray-600 mb-6">
              Our mobility experts are here to help you find the perfect solution for your specific needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <PrimaryButton href="/consultation/google-form" size="lg">
                Schedule Free Consultation
              </PrimaryButton>
              <PrimaryButton href="/products" size="lg" variant="secondary">
                Browse All Products
              </PrimaryButton>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProblemSolutionSection;
