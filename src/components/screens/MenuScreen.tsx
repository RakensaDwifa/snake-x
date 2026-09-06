import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import type { SpeedMode, GameStats } from '../../types/game.ts'
import { SPEED_NAME, GRID_SIZE } from '../../core/constants.ts'
import { ACHIEVEMENTS } from '../../core/achievements.ts'
import { loadOnboarded, saveOnboarded } from '../../core/onboarding.ts'
import { OnboardingOverlay } from './OnboardingOverlay.tsx'

interface MenuScreenProps {
  highScore: number
  speedMode: SpeedMode
  muted: boolean
  volume: number
  musicOn: boolean
  wrapMode: boolean
  stats: GameStats
  achievements: Set<string>
  onSpeed: (m: SpeedMode) => void
  onStart: () => void
  onToggleMute: () => void
  onToggleMusic: () => void
  onToggleWrap: () => void
  onVolume: (v: number) => void
}

const SPEED_ORDER: SpeedMode[] = ['slow', 'normal', 'fast']

function formatSeconds(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

export function MenuScreen({
  highScore,
  speedMode,
  muted,
  volume,
  musicOn,
  wrapMode,
  stats,
  achievements,
  onSpeed,
  onStart,
  onToggleMute,
  onToggleMusic,
  onToggleWrap,
  onVolume,
}: MenuScreenProps) {
  const [showStats, setShowStats] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    if (!loadOnboarded() && stats.games === 0) {
      setShowOnboarding(true)
    }
  }, [stats.games])

  const finishOnboarding = () => {
    saveOnboarded()
    setShowOnboarding(false)
  }

  return (
    <motion.div
      key="menu"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.35 }}
      className="flex min-h-full w-full max-w-sm flex-1 flex-col items-center justify-center gap-8 p-6 relative"
    >
      <div className="text-center">
        <h1 className="font-display text-4xl font-extrabold text-white">
          SNAKE <span className="text-snake-400">X</span>
        </h1>
        {highScore > 0 && (
          <p className="mt-2 text-sm font-semibold text-amber-300">🏆 Best: {highScore}</p>
        )}
      </div>

      <div className="w-full space-y-4 rounded-2xl border border-surface-800 bg-surface-900/70 p-5">
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Kecepatan
          </div>
          <div className="grid grid-cols-3 gap-2">
            {SPEED_ORDER.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onSpeed(mode)}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                  speedMode === mode
                    ? 'border-snake-400 bg-snake-500/20 text-snake-300'
                    : 'border-surface-800 bg-surface-950/50 text-slate-400 hover:border-slate-600'
                }`}
              >
                {SPEED_NAME[mode]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-surface-800 bg-surface-950/50 px-3 py-2.5 text-xs text-slate-400">
          <span>
            Grid {GRID_SIZE}×{GRID_SIZE}
          </span>
          <span onClick={onToggleMute} className="cursor-pointer select-none" role="button">
            {muted ? '🔇 suara mati' : '🔊 suara nyala'}
          </span>
        </div>

        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-surface-800 bg-surface-950/50 px-3 py-2.5 text-xs text-slate-400">
          <span>🎵 Musik latar</span>
          <button
            type="button"
            role="switch"
            aria-checked={musicOn}
            onClick={onToggleMusic}
            className={`relative h-6 w-11 rounded-full transition ${
              musicOn ? 'bg-snake-500' : 'bg-surface-800'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                musicOn ? 'left-[22px]' : 'left-0.5'
              }`}
            />
          </button>
        </label>

        {musicOn && (
          <div className="rounded-xl border border-surface-800 bg-surface-950/50 px-3 py-2.5 text-xs text-slate-400">
            <div className="mb-1.5 flex justify-between">
              <span>🔊 Volume</span>
              <span className="font-semibold text-slate-300">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(volume * 100)}
              onChange={(e) => onVolume(Number(e.target.value) / 100)}
              aria-label="Volume"
              className="w-full accent-emerald-500"
            />
          </div>
        )}

        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-surface-800 bg-surface-950/50 px-3 py-2.5 text-xs text-slate-400">
          <span>🔄 Mode tembus dinding (wrap)</span>
          <button
            type="button"
            role="switch"
            aria-checked={wrapMode}
            onClick={onToggleWrap}
            className={`relative h-6 w-11 rounded-full transition ${
              wrapMode ? 'bg-snake-500' : 'bg-surface-800'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                wrapMode ? 'left-[22px]' : 'left-0.5'
              }`}
            />
          </button>
        </label>
      </div>

      <div className="w-full flex gap-2">
        <button
          type="button"
          onClick={() => setShowStats(true)}
          className="flex-1 rounded-xl border border-surface-700 bg-surface-950/60 px-4 py-3 font-semibold text-slate-200 transition hover:border-slate-500 active:scale-95"
        >
          📊 Statistik
        </button>
        <button
          type="button"
          onClick={() => setShowAchievements(true)}
          className="flex-1 rounded-xl border border-surface-700 bg-surface-950/60 px-4 py-3 font-semibold text-slate-200 transition hover:border-slate-500 active:scale-95"
        >
          🏆 Pencapaian
        </button>
        <button
          type="button"
          onClick={onStart}
          className="flex-1 rounded-2xl bg-snake-500 px-6 py-4 text-lg font-bold text-surface-950 shadow-[0_0_30px_rgba(16,185,129,0.5)] transition hover:bg-snake-400 active:scale-95"
        >
          ▶ Mulai Main
        </button>
      </div>

      <p className="text-center text-xs text-slate-500">
        Panah / WASD / geser untuk bergerak · Esc / Spasi / P untuk jeda
      </p>
      <div className="text-center text-xs text-slate-500">
        ⭐ melambat · <span className="text-fuchsia-300">×2</span> skor ganda ·{' '}
        <span className="text-sky-300">🛡️ tameng</span> ·{' '}
        <span className="text-amber-300">✨ emas</span> +5
      </div>

      {showStats && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowStats(false)}
        >
          <motion.div
            className="w-full max-w-md rounded-2xl border border-surface-800 bg-surface-900/95 p-6"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-white">📊 Statistik</h2>
              <button
                type="button"
                onClick={() => setShowStats(false)}
                className="text-slate-400 hover:text-white"
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <StatCard label="Total Main" value={stats.games} />
              <StatCard label="Menang" value={`${stats.wins} (${stats.games > 0 ? Math.round((stats.wins / stats.games) * 100) : 0}%)`} />
              <StatCard label="Makanan" value={stats.totalFood} />
              <StatCard label="Skor Terkumpul" value={stats.totalScore} />
              <StatCard label="Rata-rata" value={stats.games > 0 ? Math.round(stats.totalScore / stats.games) : 0} />
              <StatCard label="Panjang Maks" value={stats.maxLength} />
              <StatCard label="Kombo Terbaik" value={`×${stats.bestCombo}`} />
              <StatCard label="Emas Dimakan" value={stats.goldEaten} />
              <StatCard label="Waktu Main" value={formatSeconds(stats.playSeconds)} colSpan={2} />
            </div>

            <button
              type="button"
              onClick={() => setShowStats(false)}
              className="w-full rounded-xl border border-surface-700 bg-surface-950/60 px-4 py-2.5 font-semibold text-slate-200 transition hover:border-slate-500 active:scale-95"
            >
              Tutup
            </button>
          </motion.div>
        </motion.div>
      )}

      {showAchievements && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowAchievements(false)}
        >
          <motion.div
            className="w-full max-w-md rounded-2xl border border-surface-800 bg-surface-900/95 p-6"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-white">🏆 Pencapaian</h2>
              <button
                type="button"
                onClick={() => setShowAchievements(false)}
                className="text-slate-400 hover:text-white"
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 max-h-80 overflow-y-auto">
              {ACHIEVEMENTS.map((a) => {
                const unlocked = achievements.has(a.id)
                return (
                  <AchievementCard key={a.id} achievement={a} unlocked={unlocked} />
                )
              })}
            </div>

            <button
              type="button"
              onClick={() => setShowAchievements(false)}
              className="w-full rounded-xl border border-surface-700 bg-surface-950/60 px-4 py-2.5 font-semibold text-slate-200 transition hover:border-slate-500 active:scale-95"
            >
              Tutup
            </button>
          </motion.div>
        </motion.div>
      )}

      {showOnboarding && <OnboardingOverlay isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} onFinish={finishOnboarding} />}
    </motion.div>
  )
}

function StatCard({ label, value, colSpan = 1 }: { label: string; value: string | number; colSpan?: number }) {
  return (
    <div className={`rounded-xl border border-surface-800 bg-surface-950/50 px-3 py-2.5 ${colSpan === 2 ? 'col-span-2' : ''}`}>
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="font-display text-xl font-bold text-slate-200">{value}</div>
    </div>
  )
}

function AchievementCard({ achievement, unlocked }: { achievement: typeof ACHIEVEMENTS[0]; unlocked: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${
        unlocked
          ? 'border-snake-400 bg-snake-500/15 text-snake-300'
          : 'border-surface-800 bg-surface-950/50 text-slate-400 opacity-50'
      }`}
      title={achievement.description}
    >
      <span className="text-lg">{achievement.icon}</span>
      <span className="font-semibold">{achievement.title}</span>
      {unlocked && <span className="ml-auto text-snake-400">✓</span>}
    </div>
  )
}