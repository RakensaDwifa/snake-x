import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import type { SpeedMode, GameStats } from '../../types/game.ts'
import type { Inventory } from '../../types/game.ts'
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
  inventory: Inventory
  onSpeed: (m: SpeedMode) => void
  onStart: () => void
  onToggleMute: () => void
  onToggleMusic: () => void
  onToggleWrap: () => void
  onVolume: (v: number) => void
  onPurchase: (itemId: string) => boolean
  onSelectSkin: (skinId: string) => void
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
  onPurchase,
  onSelectSkin,
}: MenuScreenProps) {
  const { t, locale, setLocale } = useLocale()
  const [showStats, setShowStats] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [showProgression, setShowProgression] = useState(false)
  const [showShop, setShowShop] = useState(false)
  const [showSkins, setShowSkins] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [notice, setNotice] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    if (!notice) return
    const id = setTimeout(() => setNotice(null), 2200)
    return () => clearTimeout(id)
  }, [notice])

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
    const ok = onPurchase(itemId)
    setNotice(ok ? { kind: 'ok', text: t.purchaseSuccess } : { kind: 'err', text: t.purchaseFailed })
  }

  const handleSelectSkin = (skinId: string) => {
    onSelectSkin(skinId)
    setNotice({ kind: 'ok', text: t.skinEquipped })
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
      className="relative flex min-h-full w-full max-w-sm flex-1 flex-col items-center justify-center gap-6 p-6"
    >
      {/* Subtle circuit grid backdrop, per the menu mockup. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(148,163,184,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.25) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 75%)',
        }}
      />

      <div className="relative text-center">
        <h1 className="font-display text-5xl font-extrabold tracking-tight text-white drop-shadow-[0_0_24px_rgba(16,185,129,0.35)]">
          {t.title}
        </h1>
        {highScore > 0 && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-sm font-bold text-amber-300">
            <span aria-hidden>🏅</span>
            {t.best.replace('{score}', new Intl.NumberFormat(locale === 'id' ? 'id-ID' : 'en-US').format(highScore))}
          </div>
        )}
      </div>

      <div className="relative w-full space-y-5 rounded-2xl border border-surface-700/60 bg-surface-900/70 p-5 backdrop-blur-md shadow-2xl">
        <div>
          <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
            {t.speed}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {SPEED_ORDER.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onSpeed(mode)}
                aria-pressed={speedMode === mode}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                  speedMode === mode
                    ? 'border-snake-400 bg-snake-500/20 text-snake-300 shadow-[0_0_16px_rgba(16,185,129,0.25)]'
                    : 'border-surface-800 bg-surface-950/50 text-slate-400 hover:border-slate-600'
                }`}
              >
                {SPEED_NAME[mode]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
            {t.settings}
          </div>

          <div className="flex items-center justify-between rounded-xl border border-surface-800 bg-surface-950/50 px-3 py-2.5 text-xs text-slate-400">
            <span>
              {t.grid.replace('{size}', String(GRID_SIZE))}
            </span>
            <button
              type="button"
              onClick={onToggleMute}
              className="select-none rounded-lg px-2 py-1 font-semibold text-slate-300 transition hover:bg-surface-800"
            >
              {muted ? t.muteOn : t.muteOff}
            </button>
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
              className="rounded-xl border border-surface-700 bg-surface-950/50 px-3 py-2 text-xs text-slate-300 focus:border-snake-400 focus:outline-none"
              aria-label={t.language}
            >
              <option value="id">{t.langID}</option>
              <option value="en">{t.langEN}</option>
            </select>
          </label>
        </div>
      </div>

      <div className="relative flex w-full flex-col gap-3">
        <div className="grid grid-cols-3 gap-2">
          <MenuTile icon="📊" label={t.statsTitle} onClick={() => setShowStats(true)} />
          <MenuTile icon="🏆" label={t.achievementsTitle} onClick={() => setShowAchievements(true)} />
          <MenuTile icon="⭐" label={t.progressionTitle} onClick={() => setShowProgression(true)} />
          <MenuTile icon="🛒" label={t.shopTitle} onClick={() => setShowShop(true)} />
          <MenuTile icon="🎨" label={t.skinsTitle} onClick={() => setShowSkins(true)} />
          <div className="flex flex-col items-center justify-center rounded-xl border border-surface-800 bg-surface-950/60 px-1 py-2 text-center">
            <span aria-hidden className="text-lg leading-none">🪙</span>
            <span className="font-display text-xs font-bold text-amber-300 tabular-nums">
              {new Intl.NumberFormat(locale === 'id' ? 'id-ID' : 'en-US').format(currency.coins)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onStart}
          className="w-full rounded-2xl bg-snake-500 px-6 py-4 text-lg font-extrabold text-surface-950 shadow-[0_0_30px_rgba(16,185,129,0.45)] transition hover:bg-snake-400 active:scale-[0.98]"
        >
          {t.start}
        </button>
      </div>

      {notice && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          role="status"
          className={`relative z-20 rounded-full border px-4 py-2 text-sm font-semibold backdrop-blur-md ${
            notice.kind === 'ok'
              ? 'border-snake-500/40 bg-snake-500/15 text-snake-300'
              : 'border-red-500/40 bg-red-500/15 text-red-300'
          }`}
        >
          {notice.text}
        </motion.div>
      )}

      <p className="relative text-center text-xs text-slate-500">{t.controls}</p>
      <div
        className="relative text-center text-xs text-slate-500"
        dangerouslySetInnerHTML={{ __html: `${t.legend.slow} · ${t.legend.double} · ${t.legend.shield} · ${t.legend.gold}` }}
      />

      {showOnboarding && <OnboardingOverlay isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} onFinish={finishOnboarding} />}

      {/* Only mount the modal layer while something is open — an always-mounted
          overlay div would sit on top of the menu and swallow every click. */}
      {(showStats || showAchievements || showShop || showSkins) && (
      <div className="absolute inset-0 z-10">
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
      )}
    </motion.div>
  )
}

function MenuTile({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1 rounded-xl border border-surface-700/60 bg-surface-950/60 px-1 py-2 text-center transition hover:border-slate-500 hover:bg-surface-900 active:scale-95"
    >
      <span aria-hidden className="text-lg leading-none">{icon}</span>
      <span className="text-[11px] font-semibold leading-tight text-slate-300">{label}</span>
    </button>
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