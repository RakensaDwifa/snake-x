import '@testing-library/jest-dom'

// Component tests assert Indonesian copy, but jsdom reports `en-US`.
// Pin the browser language so `getInitialLocale()` resolves to `id`.
Object.defineProperty(navigator, 'language', {
  value: 'id-ID',
  configurable: true,
})

// Keep persisted locale from leaking between test files.
try {
  localStorage.removeItem('snake-x-lang')
} catch {
  // storage unavailable — ignore
}