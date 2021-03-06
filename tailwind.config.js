module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    fontFamily: {
      'mono': ['SF Mono', 'ui-monospace', 'SFMono-Regular'],
      'compact': ['SF Compact Text', '-apple-system', 'sans-serif'],
      'text-sans': 'Work Sans',
    },
    extend: {
      colors: {
        'blue-primary': 'hsl(206,100%,52%)',
      },
    },
  },
  plugins: [],
}
