import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaHeadset, FaShieldAlt, FaUsers } from 'react-icons/fa';

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

  const iconMap: Record<string, React.ReactNode> = {
    FaUsers: <FaUsers className="h-5 w-5" />,
    FaShieldAlt: <FaShieldAlt className="h-5 w-5" />,
    FaHeadset: <FaHeadset className="h-5 w-5" />
  };

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
      <div className="flex flex-col items-center rounded-2xl border border-[#3fa2a3]/15 bg-gradient-to-br from-white to-[#f9f7f3] p-4 shadow-[0_10px_30px_rgba(13,22,60,0.06)]">
        {icon && (
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3fa2a3] to-[#f7a236] text-white shadow-lg">
            {iconMap[icon] || <FaUsers className="h-5 w-5" />}
          </div>
        )}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: isVisible ? 1 : 0.8 }}
          transition={{ duration: 0.4, delay: delay / 1000 + 0.2 }}
          className="text-2xl md:text-3xl font-bold text-[#0d163c] mb-1"
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
            <span className="text-[#3fa2a3]">{suffix}</span>
          )}
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 0.6, delay: delay / 1000 + 0.4 }}
          className="text-xs md:text-sm text-gray-600 font-medium"
        >
          {label}
        </motion.p>
      </div>
    </motion.div>
  );
};

export default AnimatedCounter;
