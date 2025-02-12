/* eslint-disable ts/no-require-imports */
import type { Config } from 'tailwindcss'

import plugin from 'tailwindcss/plugin'

import { omitUndefined } from './src/lib/utilities'

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
          DEFAULT: 'var(--background)',
          active: 'var(--background-active)',
        },
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
          hover: 'var(--primary-hover)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border: {
          DEFAULT: 'var(--border)',
          td: 'var(--border-td)',
        },
        input: 'var(--input)',
        ring: 'var(--ring)',
        'internal-autofill': 'var(--internal-autofill)',
        chart: {
          1: 'var(--chart-1)',
          2: 'var(--chart-2)',
          3: 'var(--chart-3)',
          4: 'var(--chart-4)',
          5: 'var(--chart-5)',
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
          '0%': { opacity: '1' },
          '10%': { opacity: '0.7' },
          '20%': { opacity: '0.3' },
          '35%': { opacity: '0.2' },
          '50%': { opacity: '0.1' },
          '75%': { opacity: '0.05' },
          '100%': { opacity: '0' },
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
      addVariant('sq', '&:is(.sq *)')
      addVariant('iOS', '&:is(.iOS *)')
      addVariant('webkit', '&:is(.webkit *)')

      matchUtilities({
        'sq-smooth': (value) => ({
          '--squircle-smooth': value,
        }),
      })

      matchUtilities({
        'sq-smooth-x': (value) => ({
          '--squircle-right-top-smooth': value,
          '--squircle-right-bottom-smooth': value,
          '--squircle-left-bottom-smooth': value,
          '--squircle-left-top-smooth': value,
        }),
      })

      matchUtilities({
        'sq-smooth-y': (value) => ({
          '--squircle-top-left-smooth': value,
          '--squircle-top-right-smooth': value,
          '--squircle-bottom-right-smooth': value,
          '--squircle-bottom-left-smooth': value,
        }),
      })

      matchUtilities({
        'sq-radius': (value) => ({
          '--squircle-radius': value,
        }),
      }, omitUndefined({
        values: theme('borderRadius'),
      }))

      matchUtilities({
        'sq-radius-x': (value) => ({
          '--squircle-right-top-radius': value,
          '--squircle-right-bottom-radius': value,
          '--squircle-left-bottom-radius': value,
          '--squircle-left-top-radius': value,
        }),
      }, omitUndefined({
        values: theme('borderRadius'),
      }))

      matchUtilities({
        'sq-radius-y': (value) => ({
          '--squircle-top-left-radius': value,
          '--squircle-top-right-radius': value,
          '--squircle-bottom-right-radius': value,
          '--squircle-bottom-left-radius': value,
        }),
      }, omitUndefined({
        values: theme('borderRadius'),
      }))

      matchUtilities({
        'sq-outline': (value) => ({
          '--squircle-outline': value,
        }),
      }, omitUndefined({
        values: theme('borderWidth'),
      }))

      matchUtilities({
        'sq-stroke': (value) => ({
          '--squircle-stroke': value,
        }),
      }, omitUndefined({
        values: theme('colors'),
        type: ['color', 'any'],
      }))

      matchUtilities({
        'sq-fill': (value) => ({
          '--squircle-fill': value,
        }),
      }, omitUndefined({
        values: theme('colors'),
        type: ['color', 'any'],
      }))
    }),
  ],
}

export default config
