/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors - Charcoal & Emerald Theme
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#10b981', // Main emerald
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        // Background Colors - Charcoal
        background: {
          primary: '#1a1d23',   // Deep charcoal
          secondary: '#374151', // Warm gray
          tertiary: '#4b5563',  // Medium gray
        },
        // Text Colors
        text: {
          primary: '#f9fafb',   // Almost white
          secondary: '#d1d5db', // Light gray
          tertiary: '#6b7280',  // Medium gray
          muted: '#9ca3af',     // Muted gray
        },
        // Status Colors
        success: {
          50: '#ecfdf5',
          500: '#10b981',   // Emerald
          600: '#059669',
          700: '#047857',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',   // Amber
          600: '#d97706',
          700: '#b45309',
        },
        error: {
          50: '#fef2f2',
          500: '#dc2626',   // Crimson
          600: '#b91c1c',
          700: '#991b1b',
        },
        // AI & Accent Colors
        ai: {
          50: '#faf5ff',
          500: '#8b5cf6',   // Electric purple
          600: '#7c3aed',
          700: '#6d28d9',
        },
        accent: {
          50: '#fff7ed',
          500: '#f97316',   // Coral
          600: '#ea580c',
          700: '#c2410c',
        },
        // Chart Colors
        chart: {
          1: '#10b981',  // Emerald
          2: '#f59e0b',  // Amber
          3: '#dc2626',  // Crimson
          4: '#8b5cf6',  // Purple
          5: '#f97316',  // Coral
          6: '#06b6d4',  // Cyan
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'emerald': '0 0 20px rgba(16, 185, 129, 0.3)',
        'emerald-lg': '0 0 40px rgba(16, 185, 129, 0.4)',
        'purple': '0 0 20px rgba(139, 92, 246, 0.3)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(16, 185, 129, 0.6)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'emerald-gradient': 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        'charcoal-gradient': 'linear-gradient(135deg, #1a1d23 0%, #374151 100%)',
        'ai-gradient': 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
      },
    },
  },
  plugins: [],
}
