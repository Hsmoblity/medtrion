import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { problemsSolutions } from '../../lib/data/problems-solutions';
import ProblemCard from './ProblemCard';
import { PrimaryButton } from '../ui';

const ProblemSolutionSection: React.FC = () => {
  const [activeProblem, setActiveProblem] = useState(0);

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            We Understand Your Challenges
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
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
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
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
                className="bg-white rounded-2xl shadow-xl p-8"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Our Solution
                  </h3>
                  <p className="text-lg text-blue-600 font-semibold">
                    {problemsSolutions[activeProblem]?.solution}
                  </p>
                </div>
                
                <p className="text-gray-700 mb-6 text-center">
                  {problemsSolutions[activeProblem]?.description}
                </p>
                
                {/* Product List */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
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
                    href="/contact" 
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
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Still Not Sure Which Solution Is Right For You?
            </h3>
            <p className="text-gray-600 mb-6">
              Our mobility experts are here to help you find the perfect solution for your specific needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <PrimaryButton href="/contact" size="lg">
                Schedule Free Consultation
              </PrimaryButton>
              <PrimaryButton href="/products" variant="secondary" size="lg">
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
