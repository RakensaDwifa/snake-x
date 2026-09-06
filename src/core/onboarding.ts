export const ONBOARDING_KEY = 'snake-x-onboarded'

export interface OnboardingSlide {
  title: string
  description: string
  icon: string
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    title: 'Gerakan',
    description: 'Gunakan panah / WASD / swipe untuk menggerakkan ular. Ular tidak bisa berbalik 180°.',
    icon: '🎮',
  },
  {
    title: 'Makanan & Kombo',
    description: 'Makan makanan merah (+1). Makan beruntun dalam 4 detik untuk kombo ×2–×5. Makanan emas ✨ = +5 poin.',
    icon: '🍎',
  },
  {
    title: 'Power-up & Mode',
    description: '⭐ melambat · <span class="text-fuchsia-300">×2</span> skor ganda · 🛡️ tameng. Mode tembus dinding (wrap) di menu.',
    icon: '⚡',
  },
]

export function loadOnboarded(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === '1'
  } catch {
    return false
  }
}

export function saveOnboarded(): void {
  try {
    localStorage.setItem(ONBOARDING_KEY, '1')
  } catch {
    // ignore
  }
}