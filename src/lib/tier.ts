import { TIERS } from './constants'

export function getTier(keysVerified: number[], isFounder = false): string {
  if (isFounder) return 'dynasty_founder'
  const count = keysVerified.length
  if (count >= 33) return 'banker'
  if (count >= 21) return 'builder'
  if (count >= 9) return 'player'
  return 'piece'
}

export function getTierColor(tier: string): string {
  return TIERS[tier as keyof typeof TIERS]?.color ?? '#9FE1CB'
}

export function getTierLabel(tier: string): string {
  return TIERS[tier as keyof typeof TIERS]?.label ?? 'PIECE'
}
