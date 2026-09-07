import { motion } from 'framer-motion'
import { useState } from 'react'
import { useLocale } from '../lib/locale.tsx'
import { getItemsByCategory, getUnlockStatus, type ShopItem } from '../core/shop.ts'

interface ShopPanelProps {
  coins: number
  level: number
  achievements: Set<string>
  inventory: {
    skins: Record<string, { unlocked: boolean; source: string }>
    powerUpSlots: number
  }
  onPurchase: (itemId: string) => void
  onClose: () => void
}

const CATEGORIES = [
  { id: 'featured', label: 'Unggulan', icon: '⭐' },
  { id: 'skins', label: 'Skin', icon: '🎨' },
  { id: 'slots', label: 'Slot', icon: '➕' },
  { id: 'themes', label: 'Tema', icon: '🎨' },
] as const

export function ShopPanel({
  coins,
  level,
  achievements,
  inventory,
  onPurchase,
  onClose,
}: ShopPanelProps) {
  const { t } = useLocale()
  const [activeCategory, setActiveCategory] = useState<'featured' | 'skins' | 'slots' | 'themes'>('featured')

  const items = getItemsByCategory(activeCategory)

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
          <div className="flex items-center gap-3">
            <h2 className="font-display text-xl font-bold text-white">{t.achievementsTitle.replace('Pencapaian', 'Shop')}</h2>
            <div className="flex items-center gap-2 bg-surface-800/50 px-3 py-1 rounded-xl">
              <span>💰</span>
              <span className="font-display font-bold text-snake-300">{coins >= 1000000 ? `${(coins / 1000000).toFixed(1)}M` : coins >= 1000 ? `${(coins / 1000).toFixed(1)}K` : String(coins)}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
            aria-label={t.close}
          >
            {t.close}
          </button>
        </div>

        <div className="flex gap-1 mb-4 overflow-x-auto pb-2" role="tablist">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={activeCategory === cat.id}
              onClick={() => setActiveCategory(cat.id as typeof activeCategory)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-snake-500/20 text-snake-300 border border-snake-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-3 max-h-[50vh] overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-slate-500 text-center py-8">{t.bestCombo} kategori ini kosong</p>
          ) : (
            items.map((item) => (
              <ShopItemCard
                key={item.id}
                item={item}
                coins={coins}
                level={level}
                achievements={achievements}
                inventory={inventory}
                onPurchase={() => onPurchase(item.id)}
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

function ShopItemCard({
  item,
  coins,
  level,
  achievements,
  inventory,
  onPurchase,
}: {
  item: ShopItem
  coins: number
  level: number
  achievements: Set<string>
  inventory: {
    skins: Record<string, { unlocked: boolean; source: string }>
    powerUpSlots: number
  }
  onPurchase: () => void
}) {
  const { unlocked, reason } = getUnlockStatus(item, level, achievements)
  const owned = item.price === 0 && unlocked
  const affordable = item.price === 0 || coins >= item.price
  // inventory is passed for future use
  void inventory

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition ${
        owned
          ? 'border-snake-400 bg-snake-500/10'
          : affordable
          ? 'border-surface-700 bg-surface-950/50'
          : 'border-surface-800 bg-surface-950/30 opacity-60'
      }`}
    >
      <span className="text-2xl">{item.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white truncate">{item.name}</span>
          {item.premium && <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">PREMIUM</span>}
          {item.price === 0 && unlocked && <span className="text-xs px-1.5 py-0.5 rounded bg-snake-500/20 text-snake-300">TERBUKA</span>}
        </div>
        <div className="text-xs text-slate-500 truncate">{item.description}</div>
        <div className="text-xs text-slate-500 mt-1">{reason}</div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          {item.price > 0 ? (
            <span className="font-display font-bold text-snake-300">{item.price} 💰</span>
          ) : (
            <span className="text-slate-500">GRATIS</span>
          )}
        </div>
        <button
          type="button"
          onClick={onPurchase}
          disabled={owned || !affordable}
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
            owned
              ? 'bg-snake-500/20 text-snake-300 cursor-default'
              : affordable
              ? 'bg-snake-500 hover:bg-snake-400 text-surface-950'
              : 'bg-surface-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          {owned ? 'TERBUKA' : item.price > 0 ? 'BELI' : 'AMBIL'}
        </button>
      </div>
    </div>
  )
}