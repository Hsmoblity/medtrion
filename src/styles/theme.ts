/**
 * Design System Theme Configuration
 * Centralized theme configuration for consistent styling across the application
 */

export const designSystem = {
  colors: {
    // Brand Colors
    primary: {
      50: '#eff6ff',
      100: '#dbeafe', 
      500: '#3b82f6',  // Main brand blue
      600: '#2563eb',  // Primary button blue
      700: '#1d4ed8',  // Primary button hover
      900: '#1e3a8a'
    },
    
    // Neutral Colors (Gray Scale)
    gray: {
      50: '#f9fafb',   // Light page background
      100: '#f3f4f6',  // Card backgrounds
      200: '#e5e7eb',  // Border colors
      300: '#d1d5db',  // Disabled text
      400: '#9ca3af',  // Placeholder text  
      500: '#6b7280',  // Secondary text
      600: '#4b5563',  // Primary text
      700: '#374151',  // Dark text
      800: '#1f2937',  // Dark mode card background
      900: '#111827'   // Dark mode page background
    },
    
    // Semantic Colors
    success: {
      50: '#ecfdf5',
      500: '#10b981',
      600: '#059669',
      700: '#047857'
    },
    error: {
      50: '#fef2f2', 
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c'
    },
    warning: {
      50: '#fffbeb',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309'
    },
    info: {
      50: '#eff6ff',
      500: '#3b82f6',
      600: '#2563eb', 
      700: '#1d4ed8'
    },
    
    // Background Colors
    background: {
      light: '#ffffff',      // White cards
      lightAlt: '#f9fafb',   // Light gray page background
      dark: '#1f2937',       // Dark mode cards
      darkAlt: '#111827'     // Dark mode page background
    },
    
    // Text Colors
    text: {
      primary: '#111827',     // Main text (dark)
      secondary: '#6b7280',   // Secondary text (medium gray)
      tertiary: '#9ca3af',    // Tertiary text (light gray)
      inverse: '#ffffff',     // White text for dark backgrounds
      disabled: '#d1d5db'     // Disabled text
    }
  },
  
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      heading: ['Inter', 'system-ui', 'sans-serif']
    },
    
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem'  // 36px
    },
    
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    }
  },
  
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem'    // 64px
  },
  
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    full: '9999px'
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
  }
};

/**
 * Theme-aware CSS class generators
 */
export const themeClasses = {
  // Page containers
  pageContainer: 'min-h-screen bg-gray-50 dark:bg-gray-900',
  
  // Card/Panel styles
  card: 'bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700',
  cardPadding: 'p-6',
  
  // Button styles
  button: {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2', 
    outline: 'bg-transparent text-blue-600 border-2 border-blue-600 hover:bg-blue-50',
    ghost: 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
  },
  
  // Text styles
  text: {
    heading: 'text-gray-900 dark:text-white font-semibold',
    body: 'text-gray-700 dark:text-gray-300',
    secondary: 'text-gray-600 dark:text-gray-400',
    muted: 'text-gray-500 dark:text-gray-500'
  },
  
  // Input styles
  input: 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
  
  // Border styles
  border: 'border-gray-200 dark:border-gray-700'
};

export default designSystem;