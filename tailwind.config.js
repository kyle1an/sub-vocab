const plugin = require('tailwindcss/plugin')

module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    fontFamily: {
      'mono': ['SF Mono', 'ui-monospace', 'SFMono-Regular', 'Ubuntu Mono', 'Consolas', 'DejaVu Sans Mono', 'Menlo', 'monospace'],
      'pro': ['SF Pro Text', '-apple-system', 'Inter', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'],
      'compact': ['SF Compact Text', '-apple-system', 'sans-serif'],
      'pro-rnd': ['SF Pro Rounded', '-apple-system', 'sans-serif'],
      'compact-rnd': ['SF Compact Rounded', '-apple-system', 'sans-serif'],
      'text-sans': 'Work Sans',
    },
    extend: {
      colors: {
        'blue-primary': 'hsl(206,100%,52%)',
      },
    },
  },
  plugins: [
    plugin(function ({ addBase, addComponents, addUtilities, matchUtilities, theme }) {
      addUtilities(
        {
          '.tap-transparent': { '-webkit-tap-highlight-color': 'transparent' },
        }
      )
      matchUtilities(
        {
          'ffs': (value) => ({
            fontFeatureSettings: value
          }),
        },
      )
    })
  ],
}
