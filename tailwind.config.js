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
      fontFamily: {
        'poppins': ['Poppins'],
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
