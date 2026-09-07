import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import type { SpeedMode, GameStats } from '../../types/game.ts'
import { GRID_SIZE } from '../../core/constants.ts'
import { ACHIEVEMENTS } from '../../core/achievements.ts'
import { loadOnboarded, saveOnboarded } from '../../core/onboarding.ts'
import { OnboardingOverlay } from './OnboardingOverlay.tsx'
import { ProgressionPanel } from '../ProgressionPanel.tsx'
import { ShopPanel } from '../ShopPanel.tsx'
import { SkinSelector } from '../SkinSelector.tsx'
import { useLocale } from '../../lib/locale.tsx'

interface MenuScreenProps {
  highScore: number
  speedMode: SpeedMode
  muted: boolean
  volume: number
  musicOn: boolean
  wrapMode: boolean
  stats: GameStats
  achievements: Set<string>
  progression: {
    xp: number
    level: number
    xpToNext: number
    streakLogin: number
    streakPlay: number
  }
  currency: {
    coins: number
    totalEarned: number
    totalSpent: number
  }
  inventory: {
    skins: Record<string, { unlocked: boolean; source: string }>
    equippedSkin: string
    powerUpSlots: number
    equippedPowerUps: string[]
  }
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
  progression,
  currency,
  inventory,
  onSpeed,
  onStart,
  onToggleMute,
  onToggleMusic,
  onToggleWrap,
  onVolume,
}: MenuScreenProps) {
  const { t, locale, setLocale } = useLocale()
  const [showStats, setShowStats] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [showProgression, setShowProgression] = useState(false)
  const [showShop, setShowShop] = useState(false)
  const [showSkins, setShowSkins] = useState(false)
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

  const handlePurchase = (itemId: string) => {
    // Purchase logic will be handled by parent
    console.log('Purchase:', itemId)
  }

  const handleSelectSkin = (skinId: string) => {
    // Skin selection will be handled by parent
    console.log('Select skin:', skinId)
  }

  const SPEED_NAME: Record<SpeedMode, string> = {
    slow: t.speedSlow,
    normal: t.speedNormal,
    fast: t.speedFast,
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
          {t.title}
        </h1>
        {highScore > 0 && (
          <p className="mt-2 text-sm font-semibold text-amber-300">{t.best.replace('{score}', String(highScore))}</p>
        )}
      </div>

      <div className="w-full space-y-4 rounded-2xl border border-surface-800 bg-surface-900/70 p-5">
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {t.speed}
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
            {t.grid.replace('{size}', String(GRID_SIZE))}
          </span>
          <span onClick={onToggleMute} className="cursor-pointer select-none" role="button">
            {muted ? t.muteOn : t.muteOff}
          </span>
        </div>

        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-surface-800 bg-surface-950/50 px-3 py-2.5 text-xs text-slate-400">
          <span>{t.music}</span>
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
              <span>{t.volume}</span>
              <span className="font-semibold text-slate-300">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(volume * 100)}
              onChange={(e) => onVolume(Number(e.target.value) / 100)}
              aria-label={t.volume}
              className="w-full accent-emerald-500"
            />
          </div>
        )}

        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-surface-800 bg-surface-950/50 px-3 py-2.5 text-xs text-slate-400">
          <span>{t.wrapMode}</span>
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

        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-surface-800 bg-surface-950/50 px-3 py-2.5 text-xs text-slate-400">
          <span>{t.language}</span>
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as 'id' | 'en')}
            className="rounded-xl border border-surface-700 bg-surface-950/50 px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-snake-400"
            aria-label={t.language}
          >
            <option value="id">{t.langID}</option>
            <option value="en">{t.langEN}</option>
          </select>
        </label>
      </div>

      <div className="w-full flex flex-col gap-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowStats(true)}
            className="flex-1 rounded-xl border border-surface-700 bg-surface-950/60 px-4 py-3 font-semibold text-slate-200 transition hover:border-slate-500 active:scale-95"
          >
            {t.statsTitle}
          </button>
          <button
            type="button"
            onClick={() => setShowAchievements(true)}
            className="flex-1 rounded-xl border border-surface-700 bg-surface-950/60 px-4 py-3 font-semibold text-slate-200 transition hover:border-slate-500 active:scale-95"
          >
            {t.achievementsTitle}
          </button>
          <button
            type="button"
            onClick={() => setShowProgression(true)}
            className="flex-1 rounded-xl border border-surface-700 bg-surface-950/60 px-4 py-3 font-semibold text-slate-200 transition hover:border-slate-500 active:scale-95"
          >
            {t.statsTitle.replace('Statistik', 'Progression')}
          </button>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowShop(true)}
            className="flex-1 rounded-xl border border-surface-700 bg-surface-950/60 px-4 py-3 font-semibold text-slate-200 transition hover:border-slate-500 active:scale-95"
          >
            🛒 Shop
          </button>
          <button
            type="button"
            onClick={() => setShowSkins(true)}
            className="flex-1 rounded-xl border border-surface-700 bg-surface-950/60 px-4 py-3 font-semibold text-slate-200 transition hover:border-slate-500 active:scale-95"
          >
            🎨 Skin
          </button>
          <button
            type="button"
            onClick={onStart}
            className="flex-1 rounded-2xl bg-snake-500 px-6 py-4 text-lg font-bold text-surface-950 shadow-[0_0_30px_rgba(16,185,129,0.5)] transition hover:bg-snake-400 active:scale-95"
          >
            {t.start}
          </button>
        </div>

      <p className="text-center text-xs text-slate-500">
        {t.controls}
      </p>
      <div className="text-center text-xs text-slate-500" dangerouslySetInnerHTML={{ __html: `${t.legend.slow} · ${t.legend.double} · ${t.legend.shield} · ${t.legend.gold}` }} />

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
              <h2 className="font-display text-xl font-bold text-white">{t.statsTitle}</h2>
              <button
                type="button"
                onClick={() => setShowStats(false)}
                className="text-slate-400 hover:text-white"
                aria-label={t.close}
              >
                {t.close}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <StatCard label={t.totalGames} value={stats.games} />
              <StatCard label={t.wins} value={`${stats.wins} (${stats.games > 0 ? Math.round((stats.wins / stats.games) * 100) : 0}%)`} />
              <StatCard label={t.totalFood} value={stats.totalFood} />
              <StatCard label={t.totalScore} value={stats.totalScore} />
              <StatCard label={t.avgScore} value={stats.games > 0 ? Math.round(stats.totalScore / stats.games) : 0} />
              <StatCard label={t.maxLength} value={stats.maxLength} />
              <StatCard label={t.bestCombo} value={`×${stats.bestCombo}`} />
              <StatCard label={t.goldEaten} value={stats.goldEaten} />
              <StatCard label={t.playTime} value={formatSeconds(stats.playSeconds)} colSpan={2} />
            </div>

            <button
              type="button"
              onClick={() => setShowStats(false)}
              className="w-full rounded-xl border border-surface-700 bg-surface-950/60 px-4 py-2.5 font-semibold text-slate-200 transition hover:border-slate-500 active:scale-95"
            >
              {t.close}
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
              <h2 className="font-display text-xl font-bold text-white">{t.achievementsTitle}</h2>
              <button
                type="button"
                onClick={() => setShowAchievements(false)}
                className="text-slate-400 hover:text-white"
                aria-label={t.close}
              >
                {t.close}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 max-h-80 overflow-y-auto">
              {ACHIEVEMENTS.map((a) => {
                const unlocked = achievements.has(a.id)
                return (
                  <AchievementCard
                    key={a.id}
                    achievement={a}
                    unlocked={unlocked}
                    title={t.achievement[a.id]?.title ?? a.title}
                    description={t.achievement[a.id]?.desc ?? a.description}
                  />
                )
              })}
            </div>

            <button
              type="button"
              onClick={() => setShowAchievements(false)}
              className="w-full rounded-xl border border-surface-700 bg-surface-950/60 px-4 py-2.5 font-semibold text-slate-200 transition hover:border-slate-500 active:scale-95"
            >
              {t.close}
            </button>
          </motion.div>
        </motion.div>
      )}

      {showProgression && (
        <ProgressionPanel
          xp={progression.xp}
          level={progression.level}
          xpToNext={progression.xpToNext}
          streakLogin={progression.streakLogin}
          streakPlay={progression.streakPlay}
          onClose={() => setShowProgression(false)}
        />
      )}

      {showShop && (
        <ShopPanel
          coins={currency.coins}
          level={progression.level}
          achievements={achievements}
          inventory={inventory}
          onPurchase={handlePurchase}
          onClose={() => setShowShop(false)}
        />
      )}

      {showSkins && (
        <SkinSelector
          currentSkin={inventory.equippedSkin}
          level={progression.level}
          achievements={achievements}
          dailyStreak={progression.streakLogin}
          inventory={inventory}
          onSelect={handleSelectSkin}
          onClose={() => setShowSkins(false)}
        />
      )}

      {showOnboarding && <OnboardingOverlay isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} onFinish={finishOnboarding} />}
      </div>
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

function AchievementCard({
  achievement,
  unlocked,
  title,
  description,
}: {
  achievement: typeof ACHIEVEMENTS[0]
  unlocked: boolean
  title: string
  description: string
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${
        unlocked
          ? 'border-snake-400 bg-snake-500/15 text-snake-300'
          : 'border-surface-800 bg-surface-950/50 text-slate-400 opacity-50'
      }`}
      title={description}
    >
      <span className="text-lg">{achievement.icon}</span>
      <span className="font-semibold">{title}</span>
      {unlocked && <span className="ml-auto text-snake-400">✓</span>}
    </div>
  )
}