import { useState, useEffect, useCallback, useRef } from 'react';

interface AccessibilityPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  screenReaderOptimized: boolean;
  keyboardNavigation: boolean;
}

interface UseAccessibilityOptions {
  autoDetect?: boolean;
  persistPreferences?: boolean;
  storageKey?: string;
}

interface UseAccessibilityReturn extends AccessibilityPreferences {
  updatePreference: <K extends keyof AccessibilityPreferences>(
    key: K, 
    value: AccessibilityPreferences[K]
  ) => void;
  resetPreferences: () => void;
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
  focusManagement: {
    trapFocus: (containerRef: React.RefObject<HTMLElement>) => () => void;
    restoreFocus: (elementRef: React.RefObject<HTMLElement>) => void;
    skipToContent: () => void;
  };
}

// Phase 3: Advanced Accessibility Hook for Configurator
export const useAccessibility = (options: UseAccessibilityOptions = {}): UseAccessibilityReturn => {
  const {
    autoDetect = true,
    persistPreferences = true,
    storageKey = 'configurator-accessibility-preferences'
  } = options;

  // Accessibility preference state
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    screenReaderOptimized: false,
    keyboardNavigation: false
  });

  // Refs for accessibility features
  const announcementRef = useRef<HTMLDivElement | null>(null);
  const focusHistoryRef = useRef<HTMLElement[]>([]);

  // Auto-detect system preferences
  useEffect(() => {
    if (!autoDetect || typeof window === 'undefined') return;

    const detectPreferences = () => {
      const mediaQueries = {
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
        highContrast: window.matchMedia('(prefers-contrast: high)'),
        largeText: window.matchMedia('(min-resolution: 144dpi)') // Approximate large text detection
      };

      const detected: Partial<AccessibilityPreferences> = {
        reducedMotion: mediaQueries.reducedMotion.matches,
        highContrast: mediaQueries.highContrast.matches,
        largeText: mediaQueries.largeText.matches,
        screenReaderOptimized: !!window.navigator.userAgent.match(/NVDA|JAWS|VoiceOver|TalkBack/i),
        keyboardNavigation: false // Will be detected on first Tab key press
      };

      // Load saved preferences or use detected ones
      if (persistPreferences) {
        try {
          const saved = localStorage.getItem(storageKey);
          if (saved) {
            const savedPreferences = JSON.parse(saved);
            setPreferences({ ...detected, ...savedPreferences } as AccessibilityPreferences);
            return;
          }
        } catch (error) {
          console.warn('Failed to load accessibility preferences:', error);
        }
      }

      setPreferences(prev => ({ ...prev, ...detected }));

      // Listen for preference changes
      Object.entries(mediaQueries).forEach(([key, mediaQuery]) => {
        const handler = (e: MediaQueryListEvent) => {
          setPreferences(prev => ({ ...prev, [key]: e.matches }));
        };
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
      });
    };

    detectPreferences();
  }, [autoDetect, persistPreferences, storageKey]);

  // Detect keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setPreferences(prev => ({ ...prev, keyboardNavigation: true }));
      }
    };

    const handleMouseDown = () => {
      setPreferences(prev => ({ ...prev, keyboardNavigation: false }));
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Create screen reader announcement area
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!announcementRef.current) {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.style.position = 'absolute';
      announcement.style.left = '-10000px';
      announcement.style.top = '-10000px';
      announcement.style.width = '1px';
      announcement.style.height = '1px';
      announcement.style.overflow = 'hidden';
      document.body.appendChild(announcement);
      announcementRef.current = announcement;
    }

    return () => {
      if (announcementRef.current && document.body.contains(announcementRef.current)) {
        document.body.removeChild(announcementRef.current);
      }
    };
  }, []);

  // Update preference function
  const updatePreference = useCallback(<K extends keyof AccessibilityPreferences>(
    key: K, 
    value: AccessibilityPreferences[K]
  ) => {
    setPreferences(prev => {
      const updated = { ...prev, [key]: value };
      
      // Persist preferences
      if (persistPreferences) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (error) {
          console.warn('Failed to save accessibility preferences:', error);
        }
      }
      
      return updated;
    });
  }, [persistPreferences, storageKey]);

  // Reset preferences function
  const resetPreferences = useCallback(() => {
    const defaultPreferences: AccessibilityPreferences = {
      reducedMotion: false,
      highContrast: false,
      largeText: false,
      screenReaderOptimized: false,
      keyboardNavigation: false
    };

    setPreferences(defaultPreferences);

    if (persistPreferences) {
      try {
        localStorage.removeItem(storageKey);
      } catch (error) {
        console.warn('Failed to clear accessibility preferences:', error);
      }
    }
  }, [persistPreferences, storageKey]);

  // Screen reader announcement function
  const announceToScreenReader = useCallback((
    message: string, 
    priority: 'polite' | 'assertive' = 'polite'
  ) => {
    if (!announcementRef.current) return;

    announcementRef.current.setAttribute('aria-live', priority);
    announcementRef.current.textContent = message;

    // Clear after a delay
    setTimeout(() => {
      if (announcementRef.current) {
        announcementRef.current.textContent = '';
      }
    }, 1000);
  }, []);

  // Focus management utilities
  const focusManagement = {
    // Trap focus within a container
    trapFocus: useCallback((containerRef: React.RefObject<HTMLElement>) => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key !== 'Tab' || !containerRef.current) return;

        const focusableElements = containerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, []),

    // Restore focus to a previous element
    restoreFocus: useCallback((elementRef: React.RefObject<HTMLElement>) => {
      if (elementRef.current) {
        elementRef.current.focus();
      }
    }, []),

    // Skip to main content
    skipToContent: useCallback(() => {
      const mainContent = document.querySelector('main, [role="main"], #main-content');
      if (mainContent instanceof HTMLElement) {
        mainContent.focus();
        mainContent.scrollIntoView({ behavior: 'smooth' });
      }
    }, [])
  };

  return {
    ...preferences,
    updatePreference,
    resetPreferences,
    announceToScreenReader,
    focusManagement
  };
};