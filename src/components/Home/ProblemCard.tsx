import React from 'react';
import { motion } from 'framer-motion';
import { ProblemSolution } from '../../lib/data/problems-solutions';

interface ProblemCardProps {
  problem: ProblemSolution;
  isActive: boolean;
  onClick: () => void;
}

const ProblemCard: React.FC<ProblemCardProps> = ({ problem, isActive, onClick }) => {
  // Simple icon mapping - in production, this would use react-icons dynamically
  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, string> = {
      'FaStairs': '🪜',
      'FaWheelchair': '♿',
      'FaShieldAlt': '🛡️',
      'FaTree': '🌳',
      'FaHandsHelping': '🤝',
      'FaExclamationTriangle': '⚠️'
    };
    return iconMap[iconName] || '📊';
  };

  return (
    <motion.button
      onClick={onClick}
      className={`w-full p-6 text-left rounded-lg border-2 transition-all duration-300 ${
        isActive
          ? 'border-orange-600 bg-orange-50 shadow-lg'
          : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center mb-3">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 transition-colors ${
          isActive ? 'bg-orange-100' : 'bg-gray-100'
        }`}>
          <span className="text-2xl">{getIconComponent(problem.icon)}</span>
        </div>
        <h3 className={`text-xl font-semibold transition-colors ${
          isActive ? 'text-brand-dark' : 'text-gray-900'
        }`}>
          {problem.problem}
        </h3>
      </div>
      <p className={`text-sm transition-colors ${
        isActive ? 'text-brand-dark' : 'text-gray-600'
      }`}>
        {problem.solution}
      </p>
    </motion.button>
  );
};

export default ProblemCard;
