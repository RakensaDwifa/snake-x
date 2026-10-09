import type { ReactElement } from 'react'
import { render, type RenderOptions, type RenderResult } from '@testing-library/react'
import { LocaleProvider } from '../lib/locale.tsx'

/**
 * Renders `ui` inside the providers the real app uses, so components that call
 * `useLocale()` don't explode under test.
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
): RenderResult {
  function Wrapper({ children }: { children: ReactElement }) {
    return <LocaleProvider>{children}</LocaleProvider>
  }
  return render(ui, { wrapper: Wrapper, ...options })
}

export * from '@testing-library/react'