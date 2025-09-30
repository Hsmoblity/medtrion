import React from 'react';
import { motion } from 'framer-motion';
import { TrustIndicator } from '../../lib/data/trust-indicators';

interface TrustCardProps {
  indicator: TrustIndicator;
  index: number;
}

const TrustCard: React.FC<TrustCardProps> = ({ indicator, index }) => {
  // Simple icon mapping - in production, this would use react-icons dynamically
  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, string> = {
      'FaShieldAlt': '🛡️',
      'FaUsers': '👥',
      'FaHeadset': '🎧',
      'FaAward': '🏆',
      'FaTruck': '🚚',
      'FaHeart': '❤️'
    };
    return iconMap[iconName] || '📊';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group relative bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border border-gray-100"
    >
      {/* Icon */}
      <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
        <span className="text-2xl">{getIconComponent(indicator.icon)}</span>
      </div>

      {/* Content */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
          {indicator.title}
        </h3>
        
        <p className="text-gray-600 mb-4 text-sm leading-relaxed">
          {indicator.description}
        </p>

        {/* Highlight */}
        <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-full">
          {indicator.highlight}
        </div>

        {/* Value (if provided) */}
        {indicator.value && (
          <div className="mt-3 text-2xl font-bold text-gray-900">
            {indicator.value}
          </div>
        )}
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50/50 group-hover:to-indigo-50/50 rounded-2xl transition-all duration-300 pointer-events-none" />
    </motion.div>
  );
};

export default TrustCard;
