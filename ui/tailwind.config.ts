import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    fontFamily: {
      'pro': ['-apple-system', 'SF Pro Text', 'Inter', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'],
      'compact': ['SF Compact Text', '-apple-system', 'sans-serif'],
    },
    extend: {
      colors: {
        'blue-primary': 'hsl(206,100%,52%)',
      },
    },
  },
  plugins: [
    plugin(function ({ addBase, addComponents, addUtilities, matchUtilities, theme }) {
      addUtilities({
        '.tap-transparent': { '-webkit-tap-highlight-color': 'transparent' },
        '.overflow-scrolling-touch': { '-webkit-overflow-scrolling': 'touch' },
      })
      matchUtilities({
        'ffs': (value) => ({
          fontFeatureSettings: value
        }),
        'stretch': (value) => ({
          fontStretch: value
        }),
      })
    })
  ],
}

export default config
