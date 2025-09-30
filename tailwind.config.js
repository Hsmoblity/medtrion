module.exports = {
  darkMode: 'class', // Enable dark mode via class toggle
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    screens: {
      "4/sm": "160px",
      "2/sm": "320px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px"
    },
    extend: {
      // Enhanced Typography System
      fontFamily: {
        'primary': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        'secondary': ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        'display': ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        'mono': ['"JetBrains Mono"', '"Fira Code"', 'Monaco', 'Consolas', 'monospace'],
        // Legacy support
        'poppins': ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif']
      },
      
      fontSize: {
        // Extended font scale for modern design
        '7xl': '4.5rem',    // 72px - Large display
        '8xl': '6rem',      // 96px - Extra large display
        '9xl': '8rem'       // 128px - Hero display
      },
      
      fontWeight: {
        // Complete weight scale
        'thin': 100,
        'extralight': 200,
        'light': 300,
        'normal': 400,
        'medium': 500,
        'semibold': 600,
        'bold': 700,
        'extrabold': 800,
        'black': 900
      },
      
      lineHeight: {
        // Enhanced line height scale
        'none': 1,
        'tight': 1.25,
        'snug': 1.375,
        'normal': 1.5,
        'relaxed': 1.625,
        'loose': 2
      },
      
      letterSpacing: {
        // Letter spacing for typography refinement
        'tighter': '-0.05em',
        'tight': '-0.025em',
        'normal': '0em',
        'wide': '0.025em',
        'wider': '0.05em',
        'widest': '0.1em'
      },
      width: {
        "custom-31": "31.871429%",
        "custom-66": "66%"
      },
      animation: {
        'shimmer': 'shimmer 2s infinite linear',
        'fadeIn': 'fadeIn 0.5s ease-out',
        'slideInUp': 'slideInUp 0.4s ease-out',
        'flash': 'flash 0.6s ease-out',
        'scale': 'scale 0.3s ease-out',
        'bounce': 'bounce 0.6s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        flash: {
          '0%': { opacity: '0' },
          '50%': { opacity: '0.8' },
          '100%': { opacity: '0' },
        },
        scale: {
          '0%': { transform: 'scale(0.8)' },
          '100%': { transform: 'scale(1)' },
        },
        bounce: {
          '0%, 20%, 53%, 80%, 100%': { transform: 'scale(1)' },
          '40%, 43%': { transform: 'scale(1.1)' },
          '70%': { transform: 'scale(1.05)' },
        }
      }
    }
  },
  plugins: []
};
