import { useState, useEffect, createContext, useContext, ReactNode } from 'react'

export type Locale = 'id' | 'en'

export interface Translations {
  // Menu
  title: string
  best: string
  speed: string
  speedSlow: string
  speedNormal: string
  speedFast: string
  grid: string
  muteOn: string
  muteOff: string
  music: string
  volume: string
  wrapMode: string
  start: string
  controls: string
  legend: {
    slow: string
    double: string
    shield: string
    gold: string
  }
  // Game
  score: string
  length: string
  bestLabel: string
  combo: string
  paused: string
  resume: string
  restart: string
  menu: string
  // Game Over
  gameOver: string
  won: string
  newRecord: string
  topScores: string
  boardFull: string
  gameStats: string
  share: string
  shareCopied: string
  shareFailed: string
  // Stats
  statsTitle: string
  totalGames: string
  wins: string
  winRate: string
  totalFood: string
  totalScore: string
  avgScore: string
  maxLength: string
  bestCombo: string
  goldEaten: string
  playTime: string
  // Achievements
  achievementsTitle: string
  // Onboarding
  onboardingTitle: string
  onboardingSlides: {
    move: { title: string; desc: string }
    food: { title: string; desc: string }
    powerup: { title: string; desc: string }
  }
  // Settings
  close: string
  next: string
  finish: string
  continue: string
  understand: string
}

const translations: Record<Locale, Translations> = {
  id: {
    title: 'SNAKE X',
    best: 'Best: {score}',
    speed: 'Kecepatan',
    speedSlow: 'Santai',
    speedNormal: 'Normal',
    speedFast: 'Ngebut',
    grid: 'Grid {size}×{size}',
    muteOn: '🔇 suara mati',
    muteOff: '🔊 suara nyala',
    music: '🎵 Musik latar',
    volume: '🔊 Volume',
    wrapMode: '🔄 Mode tembus dinding (wrap)',
    start: '▶ Mulai Main',
    controls: 'Panah / WASD / geser untuk bergerak · Esc / Spasi / P untuk jeda',
    legend: {
      slow: '⭐ melambat',
      double: '<span class="text-fuchsia-300">×2</span> skor ganda',
      shield: '<span class="text-sky-300">🛡️ tameng</span>',
      gold: '<span class="text-amber-300">✨ emas</span> +5',
    },
    score: 'Skor',
    length: 'Panjang',
    bestLabel: 'Best',
    combo: '🔥 ×{combo}',
    paused: 'Jeda',
    resume: '▶ Lanjut',
    restart: '↻ Mulai Ulang',
    menu: 'Menu',
    gameOver: '💀 Game Over',
    won: '🏆 MENANG!',
    newRecord: '🎉 REKOR BARU!',
    topScores: '🏅 Skor Teratas',
    boardFull: 'Isi papan penuh ({size}×{size}) untuk menang.',
    gameStats: 'Game ke-{games} · Menang {wins}× · Panjang maks {maxLength}',
    share: '📤 Bagikan Skor',
    shareCopied: '✅ Tersalin!',
    shareFailed: '📋 Bagikan (gagal)',
    statsTitle: '📊 Statistik',
    totalGames: 'Total Main',
    wins: 'Menang',
    winRate: 'Win Rate',
    totalFood: 'Makanan',
    totalScore: 'Skor Terkumpul',
    avgScore: 'Rata-rata',
    maxLength: 'Panjang Maks',
    bestCombo: 'Kombo Terbaik',
    goldEaten: 'Emas Dimakan',
    playTime: 'Waktu Main',
    achievementsTitle: '🏆 Pencapaian',
    onboardingTitle: 'Cara Main',
    onboardingSlides: {
      move: {
        title: 'Gerakan',
        desc: 'Gunakan panah / WASD / swipe untuk menggerakkan ular. Ular tidak bisa berbalik 180°.',
      },
      food: {
        title: 'Makanan & Kombo',
        desc: 'Makan makanan merah (+1). Makan beruntun dalam 4 detik untuk kombo ×2–×5. Makanan emas ✨ = +5 poin.',
      },
      powerup: {
        title: 'Power-up & Mode',
        desc: '⭐ melambat · <span class="text-fuchsia-300">×2</span> skor ganda · 🛡️ tameng. Mode tembus dinding (wrap) di menu.',
      },
    },
    close: '✕',
    next: 'Selanjutnya',
    finish: 'Mengerti, Mulai!',
    continue: 'Lanjut',
    understand: 'Mengerti',
  },
  en: {
    title: 'SNAKE X',
    best: 'Best: {score}',
    speed: 'Speed',
    speedSlow: 'Slow',
    speedNormal: 'Normal',
    speedFast: 'Fast',
    grid: 'Grid {size}×{size}',
    muteOn: '🔇 Sound Off',
    muteOff: '🔊 Sound On',
    music: '🎵 Music',
    volume: '🔊 Volume',
    wrapMode: '🔄 Wrap Mode',
    start: '▶ Start Game',
    controls: 'Arrows / WASD / Swipe to move · Esc / Space / P to pause',
    legend: {
      slow: '⭐ Slow',
      double: '<span class="text-fuchsia-300">×2</span> Score',
      shield: '<span class="text-sky-300">🛡️ Shield</span>',
      gold: '<span class="text-amber-300">✨ Gold</span> +5',
    },
    score: 'Score',
    length: 'Length',
    bestLabel: 'Best',
    combo: '🔥 ×{combo}',
    paused: 'Paused',
    resume: '▶ Resume',
    restart: '↻ Restart',
    menu: 'Menu',
    gameOver: '💀 Game Over',
    won: '🏆 YOU WIN!',
    newRecord: '🎉 NEW RECORD!',
    topScores: '🏅 Top Scores',
    boardFull: 'Fill the board ({size}×{size}) to win.',
    gameStats: 'Game #{games} · Wins {wins}× · Max Length {maxLength}',
    share: '📤 Share Score',
    shareCopied: '✅ Copied!',
    shareFailed: '📋 Share (failed)',
    statsTitle: '📊 Statistics',
    totalGames: 'Total Games',
    wins: 'Wins',
    winRate: 'Win Rate',
    totalFood: 'Food Eaten',
    totalScore: 'Total Score',
    avgScore: 'Avg Score',
    maxLength: 'Max Length',
    bestCombo: 'Best Combo',
    goldEaten: 'Gold Eaten',
    playTime: 'Play Time',
    achievementsTitle: '🏆 Achievements',
    onboardingTitle: 'How to Play',
    onboardingSlides: {
      move: {
        title: 'Movement',
        desc: 'Use arrows / WASD / swipe to move. Snake cannot reverse 180°.',
      },
      food: {
        title: 'Food & Combo',
        desc: 'Eat red food (+1). Eat in succession within 4s for combo ×2–×5. Gold food ✨ = +5 pts.',
      },
      powerup: {
        title: 'Power-ups & Modes',
        desc: '⭐ Slow · <span class="text-fuchsia-300">×2</span> Score · 🛡️ Shield. Wrap mode in menu.',
      },
    },
    close: '✕',
    next: 'Next',
    finish: 'Got it, Play!',
    continue: 'Continue',
    understand: 'Understood',
  },
}

const LANG_KEY = 'snake-x-lang'

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'id'
  try {
    const saved = localStorage.getItem(LANG_KEY) as Locale | null
    if (saved && (saved === 'id' || saved === 'en')) return saved
    const browser = navigator.language.toLowerCase()
    return browser.startsWith('id') ? 'id' : 'en'
  } catch {
    return 'id'
  }
}

const LocaleContext = createContext<{
  locale: Locale
  setLocale: (l: Locale) => void
  t: Translations
} | null>(null)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => getInitialLocale())

  useEffect(() => {
    try {
      localStorage.setItem(LANG_KEY, locale)
    } catch {
      // ignore
    }
  }, [locale])

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}

export function t(key: keyof Translations): string {
  // This is a fallback for non-component usage
  const locale = getInitialLocale()
  return translations[locale][key] as string
}