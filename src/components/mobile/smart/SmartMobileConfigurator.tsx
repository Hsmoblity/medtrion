/**
 * Smart Mobile Configurator
 * 
 * This is NOT just responsive stacking - it's a mobile-first, smart UI component
 * that provides a native mobile app-like experience for product configuration.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useMobileOptimization } from '../../hooks/useMobileOptimization';

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
  const { isMobile, touchTargetSize, getSpacing } = useMobileOptimization();
  
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
    setConfiguration(prev => ({ ...prev, [stepId]: data }));
    
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
      <MobileConfiguratorHeader
        product={product}
        currentStep={currentStep}
        totalSteps={steps.length}
        onClose={() => setShowSummary(false)}
      />

      {/* Step-by-step progress indicator */}
      <MobileStepProgress
        steps={steps}
        currentStep={currentStep}
        onStepClick={setCurrentStep}
      />

      {/* Main configuration area with swipe support */}
      <MobileSwipeContainer
        currentIndex={currentStep - 1}
        onSwipe={handleSwipeNavigation}
        className="configurator-content"
      >
        {/* Step 1: Category Selection */}
        {currentStep === 1 && (
          <MobileCategorySelector
            categories={categories}
            onSelect={(category) => handleStepComplete(1, { category })}
            layout="carousel" // Not just a list!
            swipeEnabled={true}
          />
        )}

        {/* Step 2: Options Selection */}
        {currentStep === 2 && (
          <MobileOptionsSelector
            category={configuration[1]?.category}
            onSelect={(options) => {
              setSelectedOptions(options);
              handleStepComplete(2, { options });
            }}
            layout="card-stack" // Not just vertical list!
            multiSelect={true}
          />
        )}

        {/* Step 3: Configuration Review */}
        {currentStep === 3 && (
          <MobileConfigurationReview
            product={product}
            selectedOptions={selectedOptions}
            totalPrice={calculateTotalPrice()}
            onAddToCart={handleQuickAdd}
            onEditStep={setCurrentStep}
          />
        )}
      </MobileSwipeContainer>

      {/* Mobile-specific floating actions */}
      <MobileFloatingActions>
        {currentStep > 1 && (
          <MobileFloatingButton
            icon="arrow-left"
            position="bottom-left"
            onTap={() => setCurrentStep(currentStep - 1)}
            label="Back"
          />
        )}
        
        {currentStep < steps.length && (
          <MobileFloatingButton
            icon="arrow-right"
            position="bottom-right"
            onTap={() => setCurrentStep(currentStep + 1)}
            label="Next"
            disabled={!configuration[currentStep]}
          />
        )}
        
        {currentStep === steps.length && (
          <MobileFloatingButton
            icon="cart"
            position="bottom-center"
            onTap={handleQuickAdd}
            label={`Add to Cart - $${calculateTotalPrice()}`}
            variant="primary"
            size="large"
          />
        )}
      </MobileFloatingActions>

      {/* Mobile-specific summary modal */}
      {showSummary && (
        <MobileSummaryModal
          product={product}
          selectedOptions={selectedOptions}
          totalPrice={calculateTotalPrice()}
          onClose={() => setShowSummary(false)}
          onAddToCart={handleQuickAdd}
        />
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
          padding: ${getSpacing(16)}px;
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
      
      {layout === 'carousel' ? (
        <MobileCategoryCarousel
          categories={categories}
          selectedCategory={selectedCategory}
          onSelect={(category) => {
            setSelectedCategory(category);
            onSelect(category);
          }}
          swipeEnabled={swipeEnabled}
        />
      ) : (
        <MobileCategoryGrid
          categories={categories}
          selectedCategory={selectedCategory}
          onSelect={(category) => {
            setSelectedCategory(category);
            onSelect(category);
          }}
        />
      )}
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
      
      {layout === 'card-stack' ? (
        <MobileOptionsCardStack
          options={category?.options || []}
          selectedOptions={selectedOptions}
          onSelect={(options) => {
            setSelectedOptions(options);
            onSelect(options);
          }}
          multiSelect={multiSelect}
        />
      ) : (
        <MobileOptionsList
          options={category?.options || []}
          selectedOptions={selectedOptions}
          onSelect={(options) => {
            setSelectedOptions(options);
            onSelect(options);
          }}
          multiSelect={multiSelect}
        />
      )}
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
      
      <MobileProductSummary
        product={product}
        selectedOptions={selectedOptions}
        totalPrice={totalPrice}
      />
      
      <MobileQuickActions
        onEditStep={onEditStep}
        onAddToCart={onAddToCart}
      />
    </div>
  );
};

export default SmartMobileConfigurator;