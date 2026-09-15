import { d } from './num'
import { has } from './state'
import type { CurrencyId, GameState, PrestigeDef, UpgradeDef } from './types'

export const CURRENCY_NAMES: Record<CurrencyId, string> = {
  honey: '蜂蜜',
  vanilla: '香草蜂蜜',
  cocoa: '可可蜂蜜',
  cocoaBar: '可可棒',
  plasm: '蜂浆',
  hyper: '超浆',
  darkBar: '暗棒',
  starBar: '星棒',
  blood: '魔血',
  bloodGem: '血宝石',
  golden: '黄金蜂蜜',
  darkOrb: '暗球',
}

export const CURRENCY_SHORT: Record<CurrencyId, string> = {
  honey: '蜜',
  vanilla: '香草',
  cocoa: '可可',
  cocoaBar: '棒',
  plasm: '浆',
  hyper: '超',
  darkBar: '暗',
  starBar: '星',
  blood: '血',
  bloodGem: '玉',
  golden: '金',
  darkOrb: '球',
}

/* ------------------------------------------------------------------ *
 * 祭坛（货币：可可蜂蜜）
 * ------------------------------------------------------------------ */
export const ALTAR_UPGRADES: UpgradeDef[] = [
  {
    id: 'altar_keepxp',
    name: '记忆残留',
    desc: '转生时保留 5,000 点经验值',
    currency: 'cocoa',
    cost: d(2),
  },
  {
    id: 'altar_keepflee',
    name: '轻盈之靴',
    desc: '逃跑不再损失经验值',
    currency: 'cocoa',
    cost: d(2),
  },
  {
    id: 'altar_vanilla',
    name: '香草调制',
    desc: '香草蜂蜜使可可蜂蜜获取翻倍',
    currency: 'cocoa',
    cost: d(4),
  },
  {
    id: 'altar_xp',
    name: '苦修',
    desc: '经验值获取 ×1.5',
    currency: 'cocoa',
    cost: d(50),
  },
  {
    id: 'altar_energy',
    name: '充沛精力',
    desc: '能量上限 +100',
    currency: 'cocoa',
    cost: d(150),
  },
  {
    id: 'altar_hp',
    name: '强健体魄',
    desc: '生命回复速度 ×3',
    currency: 'cocoa',
    cost: d(250),
  },
  {
    id: 'altar_slowfirst',
    name: '慢半拍',
    desc: '敌人的首次攻击需要 4.5 秒',
    currency: 'cocoa',
    cost: d(35),
  },
  {
    id: 'altar_teleport',
    name: '捷径',
    desc: '解锁 149 层及更高的传送按钮',
    currency: 'cocoa',
    cost: d(100),
  },
  {
    id: 'altar_keepitems',
    name: '背包',
    desc: '转生时保留一次性物品（符文、蜂蜜）',
    currency: 'cocoa',
    cost: d(500),
  },
  {
    id: 'altar_shadowring',
    name: '暗影戒指',
    desc: '把幸运戒指锻造成暗影戒指：全局 ×2，生命/能量上限提升',
    currency: 'cocoa',
    cost: d(2000),
  },
]

/* ------------------------------------------------------------------ *
 * 蜂浆商店（货币：蜂浆）
 * ------------------------------------------------------------------ */
export const PLASM_UPGRADES: UpgradeDef[] = [
  {
    id: 'plasm_nocap',
    name: '移除经验软上限',
    desc: '单次击杀获得的经验不再被限制',
    currency: 'plasm',
    cost: d(2),
  },
  {
    id: 'plasm_cocoa2',
    name: '双倍可可',
    desc: '可可蜂蜜获取 ×2',
    currency: 'plasm',
    cost: d(2),
  },
  {
    id: 'plasm_tp149',
    name: '149 层传送',
    desc: '解锁直达 149 层的按钮',
    currency: 'plasm',
    cost: d(3),
  },
  {
    id: 'plasm_vanillaplasm',
    name: '香草蜂浆',
    desc: '香草蜂蜜使蜂浆获取倍增',
    currency: 'plasm',
    cost: d(5),
  },
  {
    id: 'plasm_honeydrop',
    name: '高层蜂蜜',
    desc: '100 层以上的敌人会掉落蜂蜜',
    currency: 'plasm',
    cost: d(25),
  },
  {
    id: 'plasm_cocoa2b',
    name: '再双倍可可',
    desc: '可可蜂蜜获取再次 ×2',
    currency: 'plasm',
    cost: d(30),
  },
  {
    id: 'plasm_keepcocoa',
    name: '保留可可蜂蜜',
    desc: '蜂浆转生时保留可可蜂蜜',
    currency: 'plasm',
    cost: d(35),
  },
  {
    id: 'plasm_keepvanilla',
    name: '保留香草蜂蜜',
    desc: '转生时保留香草蜂蜜',
    currency: 'plasm',
    cost: d(60),
  },
  {
    id: 'plasm_hpkil',
    name: '嗜血',
    desc: '击杀敌人时生命值回满',
    currency: 'plasm',
    cost: d(75),
  },
  {
    id: 'plasm_shark',
    name: '鲨鱼蓝宝石',
    desc: '全局 ×5，生命回复 ×3，能量上限 +100',
    currency: 'plasm',
    cost: d(150),
  },
]

/* ------------------------------------------------------------------ *
 * 合成器（货币：超浆 / 星棒）
 * ------------------------------------------------------------------ */
export const COMBINATOR_UPGRADES: UpgradeDef[] = [
  {
    id: 'comb_hyper',
    name: '超浆配方',
    desc: '解锁「10 蜂浆 → 1 超浆」的合成',
    currency: 'plasm',
    cost: d(5),
  },
  {
    id: 'comb_tier5',
    name: '五阶掠夺者',
    desc: '5 阶敌人掉落大量蜂蜜与蜂浆',
    currency: 'hyper',
    cost: d(1),
    requires: () => has('comb_hyper'),
  },
  {
    id: 'comb_tp248',
    name: '248 层传送',
    desc: '解锁直达 248 层的按钮',
    currency: 'hyper',
    cost: d(3),
    requires: () => has('comb_hyper'),
  },
  {
    id: 'comb_darkbar',
    name: '暗棒配方',
    desc: '解锁「4 超浆 → 1 暗棒」的合成',
    currency: 'hyper',
    cost: d(4),
    requires: () => has('comb_hyper'),
  },
  {
    id: 'comb_starbar',
    name: '星棒配方',
    desc: '解锁「20 暗棒 → 1 星棒」的合成（受精炼工艺影响）',
    currency: 'hyper',
    cost: d(100),
    requires: () => has('comb_darkbar'),
  },
  {
    id: 'comb_hypergain',
    name: '贪婪萃取',
    desc: '超浆获取 ×50，蜂浆获取 ×25，可可获取 ×50',
    currency: 'starBar',
    cost: d(1),
    requires: () => has('comb_starbar'),
  },
  {
    id: 'comb_starboost',
    name: '星光加持',
    desc: '星棒提升全局倍率与可可蜂蜜获取',
    currency: 'hyper',
    cost: d(6000),
    requires: () => has('comb_starbar'),
  },
  {
    id: 'comb_starcost',
    name: '精炼工艺',
    desc: '合成星棒所需的暗棒 -3',
    currency: 'hyper',
    cost: d(9000),
    requires: () => has('comb_starbar'),
  },
  {
    id: 'comb_tier5hyper',
    name: '五阶超浆',
    desc: '5 阶敌人有概率掉落超浆',
    currency: 'hyper',
    cost: d(13000),
    requires: () => has('comb_tier5'),
  },
  {
    id: 'comb_tp299',
    name: '299 层传送',
    desc: '解锁直达 299 层的按钮',
    currency: 'hyper',
    cost: d(1e6),
    requires: () => has('comb_tp248'),
  },
  {
    id: 'comb_tier6xp1',
    name: '六阶经验 (1/3)',
    desc: '6 阶敌人经验 ×2，全局经验 ×3',
    currency: 'hyper',
    cost: d(1e10),
    requires: () => has('comb_tier5hyper'),
  },
  {
    id: 'comb_tier6xp2',
    name: '六阶经验 (2/3)',
    desc: '全局经验 ×3',
    currency: 'hyper',
    cost: d(1e30),
    requires: () => has('comb_tier6xp1'),
  },
  {
    id: 'comb_tier6xp3',
    name: '六阶经验 (3/3)',
    desc: '全局经验 ×3',
    currency: 'hyper',
    cost: d(1e60),
    requires: () => has('comb_tier6xp2'),
  },
  {
    id: 'comb_hypergem',
    name: '锻造超宝石',
    desc: '全局倍率 ×10，能量回复 ×2',
    currency: 'hyper',
    cost: d(1e100),
    requires: () => has('comb_tier6xp3'),
  },
]

/* ------------------------------------------------------------------ *
 * 魔血（货币：可可蜂蜜 / 血宝石）
 * ------------------------------------------------------------------ */
export const BLOOD_UPGRADES: UpgradeDef[] = [
  {
    id: 'blood_double',
    name: '双倍产血',
    desc: '全部魔血产量 ×2',
    currency: 'cocoa',
    cost: d(1e25),
  },
  {
    id: 'blood_triple',
    name: '三倍产血',
    desc: '全部魔血产量 ×3',
    currency: 'cocoa',
    cost: d(1e40),
  },
  {
    id: 'blood_darkorb',
    name: '暗球共鸣',
    desc: '每颗暗球使产血 ×5',
    currency: 'cocoa',
    cost: d(1e50),
  },
  {
    id: 'blood_free5',
    name: '免费劳动力',
    desc: '立刻获得 100 个五阶生产者',
    currency: 'cocoa',
    cost: d(1e60),
    onBuy: (s) => {
      s.producers[4] = s.producers[4].add(100)
    },
  },
  {
    id: 'blood_ten',
    name: '十倍产血',
    desc: '全部魔血产量 ×10',
    currency: 'cocoa',
    cost: d(1e75),
  },
  {
    id: 'blood_square',
    name: '产量平方',
    desc: '魔血产量被平方',
    currency: 'cocoa',
    cost: d(1e90),
  },
  {
    id: 'blood_square2',
    name: '再平方',
    desc: '魔血产量再次被平方',
    currency: 'cocoa',
    cost: d(1e120),
    requires: () => has('blood_square'),
  },
  {
    id: 'blood_tetrate',
    name: '迭代产能',
    desc: '魔血产量被自身对数迭代放大',
    currency: 'cocoa',
    cost: d(1e150),
    requires: () => has('blood_square2'),
  },
  {
    id: 'blood_tier7xp1',
    name: '七阶经验 (1/3)',
    desc: '7 阶敌人经验 ×2，全局经验 ×5',
    currency: 'bloodGem',
    cost: d(50),
  },
  {
    id: 'blood_tier7xp2',
    name: '七阶经验 (2/3)',
    desc: '全局经验 ×5',
    currency: 'bloodGem',
    cost: d(200),
    requires: () => has('blood_tier7xp1'),
  },
  {
    id: 'blood_tier7xp3',
    name: '七阶经验 (3/3)',
    desc: '全局经验 ×5',
    currency: 'bloodGem',
    cost: d(500),
    requires: () => has('blood_tier7xp2'),
  },
  {
    id: 'blood_gun',
    name: '再来一把枪',
    desc: '攻击力 ×2，攻击速度 +30%（枪永远不嫌多）',
    currency: 'bloodGem',
    cost: d(1711),
  },
  {
    id: 'blood_supergem',
    name: '锻造超级血宝石',
    desc: '全局 ×8，生命回复 ×5，且血量低于 25% 时敌人伤害减半',
    currency: 'bloodGem',
    cost: d(561),
  },
]

/* ------------------------------------------------------------------ *
 * 黄金（货币：可可蜂蜜 / 黄金蜂蜜）
 * ------------------------------------------------------------------ */
export const GOLDEN_UPGRADES: UpgradeDef[] = [
  {
    id: 'golden_tp351',
    name: '351 层传送',
    desc: '解锁直达 351 层的按钮',
    currency: 'cocoa',
    cost: d(1e20),
  },
  {
    id: 'golden_double1',
    name: '双倍黄金 (1/3)',
    desc: '黄金蜂蜜与可可蜂蜜获取 ×2',
    currency: 'cocoa',
    cost: d(1e25),
  },
  {
    id: 'golden_double2',
    name: '双倍黄金 (2/3)',
    desc: '黄金蜂蜜与可可蜂蜜获取 ×2',
    currency: 'cocoa',
    cost: d(1e35),
  },
  {
    id: 'golden_double3',
    name: '双倍黄金 (3/3)',
    desc: '黄金蜂蜜与可可蜂蜜获取 ×2',
    currency: 'cocoa',
    cost: d(1e50),
  },
  {
    id: 'golden_tier8',
    name: '八阶黄金',
    desc: '8 阶敌人必定掉落黄金蜂蜜',
    currency: 'cocoa',
    cost: d(1e60),
  },
  {
    id: 'golden_logmult',
    name: '对数增长',
    desc: 'log₁₀(黄金蜂蜜) 倍增黄金蜂蜜获取',
    currency: 'golden',
    cost: d(500),
  },
  {
    id: 'golden_bloodgem',
    name: '血玉共鸣',
    desc: '血宝石倍增黄金蜂蜜获取',
    currency: 'golden',
    cost: d(1500),
  },
  {
    id: 'golden_floormult',
    name: '楼层压迫',
    desc: '楼层难度倍增全局倍率',
    currency: 'golden',
    cost: d(5000),
  },
  {
    id: 'golden_guns',
    name: '双持巨枪',
    desc: '召唤你那该死的巨枪：全局 ×25,000，攻击速度 +40%',
    currency: 'golden',
    cost: d(25000),
  },
]

/* ------------------------------------------------------------------ *
 * 转生
 * ------------------------------------------------------------------ */
export const PRESTIGES: PrestigeDef[] = [
  {
    id: 'altar',
    name: '祭坛',
    button: '献祭等级',
    desc: '重置角色等级、经验、楼层与蜂蜜，换取可可蜂蜜。可可蜂蜜会永久提升经验获取。',
    currency: 'cocoa',
    can: (s) => s.level.gte(500),
    reqText: (s) => `需要等级 500（当前 ${s.level.formatWhole()}）`,
    gain: (s) => s.level.pow(2).div(1000).mul(1),
  },
  {
    id: 'plasm',
    name: '蜂浆转生',
    button: '萃取蜂浆',
    desc: '消耗全部可可蜂蜜换取蜂浆（保留祭坛升级与可可棒）。蜂浆大幅提升可可蜂蜜获取。',
    currency: 'plasm',
    can: (s) => s.res.cocoa.gte(1e10),
    reqText: (s) => `需要 10,000,000,000 可可蜂蜜（当前 ${s.res.cocoa.format()}）`,
    gain: (s) => s.res.cocoa.div(1e10).pow(0.5),
  },
  {
    id: 'orb',
    name: '暗球',
    button: '抹除一切',
    desc: '抹除全部进度以换取一颗暗球（只保留暗球数量与血宝石）。每颗暗球提供 ×10 全局倍率。',
    currency: 'darkOrb',
    can: (s) => s.res.cocoa.gte(1e100) && s.maxFloor >= 500,
    reqText: (s: GameState) =>
      `需要 1.000e100 可可蜂蜜与 500 层记录（当前 ${s.res.cocoa.format()} / ${s.maxFloor} 层）`,
    gain: () => d(1),
  },
]
