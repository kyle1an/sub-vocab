/* eslint-disable ts/no-require-imports */
import type { Config } from 'tailwindcss'

import plugin from 'tailwindcss/plugin'

const config: Config = {
  darkMode: ['selector', '.dark'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './index.html',
  ],
  theme: {
    fontFamily: {
      sans: [
        '-apple-system',
        'SF Pro Text',
        'BlinkMacSystemFont',
        'Inter',
        'ui-sans-serif',
        'system-ui',
        'sans-serif',
        'Apple Color Emoji',
        'Segoe UI Emoji',
        'Segoe UI Symbol',
        'Noto Color Emoji',
      ],
      compact: [
        'Karla',
        'SF Compact Text',
        '-apple-system',
        'sans-serif',
      ],
    },
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: {
          DEFAULT: 'hsl(var(--background))',
          active: 'var(--background-active)',
          focus: 'var(--background-focus)',
        },
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          hover: 'var(--primary-hover)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: {
          DEFAULT: 'hsl(var(--border))',
          td: 'var(--border-td)',
        },
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        'internal-autofill': 'var(--internal-autofill)',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      boxShadow: {
        collapse: 'var(--collapse)',
        intersect: 'var(--intersect)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        spinner: {
          '0%': {
            opacity: '1',
          },
          '10%': {
            opacity: '0.7',
          },
          '20%': {
            opacity: '0.3',
          },
          '35%': {
            opacity: '0.2',
          },
          '50%': {
            opacity: '0.1',
          },
          '75%': {
            opacity: '0.05',
          },
          '100%': {
            opacity: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        spinner: 'spinner 1s linear infinite',
      },
    },
  },
  plugins: [
    require('@anuragroy/tailwindcss-animate'),
    require('tailwindcss-signals'),
    plugin(({
      addVariant,
      matchUtilities,
      theme,
    }) => {
      addVariant('sq', '@supports (corner-shape: squircle)')
      addVariant('iOS', '&:is([data-os-name="iOS"] *)')
      matchUtilities({
        superellipse: (value) => ({
          'corner-shape': `superellipse(calc(${value} / var(--exponent-modifier, 1)))`,
        }),
      })
    }),
  ],
}

export default config
