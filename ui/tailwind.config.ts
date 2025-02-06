/* eslint-disable ts/no-require-imports */
import type { Config } from 'tailwindcss'

import plugin from 'tailwindcss/plugin'

import { omitUndefined } from './src/lib/utilities'

const config: Config = {
  darkMode: ['selector'],
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
      pro: [
        '-apple-system',
        'BlinkMacSystemFont',
        'SF Pro Text',
        'Inter',
        'system-ui',
        'Segoe UI',
        'Roboto',
        'Helvetica Neue',
        'sans-serif',
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
        background: 'hsl(var(--background))',
        'background-active': 'var(--background-active)',
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
        border: 'hsl(var(--border))',
        'border-td': 'var(--border-td)',
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
      addUtilities,
      addVariant,
      matchUtilities,
      theme,
    }) => {
      const sq_DEFINITION = '&:is(.sq *)'

      addUtilities({
        '.squircle': {
          [sq_DEFINITION]: {
            background: 'paint(squircle)',
          },
        },
      })

      addVariant('sq', sq_DEFINITION)
      addVariant('iOS', '&:is(.iOS *)')
      addVariant('webkit', '&:is(.webkit *)')

      matchUtilities({
        mask: (value) => ({
          [sq_DEFINITION]: {
            maskImage: value,
          },
        }),
      }, {
        values: {
          squircle: 'paint(squircle)',
        },
      })

      matchUtilities({
        'sq-smooth': (value) => ({
          [sq_DEFINITION]: {
            '--squircle-smooth': value,
          },
        }),
      })

      matchUtilities({
        'sq-smooth-x': (value) => ({
          [sq_DEFINITION]: {
            '--squircle-right-top-smooth': value,
            '--squircle-right-bottom-smooth': value,
            '--squircle-left-bottom-smooth': value,
            '--squircle-left-top-smooth': value,
          },
        }),
      })

      matchUtilities({
        'sq-smooth-y': (value) => ({
          [sq_DEFINITION]: {
            '--squircle-top-left-smooth': value,
            '--squircle-top-right-smooth': value,
            '--squircle-bottom-right-smooth': value,
            '--squircle-bottom-left-smooth': value,
          },
        }),
      })

      matchUtilities({
        'sq-radius': (value) => ({
          [sq_DEFINITION]: {
            '--squircle-radius': value,
          },
        }),
      }, omitUndefined({
        values: theme('borderRadius'),
      }))

      matchUtilities({
        'sq-radius-x': (value) => ({
          [sq_DEFINITION]: {
            '--squircle-right-top-radius': value,
            '--squircle-right-bottom-radius': value,
            '--squircle-left-bottom-radius': value,
            '--squircle-left-top-radius': value,
          },
        }),
      }, omitUndefined({
        values: theme('borderRadius'),
      }))

      matchUtilities({
        'sq-radius-y': (value) => ({
          [sq_DEFINITION]: {
            '--squircle-top-left-radius': value,
            '--squircle-top-right-radius': value,
            '--squircle-bottom-right-radius': value,
            '--squircle-bottom-left-radius': value,
          },
        }),
      }, omitUndefined({
        values: theme('borderRadius'),
      }))

      matchUtilities({
        'sq-outline': (value) => ({
          [sq_DEFINITION]: {
            '--squircle-outline': value,
          },
        }),
      }, omitUndefined({
        values: theme('borderWidth'),
      }))

      matchUtilities({
        'sq-stroke': (value) => ({
          [sq_DEFINITION]: {
            '--squircle-stroke': value,
          },
        }),
      }, omitUndefined({
        values: theme('colors'),
        type: ['color', 'any'],
      }))

      matchUtilities({
        'sq-fill': (value) => ({
          [sq_DEFINITION]: {
            '--squircle-fill': value,
          },
        }),
      }, omitUndefined({
        values: theme('colors'),
        type: ['color', 'any'],
      }))
    }),
  ],
}

export default config
