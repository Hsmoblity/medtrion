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
    // Font Families - Following modern design system principles
    fontFamily: {
      primary: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      secondary: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      monospace: ['"JetBrains Mono"', '"Fira Code"', 'Monaco', 'Consolas', 'monospace'],
      // Legacy aliases for backward compatibility
      sans: ['Inter', 'system-ui', 'sans-serif'],
      heading: ['Poppins', 'Inter', 'system-ui', 'sans-serif']
    },
    
    // Comprehensive Font Scale - Extended for modern design needs
    fontSize: {
      xs: '0.75rem',      // 12px - Captions, labels
      sm: '0.875rem',     // 14px - Small text, metadata
      base: '1rem',       // 16px - Body text (minimum readable)
      lg: '1.125rem',     // 18px - Large body text
      xl: '1.25rem',      // 20px - Small headings
      '2xl': '1.5rem',    // 24px - Section headings
      '3xl': '1.875rem',  // 30px - Page headings
      '4xl': '2.25rem',   // 36px - Large headings
      '5xl': '3rem',      // 48px - Hero headings
      '6xl': '3.75rem',   // 60px - Display headings
      '7xl': '4.5rem'     // 72px - Large display
    },
    
    // Complete Font Weight Scale
    fontWeight: {
      thin: 100,
      extralight: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900
    },
    
    // Comprehensive Line Height System
    lineHeight: {
      none: 1,
      tight: 1.25,        // Headings
      snug: 1.375,        // Subheadings
      normal: 1.5,        // Body text
      relaxed: 1.625,     // Large body text
      loose: 2            // Spacious text
    },
    
    // Letter Spacing for Typography Refinement
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em'
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
  },

  // Semantic Typography Tokens - For consistent content hierarchy
  semanticTypography: {
    // Heading Variants with semantic meaning
    headings: {
      h1: {
        fontSize: '3rem',      // 48px
        fontWeight: 700,       // bold
        lineHeight: 1.25,      // tight
        fontFamily: 'display',
        letterSpacing: '-0.025em'
      },
      h2: {
        fontSize: '2.25rem',   // 36px
        fontWeight: 600,       // semibold
        lineHeight: 1.25,      // tight
        fontFamily: 'display',
        letterSpacing: '-0.025em'
      },
      h3: {
        fontSize: '1.875rem',  // 30px
        fontWeight: 600,       // semibold
        lineHeight: 1.375,     // snug
        fontFamily: 'display'
      },
      h4: {
        fontSize: '1.5rem',    // 24px
        fontWeight: 500,       // medium
        lineHeight: 1.375,     // snug
        fontFamily: 'display'
      },
      h5: {
        fontSize: '1.25rem',   // 20px
        fontWeight: 500,       // medium
        lineHeight: 1.5,       // normal
        fontFamily: 'display'
      },
      h6: {
        fontSize: '1.125rem',  // 18px
        fontWeight: 500,       // medium
        lineHeight: 1.5,       // normal
        fontFamily: 'display'
      }
    },

    // Body Text Variants
    body: {
      large: {
        fontSize: '1.125rem',  // 18px
        fontWeight: 400,       // normal
        lineHeight: 1.625,     // relaxed
        fontFamily: 'primary'
      },
      base: {
        fontSize: '1rem',      // 16px
        fontWeight: 400,       // normal
        lineHeight: 1.5,       // normal
        fontFamily: 'primary'
      },
      small: {
        fontSize: '0.875rem',  // 14px
        fontWeight: 400,       // normal
        lineHeight: 1.5,       // normal
        fontFamily: 'primary'
      },
      caption: {
        fontSize: '0.75rem',   // 12px
        fontWeight: 400,       // normal
        lineHeight: 1.5,       // normal
        fontFamily: 'primary'
      }
    },

    // Interactive Text Elements
    interactive: {
      link: {
        fontSize: '1rem',      // 16px
        fontWeight: 500,       // medium
        lineHeight: 1.5,       // normal
        fontFamily: 'primary',
        textDecoration: 'underline'
      },
      button: {
        fontSize: '1rem',      // 16px
        fontWeight: 600,       // semibold
        lineHeight: 1.5,       // normal
        fontFamily: 'primary',
        letterSpacing: '0.025em'
      },
      label: {
        fontSize: '0.875rem',  // 14px
        fontWeight: 500,       // medium
        lineHeight: 1.5,       // normal
        fontFamily: 'primary'
      }
    },

    // Special Purpose Typography
    special: {
      code: {
        fontSize: '0.875rem',  // 14px
        fontWeight: 400,       // normal
        lineHeight: 1.5,       // normal
        fontFamily: 'monospace'
      },
      quote: {
        fontSize: '1.125rem',  // 18px
        fontWeight: 400,       // normal
        lineHeight: 1.625,     // relaxed
        fontFamily: 'primary',
        fontStyle: 'italic'
      },
      highlight: {
        fontSize: '1rem',      // 16px
        fontWeight: 500,       // medium
        lineHeight: 1.5,       // normal
        fontFamily: 'primary'
      }
    }
  },

  // Responsive Typography System
  responsiveTypography: {
    mobile: {
      baseSize: '16px',
      scaleFactor: 1.0,
      maxWidth: '768px'
    },
    tablet: {
      baseSize: '16px',
      scaleFactor: 1.1,
      maxWidth: '1024px'
    },
    desktop: {
      baseSize: '18px',
      scaleFactor: 1.2,
      minWidth: '1025px'
    }
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
  
  // Text styles - Enhanced with semantic typography
  text: {
    // Heading Styles
    h1: 'text-5xl font-bold font-display leading-tight text-gray-900 dark:text-white tracking-tight',
    h2: 'text-4xl font-semibold font-display leading-tight text-gray-900 dark:text-white tracking-tight',
    h3: 'text-3xl font-semibold font-display leading-snug text-gray-900 dark:text-white',
    h4: 'text-2xl font-medium font-display leading-snug text-gray-900 dark:text-white',
    h5: 'text-xl font-medium font-display leading-normal text-gray-900 dark:text-white',
    h6: 'text-lg font-medium font-display leading-normal text-gray-900 dark:text-white',
    
    // Body Text Styles
    bodyLarge: 'text-lg font-normal font-primary leading-relaxed text-gray-700 dark:text-gray-300',
    body: 'text-base font-normal font-primary leading-normal text-gray-700 dark:text-gray-300',
    bodySmall: 'text-sm font-normal font-primary leading-normal text-gray-600 dark:text-gray-400',
    caption: 'text-xs font-normal font-primary leading-normal text-gray-500 dark:text-gray-500',
    
    // Interactive Text Styles
    link: 'text-base font-medium font-primary text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline transition-colors duration-200',
    button: 'text-base font-semibold font-primary tracking-wide',
    label: 'text-sm font-medium font-primary text-gray-700 dark:text-gray-300',
    
    // Special Purpose Text
    code: 'text-sm font-mono bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-1 py-0.5 rounded',
    quote: 'text-lg font-normal font-primary italic text-gray-600 dark:text-gray-400 leading-relaxed',
    highlight: 'text-base font-medium font-primary bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100 px-1 rounded',
    
    // Legacy styles for backward compatibility
    heading: 'text-gray-900 dark:text-white font-semibold',
    secondary: 'text-gray-600 dark:text-gray-400',
    muted: 'text-gray-500 dark:text-gray-500'
  },
  
  // Input styles
  input: 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
  
  // Border styles
  border: 'border-gray-200 dark:border-gray-700'
};

export default designSystem;