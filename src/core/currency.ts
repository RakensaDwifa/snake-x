export interface Currency {
  coins: number
  totalEarned: number
  totalSpent: number
}

export const EMPTY_CURRENCY: Currency = {
  coins: 0,
  totalEarned: 0,
  totalSpent: 0,
}

export const COIN_PER_GAME = 5
export const COIN_PER_FOOD = 1
export const COIN_PER_WIN = 10
export const COIN_PER_ACHIEVEMENT = 5
export const COIN_PER_DAILY_QUEST = 10

export function earnCoins(currency: Currency, amount: number): Currency {
  const newCoins = currency.coins + amount
  return {
    coins: newCoins,
    totalEarned: currency.totalEarned + amount,
    totalSpent: currency.totalSpent,
  }
}

export function spendCoins(currency: Currency, amount: number): Currency | null {
  if (currency.coins < amount) return null
  return {
    coins: currency.coins - amount,
    totalEarned: currency.totalEarned,
    totalSpent: currency.totalSpent + amount,
  }
}

export function earnGameCoins(currency: Currency): Currency {
  return earnCoins(currency, COIN_PER_GAME)
}

export function earnFoodCoins(currency: Currency, count: number): Currency {
  return earnCoins(currency, count * COIN_PER_FOOD)
}

export function earnWinCoins(currency: Currency): Currency {
  return earnCoins(currency, COIN_PER_WIN)
}

export function earnAchievementCoins(currency: Currency): Currency {
  return earnCoins(currency, COIN_PER_ACHIEVEMENT)
}

export function earnDailyQuestCoins(currency: Currency): Currency {
  return earnCoins(currency, COIN_PER_DAILY_QUEST)
}

export function canAfford(currency: Currency, amount: number): boolean {
  return currency.coins >= amount
}

export function getCoinDisplay(currency: Currency): string {
  if (currency.coins >= 1000000) return `${(currency.coins / 1000000).toFixed(1)}M`
  if (currency.coins >= 1000) return `${(currency.coins / 1000).toFixed(1)}K`
  return String(currency.coins)
}

export const COIN_REWARDS = {
  GAME: COIN_PER_GAME,
  FOOD: COIN_PER_FOOD,
  WIN: COIN_PER_WIN,
  ACHIEVEMENT: COIN_PER_ACHIEVEMENT,
  DAILY_QUEST: COIN_PER_DAILY_QUEST,
} as const