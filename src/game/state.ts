import { reactive } from 'vue'
import { D, d } from './num'
import type { CurrencyId, GameState } from './types'

export const SAVE_VERSION = 2

export function createInitialState(): GameState {
  const zero = () => d(0)
  return {
    version: SAVE_VERSION,
    playTime: 0,
    lastSaved: Date.now(),

    hp: d(100),
    energy: d(100),
    level: d(1),
    xp: d(0),
    totalXp: d(0),
    kills: d(0),
    deaths: d(0),

    floor: 0,
    maxFloor: 0,
    inRoom: false,
    roomKind: 'none',
    monster: null,
    attackCooldown: 0,
    roomMessage: '你站在地面层。楼梯向上延伸，看不到尽头。',

    res: {
      honey: zero(),
      vanilla: zero(),
      cocoa: zero(),
      cocoaBar: zero(),
      plasm: zero(),
      hyper: zero(),
      darkBar: zero(),
      starBar: zero(),
      blood: zero(),
      bloodGem: zero(),
      golden: zero(),
      darkOrb: zero(),
    },

    runes: { red: zero(), green: zero(), blue: zero() },
    buffTime: { red: 0, green: 0, blue: 0 },
    permRunes: { red: 0, green: 0, blue: 0 },

    producers: [zero(), zero(), zero(), zero(), zero(), zero()],

    upgrades: {},
    stats: {
      altars: zero(),
      plasms: zero(),
      hypers: zero(),
      orbs: zero(),
      bestLevel: d(1),
      bestFloor: 0,
      chests: zero(),
      shrines: zero(),
      gemEels: zero(),
      honeyEaten: zero(),
    },
    settings: {
      autoAttack: false,
      autoSave: true,
      autoFloor: false,
    },
    log: ['你推开锈迹斑斑的防火门，走进了无尽的楼梯间。'],
  }
}

export const state: GameState = reactive(createInitialState()) as GameState

/** 是否已购买某个升级 */
export function has(id: string): boolean {
  return state.upgrades[id] === true
}

export function res(id: CurrencyId): D {
  return D.from(state.res[id])
}

export function addRes(id: CurrencyId, amount: D | number): void {
  state.res[id] = D.from(state.res[id]).add(D.from(amount))
}

export function canAfford(id: CurrencyId, amount: D): boolean {
  return D.from(state.res[id]).gte(amount)
}

export function pay(id: CurrencyId, amount: D): boolean {
  if (!canAfford(id, amount)) return false
  state.res[id] = D.from(state.res[id]).sub(amount)
  return true
}

export function pushLog(text: string): void {
  state.log.unshift(text)
  if (state.log.length > 60) state.log.length = 60
}

/** 用初始状态覆盖当前状态（硬重置 / 导入存档用） */
export function replaceState(next: GameState): void {
  const fresh = createInitialState()
  const merged: GameState = { ...fresh, ...next }
  merged.res = { ...fresh.res, ...(next.res ?? {}) }
  merged.runes = { ...fresh.runes, ...(next.runes ?? {}) }
  merged.buffTime = { ...fresh.buffTime, ...(next.buffTime ?? {}) }
  merged.permRunes = { ...fresh.permRunes, ...(next.permRunes ?? {}) }
  merged.upgrades = { ...(next.upgrades ?? {}) }
  merged.stats = { ...fresh.stats, ...(next.stats ?? {}) }
  merged.settings = { ...fresh.settings, ...(next.settings ?? {}) }
  merged.producers = fresh.producers.map((_, i) => D.from(next.producers?.[i] ?? 0))
  merged.version = SAVE_VERSION
  Object.assign(state, merged)
}
