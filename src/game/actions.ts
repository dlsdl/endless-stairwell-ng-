import { D, d, formatTime } from './num'
import {
  addRes,
  canAfford,
  createInitialState,
  has,
  pay,
  pushLog,
  replaceState,
  state,
} from './state'
import * as M from './multipliers'
import { CURRENCY_NAMES, PRESTIGES } from './content'
import type { CurrencyId, MonsterState, RuneColor, UpgradeDef } from './types'

/* ------------------------------------------------------------------ *
 * 通用
 * ------------------------------------------------------------------ */
export function costOf(def: UpgradeDef): D {
  return typeof def.cost === 'function' ? def.cost(state) : def.cost
}

export function isBought(def: UpgradeDef): boolean {
  return has(def.id)
}

export function isVisible(def: UpgradeDef): boolean {
  return !def.requires || def.requires(state)
}

export function canBuy(def: UpgradeDef): boolean {
  if (isBought(def)) return false
  if (!isVisible(def)) return false
  return canAfford(def.currency, costOf(def))
}

export function buyUpgrade(def: UpgradeDef): void {
  if (!canBuy(def)) return
  if (!pay(def.currency, costOf(def))) return
  state.upgrades[def.id] = true
  def.onBuy?.(state)
  pushLog(`购买了升级：${def.name}`)
}

/* ------------------------------------------------------------------ *
 * 楼层与房间
 * ------------------------------------------------------------------ */
export const MONSTER_NAMES: Record<number, string[]> = {
  1: ['大蜘蛛', '鼠群', '醉酒流浪汉', '扑灯的飞蛾', '锈蚀的自动贩卖机'],
  2: ['骷髅兵', '食尸鬼', '低语幽灵', '台阶蠕虫', '无面侍者'],
  3: ['石像鬼', '铁处女', '镜中倒影', '蜡像馆管理员', '长臂清洁工'],
  4: ['深渊触手', '蜂巢守卫', '蜜蜡巨像', '六眼拾荒者', '沥青潜行者'],
  5: ['宝石鳗幼体', '等离子水母', '棱镜猎犬', '超新星飞蛾', '蜂浆元素'],
  6: ['虚空阶梯管理员', '超浆吞噬者', '逆流时钟', '不可名状之手', '坍缩信徒'],
  7: ['血肉建筑师', '猩红唱诗班', '骨髓编舞者', '猩红十字镐', '红色回廊管理员'],
  8: ['黄金鳗', '不朽的看门人', '恒星阶梯', '白金主教', '∞ 号住户'],
}

export interface TeleportDef {
  floor: number
  requires: () => boolean
}

export const TELEPORTS: TeleportDef[] = [
  { floor: 49, requires: () => true },
  { floor: 99, requires: () => true },
  { floor: 149, requires: () => has('altar_teleport') && has('plasm_tp149') },
  { floor: 248, requires: () => has('altar_teleport') && has('comb_tp248') },
  { floor: 299, requires: () => has('altar_teleport') && has('comb_tp299') },
  { floor: 351, requires: () => has('altar_teleport') && has('golden_tp351') },
]

export function makeMonster(floor: number, boss = false): MonsterState {
  const tier = M.tierOf(floor)
  const names = MONSTER_NAMES[tier] ?? MONSTER_NAMES[8]
  const name = boss
    ? tier >= 5
      ? '宝石鳗'
      : '楼层守卫'
    : names[Math.floor(Math.random() * names.length)]
  const maxHp = M.monsterMaxHp(floor, tier, boss)
  const dmg = M.monsterDamage(floor, tier, boss)
  const interval = 3
  return {
    name,
    level: M.monsterLevel(floor),
    tier,
    floor,
    hp: maxHp,
    maxHp,
    dmg,
    interval,
    timer: has('altar_slowfirst') ? 4.5 : interval,
    boss,
    firstDone: false,
  }
}

export function goUp(): void {
  if (state.inRoom) return
  setFloor(state.floor + 1)
}

export function goDown(): void {
  if (state.inRoom || state.floor <= 0) return
  setFloor(state.floor - 1)
}

export function setFloor(floor: number): void {
  const next = Math.max(0, Math.floor(floor))
  state.floor = next
  if (next > state.maxFloor) state.maxFloor = next
  state.roomMessage =
    next === 0
      ? '你回到了地面层。门外的世界依然遥不可及。'
      : `你站在第 ${next} 层。${next >= 500 ? '空气开始泛着金色的光。' : '走廊尽头的门半掩着。'}`
}

export function toGround(): void {
  if (state.inRoom) return
  setFloor(0)
}

export function teleport(floor: number): void {
  if (state.inRoom) return
  setFloor(floor)
}

/** 进入当前楼层的房间 */
export function enterRoom(): void {
  if (state.inRoom) return
  if (D.from(state.energy).lt(M.ENTER_ROOM_COST)) {
    pushLog('能量不足，无法推开门。')
    return
  }
  state.energy = D.from(state.energy).sub(M.ENTER_ROOM_COST)
  state.stats.bestFloor = Math.max(state.stats.bestFloor, state.floor)
  generateRoom()
}

/** 在同一层再探索一个新房间 */
export function anotherRoom(): void {
  if (!state.inRoom) return
  if (D.from(state.energy).lt(M.ENTER_ROOM_COST)) {
    pushLog('能量不足，无法推开门。')
    return
  }
  state.energy = D.from(state.energy).sub(M.ENTER_ROOM_COST)
  generateRoom()
}

export function returnToStairwell(): void {
  state.inRoom = false
  state.roomKind = 'none'
  state.monster = null
}

function generateRoom(): void {
  state.inRoom = true
  if (state.floor === 0) {
    state.roomKind = 'none'
    state.monster = null
    state.roomMessage = '地面层的大厅空无一人，只有一盏闪烁的应急灯。'
    return
  }
  const isBossFloor = state.floor % 25 === 0 && state.floor >= 125
  if (isBossFloor) {
    state.roomKind = 'monster'
    state.monster = makeMonster(state.floor, true)
    state.roomMessage = `门后传来沉重的呼吸声——Lv.${state.monster.level} 的${state.monster.name}挡住了去路！`
    return
  }
  const roll = Math.random()
  if (roll < 0.7) {
    state.roomKind = 'monster'
    const m = makeMonster(state.floor)
    state.monster = m
    state.roomMessage = `Lv.${m.level} 的${m.name}从阴影中爬了出来。`
  } else if (roll < 0.85) {
    state.roomKind = 'chest'
    state.monster = null
    openChest()
  } else {
    state.roomKind = 'shrine'
    state.monster = null
    state.stats.shrines = D.from(state.stats.shrines).add(1)
    state.hp = M.playerMaxHp()
    state.energy = M.maxEnergy()
    state.roomMessage = '一间供奉着蜂蜜罐的小神龛。你的生命与能量都被填满了。'
    pushLog('你在神龛中恢复了状态。')
  }
}

function openChest(): void {
  state.stats.chests = D.from(state.stats.chests).add(1)
  const floor = state.floor
  const honey = d(1).add(Math.floor(floor / 20)).mul(M.itemFind().pow(0.5))
  addRes('honey', honey)
  let msg = `你打开了一个落灰的箱子，获得 ${honey.format()} 蜂蜜`
  if (floor >= 50 && Math.random() < 0.5) {
    addRes('vanilla', 1)
    msg += '、1 香草蜂蜜'
  }
  if (floor >= 100) {
    const blood = d(10).pow(Math.max(1, M.tierOf(floor) - 3)).mul(M.bloodGainMult())
    addRes('blood', blood)
    msg += `、${blood.format()} 魔血`
  }
  state.roomMessage = msg + '。'
  pushLog(`宝箱：${msg}`)
}

/* ------------------------------------------------------------------ *
 * 战斗
 * ------------------------------------------------------------------ */
export function attack(): void {
  const m = state.monster
  if (!m || !state.inRoom) return
  if (state.attackCooldown > 0) return
  if (D.from(state.energy).lt(M.ATTACK_COST)) return
  state.energy = D.from(state.energy).sub(M.ATTACK_COST)
  state.attackCooldown = M.attackCooldown()
  const dmg = M.playerDamage()
  m.hp = D.from(m.hp).sub(dmg)
  if (D.from(m.hp).lte(0)) {
    killMonster()
  }
}

export function flee(): void {
  if (!state.inRoom) return
  if (D.from(state.energy).lt(M.FLEE_COST)) {
    pushLog('能量不足，你逃不掉！')
    return
  }
  state.energy = D.from(state.energy).sub(M.FLEE_COST)
  if (!has('altar_keepflee')) {
    const lost = loseXp(0.05)
    pushLog(`你仓皇逃出房间，损失了 ${lost.format()} 点经验。`)
  } else {
    pushLog('你轻巧地退出房间，毫发无损。')
  }
  returnToStairwell()
}

function killMonster(): void {
  const m = state.monster
  if (!m) return
  const floor = m.floor
  const tier = m.tier
  state.kills = D.from(state.kills).add(1)

  let xp = M.monsterXp(floor, tier, m.boss).mul(M.xpMult())
  if (!has('plasm_nocap')) {
    // 参考游戏同样存在经验软上限（可在蜂浆商店购买「移除经验软上限」解除）
    const cap = M.xpToNext(D.from(state.level)).mul(100)
    if (xp.gt(cap)) xp = cap
  }
  addXp(xp)

  const drops = rollDrops(floor, tier, m.boss)
  if (drops.length > 0) {
    pushLog(`击败 Lv.${m.level} ${m.name}：${drops.join('、')}`)
  } else {
    pushLog(`击败 Lv.${m.level} ${m.name}，获得 ${xp.format()} 经验。`)
  }

  if (m.boss && tier >= 5) {
    state.stats.gemEels = D.from(state.stats.gemEels).add(1)
    addRes('bloodGem', 1)
    pushLog('宝石鳗化作一枚血宝石。')
  }
  if (has('plasm_hpkil')) state.hp = M.playerMaxHp()

  state.monster = null
  state.roomKind = 'none'
  state.roomMessage = '房间被清空了，地上只剩下几滴蜂蜜。'
  if (state.settings.autoFloor && D.from(state.energy).gte(M.ENTER_ROOM_COST)) {
    state.energy = D.from(state.energy).sub(M.ENTER_ROOM_COST)
    generateRoom()
  }
}

function rollDrops(floor: number, tier: number, boss: boolean): string[] {
  const out: string[] = []
  const findBonus = Math.min(4, M.itemFind().toNumber())

  // 蜂蜜
  let honeyChance = 0.08
  if (floor >= 100 && has('plasm_honeydrop')) honeyChance = 0.25
  if (Math.random() < Math.min(0.95, honeyChance * findBonus)) {
    const amount = d(1).add(Math.floor(floor / 25)).mul(M.globalMult().pow(0.2))
    addRes('honey', amount)
    out.push(`${amount.format()} 蜂蜜`)
  }
  // 香草蜂蜜
  if (floor >= 50 && Math.random() < Math.min(0.6, 0.03 * findBonus)) {
    addRes('vanilla', 1)
    out.push('1 香草蜂蜜')
  }
  // 魔血
  if (floor >= 100 && Math.random() < Math.min(0.9, 0.1 * findBonus)) {
    const amount = d(10).pow(Math.max(1, tier - 3)).mul(M.bloodGainMult())
    addRes('blood', amount)
    out.push(`${amount.format()} 魔血`)
  }
  // 蜂浆
  if (tier >= 5 && has('comb_tier5') && Math.random() < 0.25) {
    const amount = d(10).mul(M.plasmGainMult())
    addRes('plasm', amount)
    out.push(`${amount.format()} 蜂浆`)
  }
  // 超浆
  if (tier >= 5 && has('comb_tier5hyper') && Math.random() < 0.05) {
    const amount = d(1).mul(M.hyperGainMult())
    addRes('hyper', amount)
    out.push(`${amount.format()} 超浆`)
  }
  // 黄金蜂蜜
  if (tier >= 8 && (has('golden_tier8') || Math.random() < 0.05 || boss)) {
    const amount = d(1).mul(M.goldenGainMult())
    addRes('golden', amount)
    out.push(`${amount.format()} 黄金蜂蜜`)
  }
  return out
}

/**
 * 累计经验驱动等级（与参考游戏一致：等级 = ⌊√(总经验/20)⌋+1），
 * 用闭式解而不是循环，避免天文数字时卡死。
 */
function syncLevel(): void {
  const total = D.max(D.from(state.totalXp), 0)
  const lv = M.levelFromTotalXp(total)
  state.level = lv
  state.xp = D.max(total.sub(M.totalXpForLevel(lv)), 0)
  if (lv.gt(D.from(state.stats.bestLevel))) state.stats.bestLevel = lv
}

export function addXp(amount: D): void {
  state.totalXp = D.from(state.totalXp).add(amount)
  syncLevel()
}

/** 损失一定比例的累计经验（死亡 / 逃跑） */
function loseXp(percent: number): D {
  const lost = D.from(state.totalXp).mul(percent)
  state.totalXp = D.max(D.from(state.totalXp).sub(lost), 0)
  syncLevel()
  return lost
}

function die(): void {
  state.deaths = D.from(state.deaths).add(1)
  const lost = loseXp(0.1)
  state.hp = M.playerMaxHp()
  pushLog(`你死了！损失了 ${lost.format()} 点经验。`)
  returnToStairwell()
}

/* ------------------------------------------------------------------ *
 * 主循环
 * ------------------------------------------------------------------ */
export function tick(dt: number): void {
  state.playTime += dt

  const colors: RuneColor[] = ['red', 'green', 'blue']
  for (const c of colors) {
    if (state.buffTime[c] > 0) state.buffTime[c] = Math.max(0, state.buffTime[c] - dt)
  }

  const maxE = M.maxEnergy()
  if (D.from(state.energy).lt(maxE)) {
    state.energy = D.min(maxE, D.from(state.energy).add(M.energyRegen().mul(dt)))
  }
  if (D.from(state.energy).gt(maxE)) state.energy = maxE

  const maxHp = M.playerMaxHp()
  // 生命只在没有敌人的时候回复；进入战斗后不再自然回血
  if (!state.monster && D.from(state.hp).lt(maxHp)) {
    state.hp = D.min(maxHp, D.from(state.hp).add(M.hpRegen().mul(dt)))
  }
  if (D.from(state.hp).gt(maxHp)) state.hp = maxHp

  if (state.attackCooldown > 0) state.attackCooldown = Math.max(0, state.attackCooldown - dt)

  const bps = M.bloodPerSecond()
  if (bps.gt(0)) addRes('blood', bps.mul(dt))

  const m = state.monster
  if (m && state.inRoom) {
    m.timer -= dt
    if (m.timer <= 0) {
      m.timer = m.interval
      m.firstDone = true
      let dmg = D.from(m.dmg)
      if (has('blood_supergem') && D.from(state.hp).lt(maxHp.mul(0.25))) dmg = dmg.div(2)
      state.hp = D.from(state.hp).sub(dmg)
      if (D.from(state.hp).lte(0)) die()
    }
  }

  if (state.settings.autoAttack && state.monster && state.inRoom && state.attackCooldown <= 0) {
    if (D.from(state.energy).gte(M.ATTACK_COST)) attack()
  }
}

/* ------------------------------------------------------------------ *
 * 消耗品与符文
 * ------------------------------------------------------------------ */
export function eatHoney(): void {
  if (D.from(state.res.honey).lt(1)) return
  state.res.honey = D.from(state.res.honey).sub(1)
  state.stats.honeyEaten = D.from(state.stats.honeyEaten).add(1)
  const gain = M.xpToNext(D.from(state.level)).mul(0.2)
  addXp(gain)
  pushLog(`你吞下一勺蜂蜜，获得 ${gain.format()} 点经验。`)
}

export function eatVanilla(): void {
  if (D.from(state.res.vanilla).lt(1)) return
  state.res.vanilla = D.from(state.res.vanilla).sub(1)
  state.hp = M.playerMaxHp()
  state.energy = M.maxEnergy()
  pushLog('香草蜂蜜滑入喉咙，生命与能量都被填满。')
}

const TEMP_RUNE_COST: Record<RuneColor, { honey: number; vanilla: number }> = {
  red: { honey: 3, vanilla: 1 },
  green: { honey: 3, vanilla: 1 },
  blue: { honey: 3, vanilla: 1 },
}

export const PERM_RUNE_MAX: Record<RuneColor, number> = { red: 10, green: 5, blue: 5 }

export const RUNE_NAMES: Record<RuneColor, string> = {
  red: '红色符文',
  green: '绿色符文',
  blue: '蓝色符文',
}

export function permRuneCost(color: RuneColor): { honey: D; vanilla: D } {
  const lv = state.permRunes[color]
  const scale = d(1.6).pow(lv)
  return { honey: d(5).mul(scale), vanilla: d(2).mul(scale) }
}

export function forgeRune(color: RuneColor): void {
  const cost = TEMP_RUNE_COST[color]
  if (D.from(state.res.honey).lt(cost.honey) || D.from(state.res.vanilla).lt(cost.vanilla)) return
  state.res.honey = D.from(state.res.honey).sub(cost.honey)
  state.res.vanilla = D.from(state.res.vanilla).sub(cost.vanilla)
  state.runes[color] = D.from(state.runes[color]).add(1)
  pushLog(`铁匠为你打造了一枚${RUNE_NAMES[color]}。`)
}

export function useRune(color: RuneColor): void {
  if (D.from(state.runes[color]).lt(1)) return
  state.runes[color] = D.from(state.runes[color]).sub(1)
  state.buffTime[color] = 60
  pushLog(`你捏碎了${RUNE_NAMES[color]}，力量涌上来了。`)
}

export function upgradePermRune(color: RuneColor): void {
  if (state.permRunes[color] >= PERM_RUNE_MAX[color]) return
  const cost = permRuneCost(color)
  if (!canAfford('honey', cost.honey) || !canAfford('vanilla', cost.vanilla)) return
  pay('honey', cost.honey)
  pay('vanilla', cost.vanilla)
  state.permRunes[color] += 1
  pushLog(`永久符文 ${RUNE_NAMES[color]} 提升到 ${state.permRunes[color]} 级。`)
}

/* ------------------------------------------------------------------ *
 * 魔血生产者
 * ------------------------------------------------------------------ */
export function buyProducer(index: number): void {
  const cost = M.producerCost(index)
  if (!pay('blood', cost)) return
  state.producers[index] = D.from(state.producers[index]).add(1)
}

/* ------------------------------------------------------------------ *
 * 合成器
 * ------------------------------------------------------------------ */
export interface RecipeDef {
  id: string
  from: CurrencyId
  to: CurrencyId
  rate: D
  unlocked: () => boolean
}

export const RECIPES: RecipeDef[] = [
  { id: 'bar', from: 'cocoa', to: 'cocoaBar', rate: d(1e10), unlocked: () => true },
  { id: 'hyper', from: 'plasm', to: 'hyper', rate: d(10), unlocked: () => has('comb_hyper') },
  { id: 'dark', from: 'hyper', to: 'darkBar', rate: d(4), unlocked: () => has('comb_darkbar') },
  {
    id: 'star',
    from: 'darkBar',
    to: 'starBar',
    rate: d(has('comb_starcost') ? 17 : 20),
    unlocked: () => has('comb_starbar'),
  },
]

export function maxCraft(recipe: RecipeDef): D {
  return D.from(state.res[recipe.from]).div(recipe.rate).floor()
}

export function craft(recipe: RecipeDef, amount: D): void {
  const n = D.min(amount, maxCraft(recipe)).floor()
  if (n.lte(0)) return
  if (!pay(recipe.from, recipe.rate.mul(n))) return
  addRes(recipe.to, n)
  pushLog(`合成了 ${n.format()} ${CURRENCY_NAMES[recipe.to]}。`)
}

/* ------------------------------------------------------------------ *
 * 转生
 * ------------------------------------------------------------------ */
export function doPrestige(id: string): void {
  const def = PRESTIGES.find((p) => p.id === id)
  if (!def || !def.can(state)) return

  if (def.id === 'orb') {
    const orbs = D.from(state.res.darkOrb).add(1)
    const gems = D.from(state.res.bloodGem)
    replaceState(createInitialState())
    state.res.darkOrb = orbs
    state.res.bloodGem = gems
    state.stats.orbs = orbs
    state.stats.bestLevel = d(1)
    pushLog('一切归于虚无，一颗暗球在掌心成形。')
    return
  }

  if (def.id === 'plasm') {
    const gain = def.gain(state).mul(M.plasmGainMult())
    state.stats.plasms = D.from(state.stats.plasms).add(1)
    if (!has('plasm_keepcocoa')) state.res.cocoa = d(0)
    addRes('plasm', gain)
    state.hp = M.playerMaxHp()
    pushLog(`你萃取了 ${gain.format()} 蜂浆。`)
    return
  }

  // 祭坛转生
  const gain = def.gain(state).mul(M.cocoaGainMult())
  state.stats.altars = D.from(state.stats.altars).add(1)
  state.totalXp = has('altar_keepxp') ? d(5000) : d(0)
  syncLevel()
  state.floor = 0
  state.inRoom = false
  state.roomKind = 'none'
  state.monster = null
  if (!has('altar_keepitems')) {
    state.res.honey = d(0)
    state.runes = { red: d(0), green: d(0), blue: d(0) }
    if (!has('plasm_keepvanilla')) state.res.vanilla = d(0)
  }
  state.buffTime = { red: 0, green: 0, blue: 0 }
  state.hp = M.playerMaxHp()
  state.energy = M.maxEnergy()
  addRes('cocoa', gain)
  pushLog(`祭坛吞下了你的等级，吐出 ${gain.format()} 可可蜂蜜。`)
}

export function hardReset(): void {
  replaceState(createInitialState())
  pushLog('存档已被彻底抹除。')
}

/* ------------------------------------------------------------------ *
 * 离线收益
 * ------------------------------------------------------------------ */
export function applyOffline(seconds: number): string | null {
  if (seconds < 60) return null
  const capped = Math.min(seconds, 8 * 3600)
  const blood = M.bloodPerSecond().mul(capped * 0.5)
  if (blood.gt(0)) addRes('blood', blood)
  state.energy = M.maxEnergy()
  const msg = `你离开了 ${formatTime(capped)}，魔血 +${blood.format()}。`
  pushLog(msg)
  return msg
}
