import { motion } from 'framer-motion'
import { useLocale } from '../lib/locale.tsx'
import { getLevelRewards } from '../core/progression.ts'

interface ProgressionPanelProps {
  xp: number
  level: number
  xpToNext: number
  streakLogin: number
  streakPlay: number
  onClose: () => void
}

export function ProgressionPanel({ xp, level, xpToNext, streakLogin, streakPlay, onClose }: ProgressionPanelProps) {
  const { t } = useLocale()
  const rewards = getLevelRewards(level)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md rounded-2xl border border-surface-800 bg-surface-900/95 p-6"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold text-white">{t.statsTitle} / Progression</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
            aria-label={t.close}
          >
            {t.close}
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-surface-950/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-display text-lg font-bold text-white">
                Level {level}
              </span>
              <span className="text-slate-400 text-sm">
                {t.bestLabel}: {xp} XP
              </span>
            </div>
            <div className="h-3 bg-surface-900 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-snake-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (xp / (xp + xpToNext)) * 100)}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span>0 XP</span>
              <span>{xpToNext} XP to next</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatCard
              label={t.totalGames.replace('Total', 'Login Streak')}
              value={`${streakLogin} ${t.totalGames.includes('Main') ? 'hari' : 'days'}`}
              icon="🔥"
            />
            <StatCard
              label={t.totalGames.replace('Total', 'Play Streak')}
              value={`${streakPlay} ${t.totalGames.includes('Main') ? 'hari' : 'days'}`}
              icon="🎮"
            />
          </div>

          <div>
            <h3 className="font-semibold text-slate-300 mb-3">{t.achievementsTitle} / Level Rewards</h3>
            <div className="space-y-2">
              {rewards.length > 0 ? (
                rewards.map((reward, idx) => (
                  <RewardCard key={idx} reward={reward} />
                ))
              ) : (
                <p className="text-slate-500 text-sm text-center py-4">
                  {t.bestCombo} {level} {t.bestCombo.includes('Terbaik') ? 'belum memiliki reward' : 'no rewards yet'}
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-surface-800">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🎁</span>
              <div>
                <div className="font-semibold text-white">Daily Login Bonus</div>
                <div className="text-xs text-slate-500">Streak {streakLogin} hari</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎮</span>
              <div>
                <div className="font-semibold text-white">Daily Play Bonus</div>
                <div className="text-xs text-slate-500">Streak {streakPlay} hari</div>
              </div>
            </div>
          </div>
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

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-xl border border-surface-800 bg-surface-950/50 p-4 text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="font-display text-xl font-bold text-slate-200">{value}</div>
    </div>
  )
}

interface Reward {
  type: 'skin' | 'slot' | 'theme' | 'coins'
  id: string
  amount?: number
}

function RewardCard({ reward }: { reward: Reward }) {
  const icons: Record<string, string> = {
    skin: '🎨',
    slot: '➕',
    theme: '🎨',
    coins: '💰',
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-surface-800 bg-surface-950/50 px-3 py-2.5">
      <span className="text-xl">{icons[reward.type] ?? '🎁'}</span>
      <div className="flex-1">
        <div className="font-semibold text-white">
          {reward.type === 'skin' && `Skin: ${reward.id.replace('skin_', '').replace(/_/g, ' ')}`}
          {reward.type === 'slot' && `Slot Power-up: ${reward.id.replace('powerup_slot_', 'Slot ')}`}
          {reward.type === 'coins' && `${reward.amount ?? 0} Koin`}
        </div>
        <div className="text-xs text-slate-500">
          {reward.type === 'skin' && 'Skin ular'}
          {reward.type === 'slot' && 'Slot power-up tambahan'}
          {reward.type === 'coins' && 'Bonus koin'}
        </div>
      </div>
      <span className="text-snake-400 font-bold">✓</span>
    </div>
  )
}