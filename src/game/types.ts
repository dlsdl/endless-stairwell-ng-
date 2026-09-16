import type { D } from './num'

export type CurrencyId =
  | 'honey'
  | 'vanilla'
  | 'cocoa'
  | 'cocoaBar'
  | 'plasm'
  | 'hyper'
  | 'darkBar'
  | 'starBar'
  | 'blood'
  | 'bloodGem'
  | 'golden'
  | 'darkOrb'

export const CURRENCY_ORDER: CurrencyId[] = [
  'honey',
  'vanilla',
  'cocoa',
  'cocoaBar',
  'plasm',
  'hyper',
  'darkBar',
  'starBar',
  'blood',
  'bloodGem',
  'golden',
  'darkOrb',
]

export type RuneColor = 'red' | 'green' | 'blue'

export type RoomKind = 'none' | 'monster' | 'chest' | 'shrine'

export interface MonsterState {
  name: string
  /** 怪物等级（hardy 的参数 n），血量 = MetaNum.hardy(等级) */
  level: D
  tier: number
  floor: number
  hp: D
  maxHp: D
  dmg: D
  /** 距离下次攻击的秒数 */
  timer: number
  /** 攻击间隔（秒） */
  interval: number
  boss: boolean
  /** 是否已经攻击过一次（用于「首次攻击延迟」升级） */
  firstDone: boolean
}

export interface GameState {
  version: number
  playTime: number
  lastSaved: number

  /** 角色 */
  hp: D
  energy: D
  level: D
  xp: D
  totalXp: D
  kills: D
  deaths: D

  /** 楼层与房间 */
  floor: number
  maxFloor: number
  inRoom: boolean
  roomKind: RoomKind
  monster: MonsterState | null
  attackCooldown: number
  roomMessage: string

  /** 资源 */
  res: Record<CurrencyId, D>

  /** 一次性符文库存 / 生效剩余时间 / 永久符文等级 */
  runes: Record<RuneColor, D>
  buffTime: Record<RuneColor, number>
  permRunes: Record<RuneColor, number>

  /** 魔血生产者数量（6 个阶层） */
  producers: D[]

  upgrades: Record<string, boolean>
  stats: {
    altars: D
    plasms: D
    hypers: D
    orbs: D
    bestLevel: D
    bestFloor: number
    chests: D
    shrines: D
    gemEels: D
    honeyEaten: D
  }
  settings: {
    autoAttack: boolean
    autoSave: boolean
    autoFloor: boolean
  }
  log: string[]
}

export interface UpgradeDef {
  id: string
  name: string
  desc: string
  currency: CurrencyId
  cost: D | ((s: GameState) => D)
  requires?: (s: GameState) => boolean
  /** 未解锁时是否隐藏（默认隐藏，需 requires 通过） */
  maxLevel?: number
  level?: (s: GameState) => number
  onBuy?: (s: GameState) => void
}

export interface PrestigeDef {
  id: string
  name: string
  button: string
  desc: string
  currency: CurrencyId
  can: (s: GameState) => boolean
  reqText: (s: GameState) => string
  gain: (s: GameState) => D
}
