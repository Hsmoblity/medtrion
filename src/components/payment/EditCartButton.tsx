import React from 'react';
import { useRouter } from 'next/router';

interface EditCartButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  onEditCart?: () => void;
}

const EditCartButton: React.FC<EditCartButtonProps> = ({
  variant = 'outline',
  size = 'medium',
  className = '',
  onEditCart
}) => {
  const router = useRouter();

  const handleEditCart = () => {
    if (onEditCart) {
      onEditCart();
    } else {
      router.push('/cart');
    }
  };

  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg'
  };

  const variantClasses = {
    primary: 'bg-[#3fa2a3] text-white hover:bg-[#f7a236] border-[#3fa2a3] rounded-[35px] px-6 py-3',
    secondary: 'bg-[#f7a236] text-white hover:bg-[#3fa2a3] border-[#f7a236] rounded-[35px] px-6 py-3',
    outline: 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600 hover:border-gray-400'
  };

  return (
    <button
      onClick={handleEditCart}
      className={`
        w-full rounded-lg border-2 font-medium
        focus:outline-none focus:ring-2 focus:ring-[#3fa2a3] focus:ring-offset-2
        transition-all duration-200
        flex items-center justify-center gap-2
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      aria-label="Edit shopping cart"
    >
      {/* Edit Icon */}
      <svg 
        className="w-5 h-5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" 
        />
      </svg>
      <span>Edit Cart</span>
    </button>
  );
};

export default EditCartButton;
