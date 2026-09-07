import { motion } from 'framer-motion'
import { useState } from 'react'
import { useLocale } from '../lib/locale.tsx'
import { getAllSkins, getSkinColors, isSkinUnlocked, getSkinDisplayName, getSkinIcon } from '../core/skins.ts'

interface SkinSelectorProps {
  currentSkin: string
  level: number
  achievements: Set<string>
  dailyStreak: number
  inventory: {
    skins: Record<string, { unlocked: boolean; source: string }>
  }
  onSelect: (skinId: string) => void
  onClose: () => void
}

export function SkinSelector({
  currentSkin,
  level,
  achievements,
  dailyStreak,
  inventory,
  onSelect,
  onClose,
}: SkinSelectorProps) {
  const { t } = useLocale()
  const [viewMode, setViewMode] = useState<'all' | 'owned' | 'locked'>('all')

  const skins = getAllSkins()
  const filteredSkins = skins.filter((skin) => {
    const unlocked = isSkinUnlocked(skin.id, level, achievements, dailyStreak)
    if (viewMode === 'owned') return unlocked
    if (viewMode === 'locked') return !unlocked
    return true
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md rounded-2xl border border-surface-800 bg-surface-900/95 p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold text-white">{t.achievementsTitle.replace('Pencapaian', 'Skin Ular')}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
            aria-label={t.close}
          >
            {t.close}
          </button>
        </div>

        <div className="flex gap-2 mb-4" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'all'}
            onClick={() => setViewMode('all')}
            className={`flex-1 px-3 py-2 rounded-xl text-sm font-semibold transition ${
              viewMode === 'all'
                ? 'bg-snake-500/20 text-snake-300 border border-snake-400'
                : 'bg-surface-800/50 text-slate-400 hover:text-slate-200'
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'owned'}
            onClick={() => setViewMode('owned')}
            className={`flex-1 px-3 py-2 rounded-xl text-sm font-semibold transition ${
              viewMode === 'owned'
                ? 'bg-snake-500/20 text-snake-300 border border-snake-400'
                : 'bg-surface-800/50 text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.achievementsTitle.replace('Pencapaian', 'Dimiliki')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'locked'}
            onClick={() => setViewMode('locked')}
            className={`flex-1 px-3 py-2 rounded-xl text-sm font-semibold transition ${
              viewMode === 'locked'
                ? 'bg-snake-500/20 text-snake-300 border border-snake-400'
                : 'bg-surface-800/50 text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.achievementsTitle.replace('Pencapaian', 'Terkunci')}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
          {filteredSkins.length === 0 ? (
            <div className="col-span-2 text-center py-8 text-slate-500">
              Tidak ada skin untuk filter ini
            </div>
          ) : (
            filteredSkins.map((skin) => (
              <SkinCard
                key={skin.id}
                skin={skin}
                isCurrent={currentSkin === skin.id}
                unlocked={isSkinUnlocked(skin.id, 999, achievements, dailyStreak)}
                owned={inventory.skins[skin.id]?.unlocked ?? false}
                onSelect={() => onSelect(skin.id)}
              />
            ))
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-6 rounded-xl border border-surface-700 bg-surface-950/60 px-4 py-3 font-semibold text-slate-200 transition hover:border-slate-500 active:scale-95"
        >
          {t.close}
        </button>
      </motion.div>
    </motion.div>
  )
}

function SkinCard({
  skin,
  isCurrent,
  unlocked,
  owned,
  onSelect,
}: {
  skin: { id: string; name: string; icon: string; premium: boolean; unlockCondition?: any }
  isCurrent: boolean
  unlocked: boolean
  owned: boolean
  onSelect: () => void
}) {
  const colors = getSkinColors(skin.id)

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={!unlocked}
      className={`relative group aspect-square rounded-xl border-2 p-3 transition ${
        isCurrent
          ? 'border-snake-400 bg-snake-500/10'
          : unlocked
          ? 'border-surface-700 bg-surface-950/50 hover:border-snake-400/50'
          : 'border-surface-800 bg-surface-950/30 opacity-50 cursor-not-allowed'
      }`}
    >
      <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br" style={{
        background: `linear-gradient(135deg, ${colors.head}, ${colors.body}, ${colors.tail})`
      }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl opacity-0 group-hover:opacity-100 transition-opacity">{getSkinIcon(skin.id)}</span>
        </div>
      </div>

      <div className="mt-3 text-center">
        <div className="flex items-center justify-center gap-1.5">
          <span className="font-semibold text-white truncate">{getSkinDisplayName(skin.id)}</span>
          {skin.premium && <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">PREMIUM</span>}
        </div>

        {!unlocked && (
          <div className="mt-1 text-xs text-slate-500">
            {skin.unlockCondition?.type === 'level' && `Level ${skin.unlockCondition.value}`}
            {skin.unlockCondition?.type === 'daily' && `Streak ${skin.unlockCondition.value} hari`}
            {skin.unlockCondition?.type === 'achievement' && `Achievement`}
            {skin.premium && `${skin.unlockCondition ? '' : 'Premium'}`}
          </div>
        )}

        {unlocked && !isCurrent && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); }} // handled by parent onSelect
            className="mt-2 w-full px-3 py-1.5 rounded-lg text-xs font-semibold bg-snake-500 hover:bg-snake-400 text-surface-950 transition"
          >
            PILIH
          </button>
        )}

        {isCurrent && (
          <div className="mt-2 w-full px-3 py-1.5 rounded-lg text-xs font-semibold bg-snake-500/20 text-snake-300">
            DIGUNAKAN
          </div>
        )}

        {!unlocked && !skin.premium && (
          <div className="mt-2 w-full px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-800 text-slate-500 cursor-not-allowed">
            TERKUNCI
          </div>
        )}
      </div>

      {isCurrent && (
        <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-snake-500 flex items-center justify-center text-white text-xs font-bold">
          ✓
        </div>
      )}

      {owned && !isCurrent && !unlocked && (
        <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-slate-600 flex items-center justify-center text-white text-xs font-bold">
          🔒
        </div>
      )}
    </button>
  )
}