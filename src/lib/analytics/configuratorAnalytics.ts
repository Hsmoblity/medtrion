import React from 'react';

// Analytics tracking for configurator events

export interface ConfiguratorAnalyticsEvent {
  event: string;
  category: 'configurator';
  optionId?: number;
  optionName?: string;
  categoryId?: string;
  isSelected?: boolean;
  priceDelta?: number;
  totalPrice?: number;
  basePrice?: number;
  optionsTotal?: number;
  optionsCount?: number;
  financingOptions?: number;
  estimatedCoverage?: number;
  sessionId?: string;
  userId?: string;
  timestamp?: number;
}

export interface ConfiguratorAnalytics {
  track: (event: string, data: Partial<ConfiguratorAnalyticsEvent>) => void;
  trackOptionToggle: (optionId: number, optionName: string, categoryId: string, isSelected: boolean, priceDelta?: number) => void;
  trackConfigurationSummaryView: (totalPrice: number, optionsCount: number) => void;
  trackAddToCart: (configuration: { basePrice: number; optionsTotal: number; grandTotal: number; optionsCount: number }) => void;
  trackFinancingView: (totalAmount: number, financingOptions: number) => void;
  trackInsuranceCheck: (totalAmount: number, estimatedCoverage?: number) => void;
  trackConfigurationSave: (configurationId: string, totalPrice: number) => void;
  trackCompatibilityIssue: (issueType: string, severity: string, affectedOptions: number[]) => void;
}

class ConfiguratorAnalyticsImpl implements ConfiguratorAnalytics {
  private sessionId: string;
  private userId?: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.userId = this.getUserId();
  }

  private generateSessionId(): string {
    return 'conf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private getUserId(): string | undefined {
    // Try to get user ID from various sources
    if (typeof window !== 'undefined') {
      // Check localStorage, sessionStorage, or cookies
      return localStorage.getItem('userId') || undefined;
    }
    return undefined;
  }

  private getBaseEvent(): ConfiguratorAnalyticsEvent {
    return {
      event: '',
      category: 'configurator',
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now()
    };
  }

  track(event: string, data: Partial<ConfiguratorAnalyticsEvent> = {}): void {
    const eventData: ConfiguratorAnalyticsEvent = {
      ...this.getBaseEvent(),
      event,
      ...data
    };

    // Send to Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, {
        event_category: 'configurator',
        option_id: data.optionId,
        option_name: data.optionName,
        category_id: data.categoryId,
        is_selected: data.isSelected,
        price_delta: data.priceDelta,
        total_price: data.totalPrice,
        base_price: data.basePrice,
        options_total: data.optionsTotal,
        options_count: data.optionsCount,
        session_id: this.sessionId,
        user_id: this.userId,
        custom_parameter_1: data.financingOptions,
        custom_parameter_2: data.estimatedCoverage
      });
    }

    // Send to custom analytics endpoint
    this.sendToCustomAnalytics(eventData);

    // Console log for development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Configurator Analytics:', eventData);
    }
  }

  trackOptionToggle(optionId: number, optionName: string, categoryId: string, isSelected: boolean, priceDelta: number = 0): void {
    this.track('configurator_option_toggled', {
      optionId,
      optionName,
      categoryId,
      isSelected,
      priceDelta
    });
  }

  trackConfigurationSummaryView(totalPrice: number, optionsCount: number): void {
    this.track('configuration_summary_view', {
      totalPrice,
      optionsCount
    });
  }

  trackAddToCart(configuration: { basePrice: number; optionsTotal: number; grandTotal: number; optionsCount: number }): void {
    this.track('configuration_add_to_cart', {
      basePrice: configuration.basePrice,
      optionsTotal: configuration.optionsTotal,
      totalPrice: configuration.grandTotal,
      optionsCount: configuration.optionsCount
    });
  }

  trackFinancingView(totalAmount: number, financingOptions: number = 0): void {
    this.track('configuration_view_financing', {
      totalPrice: totalAmount,
      financingOptions
    });
  }

  trackInsuranceCheck(totalAmount: number, estimatedCoverage?: number): void {
    this.track('configuration_check_insurance', {
      totalPrice: totalAmount,
      estimatedCoverage
    });
  }

  trackConfigurationSave(configurationId: string, totalPrice: number): void {
    this.track('configuration_save', {
      totalPrice,
      // Store config ID in optionName field as a workaround
      optionName: configurationId
    });
  }

  trackCompatibilityIssue(issueType: string, severity: string, affectedOptions: number[]): void {
    this.track('configuration_compatibility_issue', {
      optionName: issueType,
      categoryId: severity,
      optionsCount: affectedOptions.length
    });
  }

  private async sendToCustomAnalytics(eventData: ConfiguratorAnalyticsEvent): Promise<void> {
    try {
      // Only send to custom endpoint in production
      if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
        await fetch('/api/analytics/configurator', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(eventData)
        });
      }
    } catch (error) {
      console.error('Failed to send analytics:', error);
    }
  }
}

// Singleton instance
export const configuratorAnalytics = new ConfiguratorAnalyticsImpl();

// React hook for use in components
export const useConfiguratorAnalytics = (): ConfiguratorAnalytics => {
  return configuratorAnalytics;
};

// Higher-order component for automatic analytics
export function withConfiguratorAnalytics<P extends Record<string, any>>(
  WrappedComponent: React.ComponentType<P>,
  eventName: string
) {
  return function WithAnalytics(props: P) {
    React.useEffect(() => {
      configuratorAnalytics.track(`${eventName}_view`, {
        // Add any default props you want to track
      });
    }, []);

    return React.createElement(WrappedComponent, props);
  };
}

// Utility functions for testing
export const createMockAnalytics = (): ConfiguratorAnalytics => {
  return {
    track: () => {},
    trackOptionToggle: () => {},
    trackConfigurationSummaryView: () => {},
    trackAddToCart: () => {},
    trackFinancingView: () => {},
    trackInsuranceCheck: () => {},
    trackConfigurationSave: () => {},
    trackCompatibilityIssue: () => {}
  };
};