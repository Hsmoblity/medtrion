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
      className="group relative rounded-[24px] border border-[#0b1f3a]/10 bg-white p-6 shadow-[0_15px_40px_rgba(11,31,58,0.06)] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(11,31,58,0.1)]"
    >
      {/* Icon */}
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#fff5e0] via-[#fde7c2] to-[#f7d79a] border border-[#f7c17d]/40 shadow-sm transition-transform duration-300 group-hover:scale-110">
        <span className="text-2xl text-[#b56e0b]">{getIconComponent(indicator.icon)}</span>
      </div>

      {/* Content */}
      <div className="text-center">
        <h3 className="mb-2 text-xl font-semibold text-[#0b1f3a] transition-colors duration-300 group-hover:text-[#3fa2a3]">
          {indicator.title}
        </h3>
        
        <p className="mb-4 text-sm leading-relaxed text-gray-600">
          {indicator.description}
        </p>

        {/* Highlight */}
        <div className="inline-flex items-center rounded-[35px] bg-[#3fa2a3] px-4 py-2 text-sm font-primary font-semibold text-white shadow-md">
          {indicator.highlight}
        </div>

        {/* Value (if provided) */}
        {indicator.value && (
          <div className="mt-3 text-2xl font-bold text-gray-900">
            {indicator.value}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TrustCard;
