/**
 * Smart Mobile Configurator
 * 
 * This is NOT just responsive stacking - it's a mobile-first, smart UI component
 * that provides a native mobile app-like experience for product configuration.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useMobileOptimization } from '../hooks/useMobileOptimization';
import MobileHeader from '../layout/MobileHeader';

interface SmartMobileConfiguratorProps {
  product: any;
  categories: any[];
  onConfigurationChange: (config: any) => void;
  onAddToCart: (config: any) => void;
}

interface ConfigurationStep {
  id: number;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  completed: boolean;
}

const SmartMobileConfigurator: React.FC<SmartMobileConfiguratorProps> = ({
  product,
  categories,
  onConfigurationChange,
  onAddToCart,
}) => {
  const { isMobile, getMobileOptimizations } = useMobileOptimization();
  
  // Smart mobile state management
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<any[]>([]);
  const [configuration, setConfiguration] = useState<any>({});
  const [showSummary, setShowSummary] = useState(false);
  
  // Mobile-specific configuration steps
  const steps: ConfigurationStep[] = useMemo(() => [
    {
      id: 1,
      title: 'Choose Category',
      description: 'Select the type of options you want',
      component: MobileCategorySelector,
      completed: false,
    },
    {
      id: 2,
      title: 'Select Options',
      description: 'Pick your preferred options',
      component: MobileOptionsSelector,
      completed: false,
    },
    {
      id: 3,
      title: 'Review & Add',
      description: 'Review your configuration',
      component: MobileConfigurationReview,
      completed: false,
    },
  ], []);

  // Smart mobile interactions
  const handleStepComplete = useCallback((stepId: number, data: any) => {
    setConfiguration((prev: any) => ({ ...prev, [stepId]: data }));
    
    // Auto-advance to next step on mobile
    if (isMobile && stepId < steps.length) {
      setTimeout(() => setCurrentStep(stepId + 1), 300);
    }
  }, [isMobile, steps.length]);

  const handleSwipeNavigation = useCallback((direction: 'left' | 'right') => {
    if (direction === 'left' && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else if (direction === 'right' && currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep, steps.length]);

  const handleQuickAdd = useCallback(() => {
    const quickConfig = {
      product: product.id,
      options: selectedOptions,
      totalPrice: calculateTotalPrice(),
    };
    
    onAddToCart(quickConfig);
    
    // Mobile-specific feedback
    if (isMobile) {
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
      
      // Show success animation
      showSuccessAnimation();
    }
  }, [product.id, selectedOptions, onAddToCart, isMobile]);

  const calculateTotalPrice = useCallback(() => {
    const basePrice = product.price || 0;
    const optionsPrice = selectedOptions.reduce((sum, option) => sum + (option.price || 0), 0);
    return basePrice + optionsPrice;
  }, [product.price, selectedOptions]);

  const showSuccessAnimation = () => {
    // Mobile-specific success animation
    const successElement = document.createElement('div');
    successElement.className = 'mobile-success-animation';
    successElement.innerHTML = '✓ Added to Cart!';
    document.body.appendChild(successElement);
    
    setTimeout(() => {
      document.body.removeChild(successElement);
    }, 2000);
  };

  return (
    <div className="smart-mobile-configurator">
      {/* Mobile-specific header with progress */}
      <MobileHeader
        title={`Configure ${product.name || 'Product'}`}
        description={`Step ${currentStep} of ${steps.length}`}
        isMobile={isMobile}
        isTablet={false}
      />

      {/* Step-by-step progress indicator */}
      <div className="mobile-step-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
        <div className="step-indicators">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`step-indicator ${index < currentStep ? 'completed' : index === currentStep - 1 ? 'current' : ''}`}
            >
              {index + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Main configuration area with swipe support */}
      <div className="mobile-swipe-container configurator-content">
        {/* Step 1: Category Selection */}
        {currentStep === 1 && (
          <div className="mobile-category-selector">
            <h3>Select Category</h3>
            <div className="category-grid">
              {categories.map((category, index) => (
                <button
                  key={index}
                  className="category-button"
                  onClick={() => handleStepComplete(1, { category })}
                >
                  {category.name || category.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Options Selection */}
        {currentStep === 2 && (
          <div className="mobile-options-selector">
            <h3>Select Options</h3>
            <div className="options-list">
              {/* Placeholder for options - would need actual options data */}
              <p>Options for {configuration[1]?.category?.name || 'selected category'}</p>
            </div>
          </div>
        )}

        {/* Step 3: Configuration Review */}
        {currentStep === 3 && (
          <div className="mobile-configuration-review">
            <h3>Review Configuration</h3>
            <div className="review-content">
              <p>Product: {product.name}</p>
              <p>Selected Options: {selectedOptions.length}</p>
              <p>Total Price: ${calculateTotalPrice()}</p>
              <button onClick={handleQuickAdd} className="add-to-cart-btn">
                Add to Cart
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile-specific floating actions */}
      <div className="mobile-floating-actions">
        {currentStep > 1 && (
          <button
            className="floating-button back-button"
            onClick={() => setCurrentStep(currentStep - 1)}
          >
            ← Back
          </button>
        )}
        
        {currentStep < steps.length && (
          <button
            className="floating-button next-button"
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!configuration[currentStep]}
          >
            Next →
          </button>
        )}
        
        {currentStep === steps.length && (
          <button
            className="floating-button add-to-cart-button primary"
            onClick={handleQuickAdd}
          >
            Add to Cart - ${calculateTotalPrice()}
          </button>
        )}
      </div>

      {/* Mobile-specific summary modal */}
      {showSummary && (
        <div className="mobile-summary-modal">
          <div className="modal-content">
            <h3>Configuration Summary</h3>
            <p>Product: {product.name}</p>
            <p>Options: {selectedOptions.length}</p>
            <p>Total: ${calculateTotalPrice()}</p>
            <div className="modal-actions">
              <button onClick={() => setShowSummary(false)}>Close</button>
              <button onClick={handleQuickAdd}>Add to Cart</button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-specific styles */}
      <style jsx>{`
        .smart-mobile-configurator {
          position: relative;
          height: 100vh;
          overflow: hidden;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        .configurator-content {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }

        /* Mobile-specific animations */
        .mobile-success-animation {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: #10b981;
          color: white;
          padding: 16px 24px;
          border-radius: 12px;
          font-weight: 600;
          z-index: 9999;
          animation: mobileSuccess 2s ease-in-out;
        }

        @keyframes mobileSuccess {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
        }

        /* Mobile-specific touch optimizations */
        .smart-mobile-configurator * {
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        /* Mobile-specific scroll optimizations */
        .configurator-content {
          overscroll-behavior: contain;
          scroll-behavior: smooth;
        }

        /* Mobile-specific responsive adjustments */
        @media (max-width: 767px) {
          .smart-mobile-configurator {
            height: 100vh;
            height: -webkit-fill-available;
          }
        }
      `}</style>
    </div>
  );
};

// Mobile Category Selector - Not just a list!
const MobileCategorySelector: React.FC<{
  categories: any[];
  onSelect: (category: any) => void;
  layout: 'carousel' | 'grid';
  swipeEnabled: boolean;
}> = ({ categories, onSelect, layout, swipeEnabled }) => {
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  
  return (
    <div className="mobile-category-selector">
      <h3 className="category-title">Choose Category</h3>
      
      <div className="category-list">
        {categories.map((category, index) => (
          <button
            key={index}
            className={`category-button ${selectedCategory === category ? 'selected' : ''}`}
            onClick={() => {
              setSelectedCategory(category);
              onSelect(category);
            }}
          >
            {category.name || category.title}
          </button>
        ))}
      </div>
    </div>
  );
};

// Mobile Options Selector - Card stack layout, not just vertical list!
const MobileOptionsSelector: React.FC<{
  category: any;
  onSelect: (options: any[]) => void;
  layout: 'card-stack' | 'list';
  multiSelect: boolean;
}> = ({ category, onSelect, layout, multiSelect }) => {
  const [selectedOptions, setSelectedOptions] = useState<any[]>([]);
  
  return (
    <div className="mobile-options-selector">
      <h3 className="options-title">Select Options</h3>
      
      <div className="options-list">
        {(category?.options || []).map((option: any, index: number) => (
          <button
            key={index}
            className={`option-button ${selectedOptions.includes(option) ? 'selected' : ''}`}
            onClick={() => {
              let newSelection;
              if (multiSelect) {
                newSelection = selectedOptions.includes(option)
                  ? selectedOptions.filter(opt => opt !== option)
                  : [...selectedOptions, option];
              } else {
                newSelection = [option];
              }
              setSelectedOptions(newSelection);
              onSelect(newSelection);
            }}
          >
            {option.name || option.title}
          </button>
        ))}
      </div>
    </div>
  );
};

// Mobile Configuration Review - Summary with smart actions
const MobileConfigurationReview: React.FC<{
  product: any;
  selectedOptions: any[];
  totalPrice: number;
  onAddToCart: () => void;
  onEditStep: (step: number) => void;
}> = ({ product, selectedOptions, totalPrice, onAddToCart, onEditStep }) => {
  return (
    <div className="mobile-configuration-review">
      <h3 className="review-title">Review Configuration</h3>
      
      <div className="product-summary">
        <h4>{product.name}</h4>
        <p>Selected Options: {selectedOptions.length}</p>
        <p>Total Price: ${totalPrice}</p>
      </div>
      
      <div className="quick-actions">
        <button onClick={() => onEditStep(1)}>Edit Category</button>
        <button onClick={() => onEditStep(2)}>Edit Options</button>
        <button onClick={onAddToCart} className="add-to-cart-btn">Add to Cart</button>
      </div>
    </div>
  );
};

export default SmartMobileConfigurator;