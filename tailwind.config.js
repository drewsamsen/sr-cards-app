/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      screens: {
        'phone': { 'raw': '(max-width: 430px) and (min-height: 700px) and (-webkit-min-device-pixel-ratio: 2)' },
        'sm': '640px',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Custom plugin for phone emulator mode
    function({ addVariant, e, addUtilities }) {
      // Add phone variant for phone emulator mode with higher specificity
      addVariant('phone', ['.phone-emulator-mode &', '&.phone-emulator-mode'])
      
      // Add important to phone-important variant utilities for guaranteed override
      addVariant('phone-important', ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.phone-emulator-mode .${e(`phone-important${separator}${className}`)}`;
        });
      });
      
      // Add direct utilities for the most common spacing cases
      const phoneSpecificUtilities = {
        '.phone-mx-2': {
          'margin-left': '0.5rem',
          'margin-right': '0.5rem'
        },
        '.phone-px-2': {
          'padding-left': '0.5rem',
          'padding-right': '0.5rem'
        },
        '.phone-mx-4': {
          'margin-left': '1rem',
          'margin-right': '1rem'
        },
        '.phone-px-4': {
          'padding-left': '1rem',
          'padding-right': '1rem'
        }
      };
      
      addUtilities(phoneSpecificUtilities, ['responsive', 'hover']);
    },
  ],
} 