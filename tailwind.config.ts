import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",

        // EduBaza.uz Custom Brand Colors
        brand: {
          // Primary - Blue Lotus (Main brand color)
          primary: {
            DEFAULT: '#6466E9',
            50: '#F0F0FE',
            100: '#E1E2FD',
            200: '#C4C5FB',
            300: '#A6A8F9',
            400: '#858AF1',
            500: '#6466E9', // Main
            600: '#4144D8',
            700: '#2F31B8',
            800: '#232492',
            900: '#1A1B6E',
          },

          // Secondary - Light Indigo
          secondary: {
            DEFAULT: '#584CE1',
            50: '#EEECFE',
            100: '#DDD9FD',
            200: '#BBB3FB',
            300: '#998DF9',
            400: '#7867F7',
            500: '#584CE1', // Main
            600: '#3B2DD0',
            700: '#2D21A8',
            800: '#201880',
            900: '#17115E',
          },

          // Success - Algae Green
          success: {
            DEFAULT: '#64D990',
            50: '#F0FDF7',
            100: '#DCFCE8',
            200: '#BBF7D0',
            300: '#86EFAC',
            400: '#64D990', // Main
            500: '#4ADE80',
            600: '#22C55E',
            700: '#16A34A',
            800: '#15803D',
            900: '#14532D',
          },

          // Warning - Golden Glow
          warning: {
            DEFAULT: '#FFE600',
            50: '#FFFEF0',
            100: '#FFFCD1',
            200: '#FFF9A3',
            300: '#FFF575',
            400: '#FFE600', // Main
            500: '#F1E18F',
            600: '#EAB308',
            700: '#CA8A04',
            800: '#A16207',
            900: '#713F12',
          },

          // Danger - Orange Red
          danger: {
            DEFAULT: '#DC4838',
            50: '#FEF2F2',
            100: '#FEE2E2',
            200: '#FECACA',
            300: '#FCA5A5',
            400: '#F87171',
            500: '#DC4838', // Main
            600: '#DC2626',
            700: '#B91C1C',
            800: '#991B1B',
            900: '#7F1D1D',
          },

          // Info - Cyan Blue
          info: {
            DEFAULT: '#57A9DC',
            50: '#F0F9FF',
            100: '#E0F2FE',
            200: '#BAE6FD',
            300: '#7DD3FC',
            400: '#57A9DC', // Main
            500: '#38BDF8',
            600: '#0EA5E9',
            700: '#0284C7',
            800: '#0369A1',
            900: '#075985',
          },

          // Additional Brand Colors
          orange: {
            DEFAULT: '#F3B33E',
            light: '#F3B33E',
            dark: '#D89A28',
          },

          pink: {
            DEFAULT: '#CA48A5',
            light: '#66C1BC',
            dark: '#A83786',
          },

          turquoise: {
            DEFAULT: '#66C1BC',
            light: '#8FD5D1',
            dark: '#4FA39E',
          },
        },
      },
      fontFamily: {
        sans: ['Onest', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
        onest: ['Onest', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
