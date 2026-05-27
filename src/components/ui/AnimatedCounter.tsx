import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AnimatedCounterProps {
  value: string;
  label: string;
  delay?: number;
  icon?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ 
  value, 
  label, 
  delay = 0,
  icon 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  // Only use digit-split animation when the value is truly a number+suffix pattern
  // e.g. "1000+" or "5 Years" — NOT "24/7" (slash would be stripped into "247/")
  const numericValue = value.replace(/[^\d]/g, '');
  const suffix = value.replace(/[\d]/g, '');
  const isAnimatable = numericValue.length > 0 && (numericValue + suffix === value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.6, delay: delay / 1000 }}
      className="text-center"
    >
      <div className="flex flex-col items-center">
        {icon && (
          <div className="mb-2 text-blue-600">
            {/* Icon will be rendered based on icon name */}
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">📊</span>
            </div>
          </div>
        )}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: isVisible ? 1 : 0.8 }}
          transition={{ duration: 0.4, delay: delay / 1000 + 0.2 }}
          className="text-3xl md:text-4xl font-bold text-gray-900 mb-1"
        >
          {isAnimatable ? (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible ? 1 : 0 }}
              transition={{ duration: 0.8, delay: delay / 1000 + 0.3 }}
            >
              {numericValue}
            </motion.span>
          ) : (
            value
          )}
          {suffix && isAnimatable && (
            <span className="text-blue-600">{suffix}</span>
          )}
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 0.6, delay: delay / 1000 + 0.4 }}
          className="text-sm text-gray-600 font-medium"
        >
          {label}
        </motion.p>
      </div>
    </motion.div>
  );
};

export default AnimatedCounter;
