export const VAULT_KEYS: Record<number, string> = {
  1: 'ENTER', 2: 'BANKER', 3: 'CONVERT', 4: 'SMART', 5: 'SHIELD',
  6: 'LEDGER', 7: 'QUESTION', 8: 'NOTICE', 9: 'LEGACY',
  10: 'VOLUNTARY', 11: 'SOURCE', 12: 'WITHDRAW', 13: 'TENDER',
  14: 'REBUT', 15: 'CORRECT', 16: 'BURDEN', 17: 'RECORD',
  18: 'OFFICE', 19: 'ISSUE', 20: 'INSTRUMENT', 21: 'NETWORK',
  22: 'DYNASTY', 23: 'ROCKEFELLER', 24: 'PATENT', 25: 'ALLODIAL',
  26: 'TRUST', 27: 'PROTECTOR', 28: 'CENTURY', 29: 'BANKER',
  30: 'PROBATE', 31: 'PRIVATE', 32: 'TEACH', 33: 'LEGACY',
}

export const MASTER_PHRASE = Object.values(VAULT_KEYS).join(' · ')

export const TIERS = {
  piece: { label: 'PIECE', keys: 0, color: '#9FE1CB' },
  player: { label: 'PLAYER', keys: 9, color: '#1D9E75' },
  builder: { label: 'BUILDER', keys: 21, color: '#EF9F27' },
  banker: { label: 'BANKER', keys: 33, color: '#7F77DD' },
  dynasty_founder: { label: 'DYNASTY FOUNDER', keys: 33, color: '#BA7517' },
} as const

export const PRICES = {
  book1_digital: 4900,
  book1_physical: 7900,
  book1_bundle: 8900,
  book2_digital: 4900,
  book2_physical: 7900,
  book2_bundle: 8900,
  book3_digital: 4900,
  book3_physical: 7900,
  book3_bundle: 8900,
  series_digital: 12900,
  series_physical: 19900,
  series_bundle: 22900,
} as const

export const CRYPTIC_RESPONSES = [
  '// transmission not recognized',
  '// the webmaster has noted your attempt',
  '// study the first chapter again',
  '// wrong universe',
  '// the board was never yours. yet.',
  '// this terminal does not respond to the uninitiated',
  '// 33 keys. you have found none.',
]

export const BOOK_TITLES = {
  1: 'The Board Was Never Yours',
  2: 'The Tax Game',
  3: 'The Legacy',
} as const
