import '@testing-library/jest-dom'
import { LocaleProvider } from '../lib/locale.tsx'
import { ReactElement } from 'react'

// Wrap all renders with LocaleProvider
const customRender = (ui: ReactElement) => {
  return render(<LocaleProvider>{ui}</LocaleProvider>)
}

export { customRender as render }