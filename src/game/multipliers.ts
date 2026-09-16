import { D, d, hardy } from './num'
import { has, state } from './state'

/* ------------------------------------------------------------------ *
 * 基础常量
 * ------------------------------------------------------------------ */
export const BASE_ENERGY_REGEN = 10 // 每秒回复的能量（满值 100）
export const BASE_ATTACK_COOLDOWN = 0.1
export const ATTACK_COST = 10
export const ENTER_ROOM_COST = 5
export const FLEE_COST = 20
export const BASE_HP_REGEN = 0.1 // 每秒回复最大生命的比例

/** 可可棒里程碑：达到数量时给予额外 ×2 全局倍率 */
export const BAR_MILESTONES = [1, 2, 4, 5, 9, 10, 11, 13, 15, 16, 19, 20, 26, 30]

export function tierOf(floor: number): number {
  return Math.ceil(floor/50)
}

/* ------------------------------------------------------------------ *
 * 全局与派生倍率
 * ------------------------------------------------------------------ */

/** 作用于几乎所有产出的全局倍率 */
export function globalMult(): D {
  let m = d(1)
  if (has('altar_shadowring')) m = m.mul(2)
  if (has('plasm_shark')) m = m.mul(5)
  if (has('comb_hypergem')) m = m.mul(10)
  if (has('blood_supergem')) m = m.mul(8)
  if (has('golden_guns')) m = m.mul(25000)

  const bars = D.from(state.res.cocoaBar)
  if (bars.gt(0)) m = m.mul(d(1.5).pow(bars))
  let milestones = 0
  for (const ms of BAR_MILESTONES) if (bars.gte(ms)) milestones++
  if (milestones > 0) m = m.mul(d(2).pow(milestones))

  const orbs = D.from(state.res.darkOrb)
  if (orbs.gt(0)) m = m.mul(d(10).pow(orbs))

  const blood = D.from(state.res.blood)
  if (blood.gt(0)) m = m.mul(blood.add(1).pow(0.1))

  const golden = D.from(state.res.golden)
  if (golden.gt(0)) m = m.mul(golden.add(1).pow(0.05))

  if (has('comb_starboost')) {
    const stars = D.from(state.res.starBar)
    if (stars.gt(0)) m = m.mul(stars.add(1).pow(0.5))
  }
  if (has('golden_floormult')) {
    m = m.mul(Math.max(1, state.floor / 100))
  }
  return m
}

/** 可可蜂蜜提供的 XP 倍率 */
export function cocoaXpMult(): D {
  const cocoa = D.from(state.res.cocoa)
  return cocoa.add(1).pow(0.4)
}

/** 蜂蜜消耗后留下的临时 XP 加成 */
export function honeyBuffMult(): D {
  const eaten = D.from(state.stats.honeyEaten)
  return eaten.add(1).pow(0.15)
}

export function xpMult(): D {
  let m = globalMult().mul(cocoaXpMult()).mul(honeyBuffMult())
  m = m.mul(d(1).add(state.permRunes.red * 0.05))
  if (has('altar_xp')) m = m.mul(1.5)
  if (state.buffTime.red > 0) m = m.mul(1.75)
  if (has('comb_tier6xp1')) m = m.mul(3)
  if (has('comb_tier6xp2')) m = m.mul(3)
  if (has('comb_tier6xp3')) m = m.mul(3)
  if (has('blood_tier7xp1')) m = m.mul(5)
  if (has('blood_tier7xp2')) m = m.mul(5)
  if (has('blood_tier7xp3')) m = m.mul(5)
  return m
}

export function dmgMult(): D {
  let m = globalMult()
  m = m.mul(d(1).add(state.permRunes.red * 0.05))
  if (state.buffTime.red > 0) m = m.mul(1.75)
  if (has('blood_gun')) m = m.mul(2)
  return m
}

/** 玩家基础攻击力：1 × 1.1^(等级-1) */
export function baseDamage(): D {
  return d(1).mul(d(1.1).pow(D.from(state.level).sub(1)))
}

export function playerDamage(): D {
  return baseDamage().mul(dmgMult())
}

/** 玩家生命上限，10 × 1.1^(等级-1)，再乘本作的额外倍率 */
export function playerMaxHp(): D {
  const base = d(10).mul(d(1.1).pow(D.from(state.level).sub(1)))
  let m = globalMult().pow(0.6)
  if (has('altar_shadowring')) m = m.mul(2)
  return base.mul(m)
}

export function hpRegen(): D {
  let r = d(BASE_HP_REGEN)
  if (has('altar_hp')) r = r.mul(3)
  if (has('plasm_shark')) r = r.mul(3)
  if (has('blood_supergem')) r = r.mul(5)
  return playerMaxHp().mul(r)
}

export function maxEnergy(): D {
  let e = d(100)
  if (has('altar_energy')) e = e.add(100)
  if (has('altar_shadowring')) e = e.add(50)
  if (has('plasm_shark')) e = e.add(100)
  return e
}

export function energyRegen(): D {
  let r = d(BASE_ENERGY_REGEN)
  r = r.mul(d(1).add(state.permRunes.blue * 0.1))
  if (state.buffTime.blue > 0) r = r.mul(1.75)
  if (has('comb_hypergem')) r = r.mul(2)
  return r
}

export function attackCooldown(): number {
  let cd = BASE_ATTACK_COOLDOWN
  if (has('blood_gun')) cd *= 0.7
  if (has('golden_guns')) cd *= 0.6
  return cd
}

/** 物品发现率倍率 */
export function itemFind(): D {
  let m = d(1).add(state.permRunes.green * 0.05)
  if (state.buffTime.green > 0) m = m.mul(1.4)
  if (has('altar_shadowring')) m = m.mul(1.25)
  return m
}

/** 祭坛转生获得的可可蜂蜜倍率 */
export function cocoaGainMult(): D {
  let m = globalMult().mul(d(1).add(D.from(state.res.plasm).pow(0.6)))
  if (has('plasm_cocoa2')) m = m.mul(2)
  if (has('plasm_cocoa2b')) m = m.mul(2)
  if (has('golden_double1')) m = m.mul(2)
  if (has('golden_double2')) m = m.mul(2)
  if (has('golden_double3')) m = m.mul(2)
  if (has('comb_hypergain')) m = m.mul(50)
  if (has('comb_starboost')) {
    const stars = D.from(state.res.starBar)
    if (stars.gt(0)) m = m.mul(stars.add(1).pow(0.75))
  }
  const vanilla = D.from(state.res.vanilla)
  if (has('altar_vanilla') && vanilla.gt(0)) {
    m = m.mul(d(1).add(vanilla.add(1).log10()).mul(2))
  }
  return m
}

/** 蜂浆获取倍率 */
export function plasmGainMult(): D {
  let m = globalMult()
  if (has('comb_hypergain')) m = m.mul(25)
  const vanilla = D.from(state.res.vanilla)
  if (has('plasm_vanillaplasm') && vanilla.gt(0)) {
    m = m.mul(d(1).add(vanilla.add(1).log10()).mul(3))
  }
  return m
}

/** 超浆获取倍率 */
export function hyperGainMult(): D {
  return globalMult().mul(has('comb_hypergain') ? 10 : 1)
}

/** 黄金蜂蜜获取倍率 */
export function goldenGainMult(): D {
  let m = globalMult()
  if (has('golden_double1')) m = m.mul(2)
  if (has('golden_double2')) m = m.mul(2)
  if (has('golden_double3')) m = m.mul(2)
  const g = D.from(state.res.golden)
  if (has('golden_logmult') && g.gt(1)) m = m.mul(g.log10().add(1))
  if (has('golden_bloodgem')) {
    const gems = D.from(state.res.bloodGem)
    if (gems.gt(0)) m = m.mul(gems.add(1).pow(0.5))
  }
  return m
}

/* ------------------------------------------------------------------ *
 * 魔血
 * ------------------------------------------------------------------ */

export const PRODUCER_COUNT = 6

export function producerCost(index: number): D {
  const owned = D.from(state.producers[index] ?? 0)
  return d(10).pow(3 * index + 3).mul(d(1.35).pow(owned))
}

export function producerRate(index: number): D {
  return d(10).pow(2 * index + 1)
}

export function bloodGainMult(): D {
  let m = globalMult()
  if (has('blood_double')) m = m.mul(2)
  if (has('blood_triple')) m = m.mul(3)
  if (has('blood_ten')) m = m.mul(10)
  if (has('blood_darkorb')) {
    const orbs = D.from(state.res.darkOrb)
    if (orbs.gt(0)) m = m.mul(d(5).pow(orbs))
  }
  return m
}

export function bloodPerSecond(): D {
  let total = d(0)
  for (let i = 0; i < PRODUCER_COUNT; i++) {
    const owned = D.from(state.producers[i] ?? 0)
    if (owned.gt(0)) total = total.add(owned.mul(producerRate(i)))
  }
  let prod = total.mul(bloodGainMult())
  if (has('blood_square')) prod = prod.pow(2)
  if (has('blood_square2')) prod = prod.pow(2)
  if (has('blood_tetrate')) prod = prod.pow(prod.log10().add(1))
  return prod
}

/* ------------------------------------------------------------------ *
 * 敌人
 * ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ *
 * 怪物血量：与参考游戏 Endless Stairwell 的分层公式保持一致
 * 参考：script.js 中 monsterEncounter() 的 if/else 链 + constants.js 的 monsters 表
 * ------------------------------------------------------------------ */

interface HardyBand {
  /** 该区间的最大楼层 */
  max: number
  /** hardy 参数 n 的区间起点 / 终点 */
  nStart: number
  nEnd: number
  /** 4 种怪物的基础伤害 */
  damage: number[]
}

/** [楼层区间 → hardy(n) 的 n 区间] 对照表 */
export const HARDY_BANDS: HardyBand[] = [
  { max: 50, nStart: 1, nEnd: 60, damage: [10, 8, 12, 12] },
  { max: 100, nStart: 61, nEnd: 120, damage: [45, 80, 140, 220] },
  { max: 150, nStart: 121, nEnd: 320, damage: [80, 100, 120, 130] },
  { max: 200, nStart: 321, nEnd: 1000, damage: [10, 12, 16, 18] },
  { max: 250, nStart: 1001, nEnd: 10000, damage: [10, 11, 12, 13] },
  { max: 300, nStart: 10001, nEnd: 1e6, damage: [10, 11, 12, 13] },
  { max: 350, nStart: 1e6, nEnd: 1e8, damage: [10, 11, 12, 13] },
  { max: 400, nStart: 1e8, nEnd: 1e10, damage: [10, 11, 12, 13] },
  { max: 450, nStart: 1e10, nEnd: 1e11, damage: [10, 11, 12, 13] },
  { max: 500, nStart: 1e11, nEnd: 1e12, damage: [10, 11, 12, 13] },
]

/** 500 层以上按同样趋势外推，n 上限 1e15 */
const HARDY_N_CAP = 1e15

/** 返回楼层所属区间下标，-1 表示超过 500 层 */
function bandIndexOf(floor: number): number {
  for (let i = 0; i < HARDY_BANDS.length; i++) {
    if (floor <= HARDY_BANDS[i].max) return i
  }
  return -1
}

/** 区间内难度 1~4（用于怪物伤害） */
export function difficultyOf(floor: number): number {
  const i = bandIndexOf(floor)
  if (i < 0) return 4
  const start = i === 0 ? 1 : HARDY_BANDS[i - 1].max + 1
  const t = (floor - start) / Math.max(1, HARDY_BANDS[i].max - start)
  return 1 + 3 * Math.max(0, Math.min(1, t))
}

const hardyCache = new Map<number, D>()

function hardyOf(n: number): D {
  const cached = hardyCache.get(n)
  if (cached !== undefined) return cached
  const value = hardy(n)
  hardyCache.set(n, value)
  return value
}

/**
 * 怪物等级 = hardy 的参数 n：按楼层在对应区间内线性插值。
 * 注意 hardy 对小数会按「数位 → 序数」展开（例如 hardy(50.5) 远大于 hardy(50)），
 * 所以 n 必须取整。
 */
export function monsterLevel(floor: number): number {
  const f = Math.max(1, Math.floor(floor))
  const i = bandIndexOf(f)
  if (i < 0) {
    // 500 层以上继续外推：每 50 层 n 放大 10 倍
    return Math.max(1, Math.round(Math.min(1e12 * Math.pow(10, (f - 500) / 50), HARDY_N_CAP)))
  }
  const band = HARDY_BANDS[i]
  const start = i === 0 ? 1 : HARDY_BANDS[i - 1].max + 1
  const t = (f - start) / Math.max(1, band.max - start)
  return Math.max(1, Math.round(band.nStart + (band.nEnd - band.nStart) * t))
}

/** 怪物血量 = MetaNum.hardy(怪物等级)（BOSS 额外 ×10） */
export function monsterMaxHp(floor: number, _tier: number, boss: boolean): D {
  const hp = hardyOf(monsterLevel(floor))
  return boss ? hp.mul(10) : hp
}

/**
 * 怪物伤害 = MetaNum.hardy(怪物等级)/10
 * 100 层以上直接以自身血量造成伤害（参考游戏同款「一击必杀」设计）。
 */
export function monsterDamage(floor: number, _tier: number, boss: boolean): D {
  if (floor > 100) return d(0)
  return boss ? hardyOf(monsterLevel(floor)) :hardyOf(monsterLevel(floor)).div(10)
}

/**
 * 击杀经验：按血量的「量级」缩放，使每层所需击杀数大致恒定。
 * 攻击力 = 10 × 1.1^(等级-1)，打掉血量 H 需要等级 ≈ 24·log₁₀(H)；
 * 而等级 = √(总经验/20)，所以经验取 (log₁₀ 血量)² 量级最合适。
 */
export function monsterXp(floor: number, tier: number, boss: boolean): D {
  const hp = monsterMaxHp(floor, tier, boss)
  let xp = hp.log10().pow(4).mul(10)
  if (has('comb_tier6xp1') && tier >= 6) xp = xp.mul(2)
  if (has('blood_tier7xp1') && tier >= 7) xp = xp.mul(2)
  if (boss) xp = xp.mul(25)
  return xp
}

/* ------------------------------------------------------------------ *
 * 等级（与参考游戏一致：累计经验 = 20 × (等级-1)²）
 * ------------------------------------------------------------------ */

/** 升到 level 级所需的累计经验 */
export function totalXpForLevel(level: D): D {
  return level.sub(1).pow(2).mul(10)
}

/** 由累计经验反解等级（闭式解，避免天文数字下的循环升级） */
export function levelFromTotalXp(totalXp: D): D {
  if (totalXp.lte(0)) return d(1)
  return totalXp.div(10).sqrt().add(1).floor().max(1)
}

/** 当前等级升到下一级还需要的经验 */
export function xpToNext(level: D): D {
  return d(10).mul(level.mul(2).sub(1))
}

/** 楼层难度（黄金升级用） */
export function floorDifficulty(): D {
  return d(1).add(state.floor / 50)
}
