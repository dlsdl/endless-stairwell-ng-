import MN from 'metanum'
import { D, d, hardy } from './num'
import { has, state } from './state'

/* ------------------------------------------------------------------ *
 * 基础常量
 * ------------------------------------------------------------------ */
export const BASE_ENERGY_REGEN = 5 // 每秒回复的能量（满值 100）
export const BASE_ATTACK_COOLDOWN = 0.7
export const ATTACK_COST = 4
export const ENTER_ROOM_COST = 5
export const FLEE_COST = 20
export const BASE_HP_REGEN = 0.004 // 每秒回复最大生命的比例

/** 可可棒里程碑：达到数量时给予额外 ×2 全局倍率 */
export const BAR_MILESTONES = [1, 2, 4, 5, 9, 10, 11, 13, 15, 16, 19, 20, 26, 30]

export function tierOf(floor: number): number {
  if (floor < 50) return 1
  if (floor < 100) return 2
  if (floor < 149) return 3
  if (floor < 248) return 4
  if (floor < 299) return 5
  if (floor < 351) return 6
  if (floor < 500) return 7
  return 8
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

/** 玩家基础攻击力（未计倍率）：与参考游戏一致，10 × 1.1^(等级-1) */
export function baseDamage(): D {
  return d(10).mul(d(1.1).pow(D.from(state.level).sub(1)))
}

export function playerDamage(): D {
  return baseDamage().mul(dmgMult())
}

/** 玩家生命上限：与参考游戏一致，100 × 1.1^(等级-1)，再乘本作的额外倍率 */
export function playerMaxHp(): D {
  const base = d(100).mul(d(1.1).pow(D.from(state.level).sub(1)))
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

type BandKind = 'low' | 'mid' | 'pow2' | 'tetr' | 'pent' | 'arrow'

interface MonsterBand {
  /** 该区间的最大楼层 */
  max: number
  /** 4 种怪物的基础血量（取自参考游戏 constants.js 的 monsters 表） */
  health: number[]
  /** 4 种怪物的基础伤害（同上） */
  damage: number[]
  kind: BandKind
  /** arrow 区间使用的箭号数量 */
  arrows?: number
}

/** 楼层区间表（边界 50/100/150/200/250/300/350/500 与参考游戏一致） */
export const MONSTER_BANDS: MonsterBand[] = [
  { max: 50, health: [75, 100, 120, 150], damage: [10, 8, 12, 12], kind: 'low' },
  { max: 100, health: [600, 1000, 1500, 1800], damage: [45, 80, 140, 220], kind: 'mid' },
  { max: 150, health: [80, 100, 120, 130], damage: [80, 100, 120, 130], kind: 'pow2' },
  { max: 200, health: [10, 12, 16, 18], damage: [10, 12, 16, 18], kind: 'tetr' },
  { max: 250, health: [10, 11, 12, 13], damage: [10, 11, 12, 13], kind: 'pent' },
  { max: 300, health: [10, 11, 12, 13], damage: [10, 11, 12, 13], kind: 'arrow', arrows: 6 },
  { max: 350, health: [10, 11, 12, 13], damage: [10, 11, 12, 13], kind: 'arrow', arrows: 8 },
  { max: 500, health: [10, 11, 12, 13], damage: [10, 11, 12, 13], kind: 'arrow', arrows: 10 },
  { max: Infinity, health: [10, 11, 12, 13], damage: [10, 11, 12, 13], kind: 'arrow', arrows: 12 },
]

function bandIndexOf(floor: number): number {
  for (let i = 0; i < MONSTER_BANDS.length; i++) {
    if (floor <= MONSTER_BANDS[i].max) return i
  }
  return MONSTER_BANDS.length - 1
}

/**
 * 区间内难度：参考游戏中每个区间有 4 个「特殊楼层」，难度依次为 1~4。
 * 这里按楼层在区间内的相对位置线性插值出同样的 1~4。
 */
export function difficultyOf(floor: number): number {
  const i = bandIndexOf(floor)
  const end = MONSTER_BANDS[i].max
  const start = i === 0 ? 1 : MONSTER_BANDS[i - 1].max + 1
  if (!Number.isFinite(end)) return 4
  const t = (floor - start) / Math.max(1, end - start)
  return 1 + 3 * Math.max(0, Math.min(1, t))
}

/** 与参考游戏一致的目标血量（反解怪物等级前的设计值） */
function monsterHpTarget(floor: number, boss: boolean): D {
  const i = bandIndexOf(floor)
  const band = MONSTER_BANDS[i]
  const base = band.health[floor % band.health.length]
  const diff = difficultyOf(floor)
  let hp: D

  switch (band.kind) {
    // 1~50 层：health × 1.5^(难度-1)
    case 'low':
      hp = d(base).mul(d(1.5).pow(diff - 1))
      break
    // 51~100 层：health × 1.5^(难度×3-1)
    case 'mid':
      hp = d(base).mul(d(1.5).pow(diff * 3 - 1))
      break
    // 101~150 层：10^10^(health^难度)
    case 'pow2':
      hp = d(10).pow(d(10).pow(d(base).pow(diff - 0.075)))
      break
    // 151~200 层：10↑↑(health × 难度 - 6)
    case 'tetr': {
      const height = base * diff * 0.9 - 6
      hp = height < 2 ? d(10).pow(Math.max(1, height)) : d(10).tetr(Math.round(height))
      break
    }
    // 201~250 层：10↑↑↑(20^(health^(难度-1.3)))
    case 'pent':
      hp = d(10).pent(d(20).pow(d(base).pow(diff - 1.3)))
      break
    // 251 层以上：health × 难度 的 n 箭号运算
    default:
      hp = new D(MN.arrow(Math.max(2, base * (diff - 0.7)), band.arrows ?? 6, 10))
      break
  }
  if (boss) hp = hp.mul(10)
  return hp
}

const monsterLevelCache = new Map<number, number>()

/** 二分反解出「hardy(L) 最接近目标血量」的整数等级 L */
function solveMonsterLevel(target: D): number {
  const targetLog = target.log10()
  let hi = 1
  while (hi < 1e9 && hardy(hi).lt(target)) hi *= 2
  let lo = Math.max(1, Math.floor(hi / 2))
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (hardy(mid).lt(target)) lo = mid + 1
    else hi = mid
  }
  if (lo > 1) {
    const cur = hardy(lo).log10().sub(targetLog).abs()
    const prev = hardy(lo - 1).log10().sub(targetLog).abs()
    if (prev.lt(cur)) return lo - 1
  }
  return Math.max(1, lo)
}

/** 怪物等级：由楼层难度反解得到，血量恒等于 hardy(等级) */
export function monsterLevel(floor: number, boss: boolean): number {
  const key = floor * 2 + (boss ? 1 : 0)
  const cached = monsterLevelCache.get(key)
  if (cached !== undefined) return cached
  let lv = solveMonsterLevel(monsterHpTarget(floor, boss))
  // hardy 在部分区间并非严格单调，这里保证等级随楼层单调不减
  const prev = monsterLevelCache.get(key - 2)
  if (prev !== undefined && lv < prev) lv = prev
  monsterLevelCache.set(key, lv)
  return lv
}

/** 怪物血量 = MetaNum.hardy(怪物等级)，数值对齐参考游戏 */
export function monsterMaxHp(floor: number, _tier: number, boss: boolean): D {
  return hardy(monsterLevel(floor, boss))
}

/**
 * 怪物伤害（与参考游戏一致）：
 * 1~50 层 damage × 1.3^(难度-1)；51~100 层 damage × 1.2^(难度×3-1)；
 * 100 层以上直接以自身血量造成伤害（参考游戏同款「一击必杀」设计）。
 */
export function monsterDamage(floor: number, tier: number, boss: boolean): D {
  const band = MONSTER_BANDS[bandIndexOf(floor)]
  const base = band.damage[floor % band.damage.length]
  const diff = difficultyOf(floor)
  let dmg: D
  if (floor <= 50) dmg = d(base).mul(d(1.3).pow(diff - 1))
  else if (floor <= 100) dmg = d(base).mul(d(1.2).pow(diff * 3 - 1))
  else dmg = monsterMaxHp(floor, tier, boss)
  if (boss) dmg = dmg.mul(3)
  return dmg
}

/**
 * 击杀经验（与参考游戏同构）：
 * ≤100 层 (血量/10)^1.3；101~150 层 log₁₀(血量)^0.4；更深层为血量的迭代幂
 */
export function monsterXp(floor: number, _tier: number, boss: boolean): D {
  const hp = monsterMaxHp(floor, _tier, boss)
  let xp: D
  if (floor <= 100) {
    xp = hp.div(10).pow(1.3)
  } else if (floor <= 150) {
    xp = hp.log10().pow(0.4)
  } else {
    const diff = difficultyOf(floor)
    xp = hp.tetr(difficultyTetrCount(diff))
  }
  if (has('comb_tier6xp1') && _tier >= 6) xp = xp.mul(2)
  if (has('blood_tier7xp1') && _tier >= 7) xp = xp.mul(2)
  if (boss) xp = xp.mul(20)
  return xp
}

/** 参考游戏中 ≥151 层的经验会按难度被迭代幂放大（6 / 25 / 100 / 500 档） */
function difficultyTetrCount(diff: number): D {
  const bars = D.from(state.res.cocoaBar)
  const count = bars.gte(15) ? 500 : bars.gte(13) ? 100 : bars.gte(11) ? 25 : 6
  return d(count).mul(diff / 2 + 0.5)
}

/* ------------------------------------------------------------------ *
 * 等级（与参考游戏一致：累计经验 = 20 × (等级-1)²）
 * ------------------------------------------------------------------ */

/** 升到 level 级所需的累计经验 */
export function totalXpForLevel(level: D): D {
  return level.sub(1).pow(2).mul(20)
}

/** 由累计经验反解等级（闭式解，避免天文数字下的循环升级） */
export function levelFromTotalXp(totalXp: D): D {
  if (totalXp.lte(0)) return d(1)
  return totalXp.div(20).sqrt().add(1).floor().max(1)
}

/** 当前等级升到下一级还需要的经验 */
export function xpToNext(level: D): D {
  return d(20).mul(level.mul(2).sub(1))
}

/** 楼层难度（黄金升级用） */
export function floorDifficulty(): D {
  return d(1).add(state.floor / 50)
}
