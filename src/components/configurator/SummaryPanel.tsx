import React, { useEffect, useRef } from 'react';
import { animate } from 'framer-motion';
import { PrimaryButton } from '../ui';

interface AnimatedNumberProps {
  from: number;
  to: number;
  duration?: number;
  prefix?: string;
  postfix?: string;
  className?: string;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ from, to, duration = 0.5, prefix = '', postfix = '', className }) => {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    // Ensure values are numbers and have defaults
    const safeFrom = typeof from === 'number' && !isNaN(from) ? from : 0;
    const safeTo = typeof to === 'number' && !isNaN(to) ? to : 0;

    const controls = animate(safeFrom, safeTo, {
      duration,
      onUpdate(value) {
        // Guard against undefined/null values
        const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
        node.textContent = `${prefix}${safeValue.toFixed(2)}${postfix}`;
      }
    });

    return () => controls.stop();
  }, [from, to, duration, prefix, postfix]);

  return <span ref={nodeRef} className={className} />;
};


interface ConfigurationSummary {
  basePrice: number;
  optionsTotal: number;
  installationCost: number;
  shippingCost: number;
  taxAmount: number;
  grandTotal: number;
  estimatedDelivery: string;
}

interface SummaryPanelProps {
  // Original props for backward compatibility
  title?: string;
  currentValue?: number;
  previousValue?: number;
  className?: string;
  
  // New props for configuration-based usage
  configuration?: ConfigurationSummary;
  previousConfiguration?: ConfigurationSummary;
  onAddToCart?: () => void;
  onViewFinancing?: () => void;
  onCheckInsurance?: () => void;
  loading?: boolean;
  disabled?: boolean;
  
  // Analytics and accessibility
  onConfigurationAnalytics?: (event: string, data: any) => void;
  screenReaderOptimized?: boolean;
}

const SummaryPanel: React.FC<SummaryPanelProps> = ({ 
  title, 
  currentValue, 
  previousValue = 0, 
  className,
  configuration,
  previousConfiguration,
  onAddToCart,
  onViewFinancing,
  onCheckInsurance,
  loading = false,
  disabled = false,
  onConfigurationAnalytics,
  screenReaderOptimized = false
}) => {
  // If configuration is provided, render the full summary panel
  if (configuration) {
    const prevConfig = previousConfiguration || {
      basePrice: 0,
      optionsTotal: 0,
      installationCost: 0,
      shippingCost: 0,
      taxAmount: 0,
      grandTotal: 0,
      estimatedDelivery: '',
      financingOptions: [],
      insuranceEstimate: undefined
    };

    // Analytics helper
    const trackEvent = (event: string, data: any) => {
      onConfigurationAnalytics?.(event, data);
      
      // Google Analytics 4 tracking
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', event, {
          event_category: 'configurator',
          ...data
        });
      }
    };

    const handleAddToCart = () => {
      trackEvent('configuration_add_to_cart', {
        base_price: configuration.basePrice,
        options_total: configuration.optionsTotal,
        grand_total: configuration.grandTotal,
        options_count: Math.round((configuration.optionsTotal || 0) / 100) // Rough estimate
      });
      onAddToCart?.();
    };

    const handleViewFinancing = () => {
      trackEvent('configuration_view_financing', {
        total_amount: configuration.grandTotal
      });
      onViewFinancing?.();
    };

    const handleCheckInsurance = () => {
      trackEvent('configuration_check_insurance', {
        total_amount: configuration.grandTotal
      });
      onCheckInsurance?.();
    };

    return (
      <div 
        className={`configuration-summary-container bg-white rounded-lg shadow-md p-6 sticky top-4 ${className || ''}`}
        role="complementary"
        aria-label="Configuration pricing summary"
      >
        <h2 className="configuration-summary-title text-xl font-bold text-gray-900 mb-6">Configuration Summary</h2>
        
        {/* Live region for screen readers */}
        <div 
          aria-live="polite" 
          aria-atomic="true" 
          className={screenReaderOptimized ? 'sr-only' : 'hidden'}
        >
          Total price updated to ${configuration.grandTotal?.toFixed(2) || '0.00'}
        </div>
        
        <div className="configuration-summary-details space-y-4">
          {/* Base Price */}
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-600">Base Price</span>
            <AnimatedNumber
              from={prevConfig.basePrice}
              to={configuration.basePrice || 0}
              prefix="$"
              className="font-semibold text-gray-900"
            />
          </div>
          
          {/* Options Total */}
          {(configuration.optionsTotal || 0) > 0 && (
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Options</span>
              <AnimatedNumber
                from={prevConfig.optionsTotal}
                to={configuration.optionsTotal || 0}
                prefix="$"
                className="font-semibold text-gray-900"
              />
            </div>
          )}
          
          {/* Installation Cost */}
          {configuration.installationCost > 0 && (
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Installation</span>
              <AnimatedNumber
                from={0}
                to={configuration.installationCost || 0}
                prefix="$"
                className="font-semibold text-gray-900"
              />
            </div>
          )}
          
          {/* Shipping Cost */}
          {configuration.shippingCost > 0 && (
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Shipping</span>
              <AnimatedNumber
                from={0}
                to={configuration.shippingCost || 0}
                prefix="$"
                className="font-semibold text-gray-900"
              />
            </div>
          )}
          
          {/* Tax Amount */}
          {configuration.taxAmount > 0 && (
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Tax</span>
              <AnimatedNumber
                from={0}
                to={configuration.taxAmount || 0}
                prefix="$"
                className="font-semibold text-gray-900"
              />
            </div>
          )}
          
          {/* Grand Total */}
          <div className="configuration-total-price flex justify-between items-center py-4 border-t-2 border-gray-200">
            <span className="total-price-label text-lg font-bold text-gray-900">Total</span>
            <AnimatedNumber
              from={0}
              to={configuration.grandTotal || 0}
              prefix="$"
              className="total-price-amount text-xl font-bold text-brand-primary"
            />
          </div>
          
          {/* Estimated Delivery */}
          {configuration.estimatedDelivery && (
            <div className="text-center text-sm text-gray-500 mt-4">
              Estimated delivery: {configuration.estimatedDelivery}
            </div>
          )}
          
          {/* Financing Options */}
          {onViewFinancing && (configuration.grandTotal || 0) > 1000 && (
            <div className="mt-6 p-4 bg-green-50 border border-orange-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-brand-primary">Financing Available</h4>
                  <p className="text-sm text-gray-500">
                    As low as $47/month
                  </p>
                </div>
                <button
                  onClick={handleViewFinancing}
                  className="text-brand-primary hover:text-brand-accent text-sm font-medium underline"
                >
                  View Options
                </button>
              </div>
            </div>
          )}

          {/* Insurance Information */}
          {onCheckInsurance && (configuration.grandTotal || 0) > 500 && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center justify-between"> 
                <div>
                  <h4 className="text-sm font-medium text-brand-primary">Insurance Coverage</h4>
                  <p className="text-sm text-brand-primary">
                    May be covered by insurance
                  </p>
                </div>
                <button
                  onClick={handleCheckInsurance}
                  className="text-brand-primary hover:text-brand-accent text-sm font-medium underline"
                >
                  Check Eligibility
                </button>
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          {onAddToCart && (
            <div className="configuration-summary-actions mt-6">
              <PrimaryButton
                onClick={handleAddToCart}
                disabled={loading || disabled}
                loading={loading}
                fullWidth
                className="btn-add-to-cart"
              >
                {loading ? (
                  'Adding to Cart...'
                ) : (
                  <>
                    <svg className="mr-2 h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 1.9-1.4L21 8H6M10 20a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm8 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
                    </svg>
                    Add to Cart
                  </>
                )}
              </PrimaryButton>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Original simple summary panel for backward compatibility
  return (
    <div className={`flex justify-between items-center py-2 ${className}`}>
      <span className="text-gray-600">{title}</span>
      <AnimatedNumber
        from={previousValue}
        to={currentValue || 0}
        prefix="$"
        className="font-semibold text-gray-900"
      />
    </div>
  );
};

export default SummaryPanel;
