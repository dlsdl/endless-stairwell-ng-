import { D, d, expansion, hardy } from './num'
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

/**
 * 可可蜂蜜提供的 XP 倍率（参考游戏 cocoaBoost）：
 * cocoaBoost = 4 ^ (可可蜂蜜 ^ 0.75)
 */
export function cocoaXpMult(): D {
  const cocoa = D.from(state.res.cocoa)
  return d(4).pow(cocoa.pow(0.75))
}

/** 蜂蜜消耗后留下的临时 XP 加成 */
export function honeyBuffMult(): D {
  const eaten = D.from(state.stats.honeyEaten)
  return eaten.add(1).pow(0.25)
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

// 伤害倍率
export function dmgMult(): D {
  let m = globalMult()
  m = m.mul(d(1).add(state.permRunes.red * 0.1))
  if (state.buffTime.red > 0) m = m.mul(2)
  if (has('blood_gun')) m = m.mul(2.5)
  return m
}

/**
 * 玩家基础攻击力：1 × 1.1^(等级-1)。
 * 一旦拥有黄金蜂蜜，攻击力改为参考游戏的超运算公式：
 * attackDamage = expansion(11, 黄金蜂蜜 + 5)
 */
export function baseDamage(): D {
  const golden = D.from(state.res.golden)
  if (golden.gt(0)) return expansion(11, golden.add(5))
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

// 能量回复率倍率
export function energyRegen(): D {
  let r = d(BASE_ENERGY_REGEN)
  r = r.mul(d(1).add(state.permRunes.blue * 0.1))
  if (state.buffTime.blue > 0) r = r.mul(2)
  if (has('comb_hypergem')) r = r.mul(2.5)
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
  let m = d(1).add(state.permRunes.green * 0.1)
  if (state.buffTime.green > 0) m = m.mul(2)
  if (has('altar_shadowring')) m = m.mul(2.5)
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
  return applyCocoaHyperBonus(m)
}

/**
 * 参考游戏里可可蜂蜜获取会被可可棒 / 暗球用超运算放大：
 *  - 按可可棒数量取幂（暗球 ≥2 时指数 ×50）
 *  - 可可棒 ≥9：额外 ×10↑↑10
 *  - 按暗球数量 ×10 / ×100 / ×1e4 / ×1e10
 *  - 可可棒 ≥19：整体 ↑↑↑2（五级运算，x↑↑↑2 = x↑↑x）
 */
function applyCocoaHyperBonus(m: D): D {
  const bars = D.from(state.res.cocoaBar)
  const orbs = D.from(state.res.darkOrb)
  if (bars.gt(0)) {
    let exponent = orbs.gte(2)
      ? bars.mul(bars.gte(4) ? 500 : 100).add(1)
      : bars.mul(bars.gte(4) ? 10 : 2).add(1)
    // 指数封顶，避免直接溢出到无穷
    if (exponent.gt(1e6)) exponent = d(1e6)
    m = m.pow(exponent)
  }
  if (bars.gte(9)) m = m.mul(d(10).tetr(2)) // 10↑↑10
  if (orbs.gte(4)) m = m.mul(1e10)
  else if (orbs.gte(3)) m = m.mul(1e4)
  else if (orbs.gte(2)) m = m.mul(100)
  else if (orbs.gte(1)) m = m.mul(10)
  if (bars.gte(19)) m = m.pent(2)
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
  // 参考游戏：产量会被平方 → 再平方 → ↑↑2（迭代幂）→ ↑↑↑2（五级运算）
  if (has('blood_square')) prod = prod.pow(2)
  if (has('blood_square2')) prod = prod.pow(2)
  if (has('blood_tetrate')) prod = prod.tetr(2)
  if (has('blood_pentate')) prod = prod.pent(2)
  return prod
}

/* ------------------------------------------------------------------ *
 * 敌人
 * ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ *
 * 楼层 → hardy(n) 的 n
 *   1~200   线性：1~50 每层 +1、51~100 每层 +2、101~150 每层 +5、151~200 每层 +12
 *   201~500 指数：n = 1000 × (1e10/1000)^((楼层-200)/300)
 *   500+    迭代幂：n = 10 ↑↑ x，x 从 2 开始，
 *            501~10000 每层 +0.001、10001~1e5 每层 +0.01、
 *            1e5~1e6 每层 +0.1、1e6 以上每层 +1
 *   n 的上限：10 ↑↑ MAX_SAFE_INTEGER
 * ------------------------------------------------------------------ */

/** n 的迭代幂高度上限 */
const MAX_TETR_HEIGHT = 9007199254740991

/** 1~200 层：分段线性 */
function linearLevel(floor: number): D {
  if (floor <= 50) return d(1 + (floor - 1))
  if (floor <= 100) return d(50 + (floor - 50) * 2)
  if (floor <= 150) return d(150 + (floor - 100) * 5)
  return d(400 + (floor - 150) * 12)
}

/** 201~500 层：指数增长（200 层 = 1,000，500 层 = 1e10） */
function exponentialLevel(floor: number): D {
  const start = 1000
  const mid = 1e6
  const end = 1e10
  if (floor <= 350) return d(start).mul(d(mid / start).pow(d(floor - 200).div(150)))
  return d(mid).mul(d(end / mid).pow(d(floor - 350).div(150)))
}

/** 500 层以上的迭代幂高度 x */
function tetrationalHeight(floor: number): D {
  let x = 2
  let rest = floor - 500
  const take = (size: number, step: number): boolean => {
    const used = Math.min(rest, size)
    x += used * step
    rest -= used
    return rest > 0
  }
  if (!take(10000 - 500, 0.001)) return d(x) // 501 ~ 10000 层
  if (!take(1e5 - 1e4, 0.01)) return d(x) // 10001 ~ 1e5 层
  if (!take(1e6 - 1e5, 0.1)) return d(x) // 1e5 ~ 1e6 层
  x += rest // 1e6 层以上
  return D.min(d(x), d(MAX_TETR_HEIGHT))
}

/**
 * 怪物等级 = hardy 的参数 n。
 * 注意：1~500 层的 n 必须取整 —— hardy 会把「数位」当成序数系数展开，
 * 小数会让结果暴涨甚至导致库内部递归溢出。
 */
export function monsterLevel(floor: number): D {
  const f = Math.max(1, Math.floor(floor))
  if (f <= 200) return linearLevel(f)
  if (f <= 500) return exponentialLevel(f).round()
  return d(10).tetr(tetrationalHeight(f))
}

const hardyCache = new Map<number, D>()

/** hardy(n) 按楼层缓存（大数计算较重） */
function hardyOfFloor(floor: number): D {
  const cached = hardyCache.get(floor)
  if (cached !== undefined) return cached
  let value: D
  try {
    value = hardy(monsterLevel(floor))
  } catch {
    // 极端情况下 metanum 可能溢出，退化为一个仍然巨大的有限值
    value = d(10).tetr(d(1e6))
  }
  if (!value.isFinite()) value = d(10).tetr(d(1e6))
  hardyCache.set(floor, value)
  return value
}

/** 怪物血量 = MetaNum.hardy(n)（BOSS 额外 ×10） */
export function monsterMaxHp(floor: number, _tier: number, boss: boolean): D {
  const hp = hardyOfFloor(floor)
  return boss ? hp.mul(10) : hp
}

/** 怪物伤害 = hardy(n) / 10（BOSS 为完整血量） */
export function monsterDamage(floor: number, _tier: number, boss: boolean): D {
  const hp = hardyOfFloor(floor)
  return boss ? hp : hp.div(10)
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
