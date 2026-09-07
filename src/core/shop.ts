import type { Currency } from './currency.ts'
import type { Inventory } from '../lib/storage.ts'
import { canAfford, spendCoins } from './currency.ts'

export interface ShopItem {
  id: string
  name: string
  description: string
  icon: string
  price: number
  type: 'skin' | 'slot' | 'theme' | 'powerup'
  category: 'featured' | 'skins' | 'slots' | 'themes'
  unlockCondition?: { type: 'level' | 'achievement'; value: number | string }
  premium: boolean
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'skin_classic_green',
    name: 'Classic Green',
    description: 'Warna klasik ular asli',
    icon: '🟢',
    price: 0,
    type: 'skin',
    category: 'skins',
    unlockCondition: { type: 'level', value: 3 },
    premium: false,
  },
  {
    id: 'skin_neon',
    name: 'Neon Glow',
    description: 'Efek neon futuristik',
    icon: '💚',
    price: 0,
    type: 'skin',
    category: 'skins',
    unlockCondition: { type: 'level', value: 5 },
    premium: false,
  },
  {
    id: 'skin_retro',
    name: 'Retro Pixel',
    description: 'Gaya pixel art klasik',
    icon: '🟩',
    price: 0,
    type: 'skin',
    category: 'skins',
    unlockCondition: { type: 'level', value: 7 },
    premium: false,
  },
  {
    id: 'skin_golden',
    name: 'Golden Legend',
    description: 'Kulit emas legendaris (Level 10)',
    icon: '🏆',
    price: 0,
    type: 'skin',
    category: 'skins',
    unlockCondition: { type: 'level', value: 10 },
    premium: false,
  },
  {
    id: 'skin_cyberpunk',
    name: 'Cyberpunk',
    description: 'Neon pink & cyan, gaya masa depan',
    icon: '🌈',
    price: 500,
    type: 'skin',
    category: 'skins',
    premium: true,
  },
  {
    id: 'skin_void',
    name: 'Void Walker',
    description: 'Hitam pekat dengan partikel ungu',
    icon: '🟣',
    price: 750,
    type: 'skin',
    category: 'skins',
    premium: true,
  },
  {
    id: 'skin_fire',
    name: 'Inferno',
    description: 'Efek api merah-oranye menyala',
    icon: '🔥',
    price: 600,
    type: 'skin',
    category: 'skins',
    premium: true,
  },
  {
    id: 'skin_ice',
    name: 'Frostbite',
    description: 'Biru es dengan efek salju',
    icon: '❄️',
    price: 600,
    type: 'skin',
    category: 'skins',
    premium: true,
  },
  {
    id: 'powerup_slot_2',
    name: 'Slot Power-up Kedua',
    description: 'Bawa 2 power-up sekaligus',
    icon: '➕',
    price: 0,
    type: 'slot',
    category: 'slots',
    unlockCondition: { type: 'level', value: 2 },
    premium: false,
  },
  {
    id: 'powerup_slot_3',
    name: 'Slot Power-up Ketiga',
    description: 'Bawa 3 power-up sekaligus',
    icon: '➕➕',
    price: 0,
    type: 'slot',
    category: 'slots',
    unlockCondition: { type: 'level', value: 4 },
    premium: false,
  },
  {
    id: 'powerup_slot_4',
    name: 'Slot Power-up Keempat',
    description: 'Bawa 4 power-up sekaligus',
    icon: '➕➕➕',
    price: 0,
    type: 'slot',
    category: 'slots',
    unlockCondition: { type: 'level', value: 6 },
    premium: false,
  },
  {
    id: 'powerup_slot_5',
    name: 'Slot Power-up Kelima',
    description: 'Maksimal 5 power-up (Level 8)',
    icon: '➕➕➕➕',
    price: 0,
    type: 'slot',
    category: 'slots',
    unlockCondition: { type: 'level', value: 8 },
    premium: false,
  },
]

export function getShopItems(): ShopItem[] {
  return SHOP_ITEMS
}

export function getItemsByCategory(category: ShopItem['category']): ShopItem[] {
  return SHOP_ITEMS.filter(item => item.category === category)
}

export function getItemById(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find(item => item.id === id)
}

export function isItemOwned(inventory: Inventory, itemId: string): boolean {
  if (itemId.startsWith('skin_')) {
    return inventory.skins[itemId]?.unlocked ?? false
  }
  if (itemId.startsWith('powerup_slot_')) {
    const slotNum = parseInt(itemId.split('_')[2], 10)
    return inventory.powerUpSlots >= slotNum
  }
  return false
}

export function canPurchase(currency: Currency, item: ShopItem): boolean {
  if (item.price === 0) return true // Free unlock via level/achievement
  return canAfford(currency, item.price)
}

export function getUnlockStatus(item: ShopItem, level: number, achievements: Set<string>): { unlocked: boolean; reason: string } {
  if (item.price === 0 && item.unlockCondition) {
    if (item.unlockCondition.type === 'level') {
      const requiredLevel = typeof item.unlockCondition.value === 'number' ? item.unlockCondition.value : parseInt(item.unlockCondition.value, 10)
      const unlocked = level >= requiredLevel
      return {
        unlocked,
        reason: unlocked ? 'Terbuka' : `Butuh Level ${requiredLevel}`,
      }
    }
    if (item.unlockCondition.type === 'achievement') {
      const achId = typeof item.unlockCondition.value === 'string' ? item.unlockCondition.value : String(item.unlockCondition.value)
      const unlocked = achievements.has(achId)
      return {
        unlocked,
        reason: unlocked ? 'Terbuka' : `Butuh Achievement: ${achId}`,
      }
    }
  }
  return { unlocked: false, reason: item.premium ? `Harga: ${item.price} koin` : 'Terbuka' }
}

export function purchaseItem(
  currency: Currency,
  inventory: Inventory,
  item: ShopItem
): { currency: Currency; inventory: Inventory } | null {
  if (!canPurchase(currency, item)) return null

  const newCurrency = item.price > 0 ? spendCoins(currency, item.price)! : currency

  let newInventory = { ...inventory }

  if (item.id.startsWith('skin_')) {
    newInventory = {
      ...newInventory,
      skins: {
        ...newInventory.skins,
        [item.id]: { unlocked: true, source: item.premium ? 'shop' : 'level' },
      },
    }
  } else if (item.id.startsWith('powerup_slot_')) {
    const slotNum = parseInt(item.id.split('_')[2], 10)
    newInventory = {
      ...newInventory,
      powerUpSlots: Math.max(newInventory.powerUpSlots, slotNum),
    }
  }

  return { currency: newCurrency, inventory: newInventory }
}

export function getEquippedSkin(inventory: Inventory): string {
  return inventory.equippedSkin ?? 'skin_classic_green'
}

export function setEquippedSkin(inventory: Inventory, skinId: string): Inventory {
  if (!inventory.skins[skinId]?.unlocked) return inventory
  return { ...inventory, equippedSkin: skinId }
}

export function getAvailablePowerUpSlots(inventory: Inventory): number {
  return inventory.powerUpSlots ?? 1
}