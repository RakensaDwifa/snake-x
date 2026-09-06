import { useState, useEffect, createContext, useContext, type ReactNode } from 'react'

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
  go: string
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
  achievement: {
    first_game: { title: string; desc: string }
    first_food: { title: string; desc: string }
    score_50: { title: string; desc: string }
    score_100: { title: string; desc: string }
    combo_x3: { title: string; desc: string }
    combo_x5: { title: string; desc: string }
    length_25: { title: string; desc: string }
    length_50: { title: string; desc: string }
    first_win: { title: string; desc: string }
    gold_10: { title: string; desc: string }
    games_10: { title: string; desc: string }
  }
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
  // Language
  language: string
  langID: string
  langEN: string
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
    go: 'MULAI!',
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
    achievement: {
      first_game: { title: 'Langkah Pertama', desc: 'Mainkan pertandingan pertama' },
      first_food: { title: 'Makan Pertama', desc: 'Makan makanan pertama' },
      score_50: { title: 'Skor 50', desc: 'Capai skor 50 dalam satu permainan' },
      score_100: { title: 'Skor 100', desc: 'Capai skor 100 dalam satu permainan' },
      combo_x3: { title: 'Kombo ×3', desc: 'Dapatkan kombo ×3' },
      combo_x5: { title: 'Kombo ×5', desc: 'Dapatkan kombo maksimal ×5' },
      length_25: { title: 'Panjang 25', desc: 'Capai panjang ular 25' },
      length_50: { title: 'Panjang 50', desc: 'Capai panjang ular 50' },
      first_win: { title: 'Menang Pertama', desc: 'Isi papan penuh dan menang' },
      gold_10: { title: 'Pemuja Emas', desc: 'Makan 10 makanan emas' },
      games_10: { title: 'Pemain Setia', desc: 'Mainkan 10 pertandingan' },
    },
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
    language: '🌐 Bahasa',
    langID: '🇮🇩 Indonesia',
    langEN: '🇺🇸 English',
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
    go: 'GO!',
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
    achievement: {
      first_game: { title: 'First Steps', desc: 'Play your first game' },
      first_food: { title: 'First Bite', desc: 'Eat your first food' },
      score_50: { title: 'Score 50', desc: 'Reach score 50 in one game' },
      score_100: { title: 'Score 100', desc: 'Reach score 100 in one game' },
      combo_x3: { title: 'Combo ×3', desc: 'Achieve combo ×3' },
      combo_x5: { title: 'Combo ×5', desc: 'Achieve max combo ×5' },
      length_25: { title: 'Length 25', desc: 'Reach snake length 25' },
      length_50: { title: 'Length 50', desc: 'Reach snake length 50' },
      first_win: { title: 'First Win', desc: 'Fill the board and win' },
      gold_10: { title: 'Gold Hunter', desc: 'Eat 10 gold food' },
      games_10: { title: 'Loyal Player', desc: 'Play 10 games' },
    },
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
    language: '🌐 Language',
    langID: '🇮🇩 Indonesian',
    langEN: '🇺🇸 English',
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