const THEME_KEY = 'themeAtom'
const theme = localStorage.getItem(THEME_KEY)
if (theme === '"dark"' || (theme !== '"light"' && window.matchMedia('(prefers-color-scheme: dark)')?.matches)) {
  document.documentElement.classList.add('dark')
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0f172a')
}
