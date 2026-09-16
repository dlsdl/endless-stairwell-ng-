/**
 * 大数封装层：所有游戏数值统一使用 D（内部由 metanum 库承载）。
 * metanum 可表示到 f_ε₀ 级别的超大数，足以支撑本作的全部分层成长曲线。
 */
import { markRaw } from 'vue'
import MN from 'metanum'
import type { MetaNumInstance } from 'metanum'
import { format as metaFormat } from 'metanum/format-metanum.js'

// format-metanum.js 以全局 MetaNum 的方式引用主库，这里先挂上。
;(globalThis as unknown as { MetaNum: typeof MN }).MetaNum = MN

export type MetaNumLike = { sign: number; array: number[][]; layer: number }
export type DValue = D | number | string | MetaNumLike | MetaNumInstance

function isMetaNumLike(value: unknown): value is MetaNumLike {
  return typeof value === 'object' && value !== null && Array.isArray((value as MetaNumLike).array)
}

function unwrap(value: DValue): unknown {
  return value instanceof D ? value.v : value
}

export class D {
  /** 内部 metanum 实例（不参与响应式代理，避免性能损耗） */
  readonly v: ReturnType<typeof MN>

  constructor(value: DValue = 0) {
    // 标记为 raw：放进 reactive 状态时不会被 Vue 递归代理
    markRaw(this)
    this.v = value instanceof D ? value.v : isMetaNumLike(value) ? MN.fromObject(value) : MN(value)
  }

  static from(value: DValue): D {
    return value instanceof D ? value : new D(value)
  }

  static get zero(): D {
    return new D(0)
  }

  static get one(): D {
    return new D(1)
  }

  static max(a: DValue, b: DValue): D {
    const x = D.from(a)
    return x.gte(b) ? x : D.from(b)
  }

  static min(a: DValue, b: DValue): D {
    const x = D.from(a)
    return x.lte(b) ? x : D.from(b)
  }

  /** 10 的 n 次幂 */
  static pow10(n: DValue): D {
    return new D(10).pow(n)
  }

  add(other: DValue): D {
    return new D(this.v.add(unwrap(other)))
  }

  sub(other: DValue): D {
    return new D(this.v.sub(unwrap(other)))
  }

  mul(other: DValue): D {
    return new D(this.v.mul(unwrap(other)))
  }

  div(other: DValue): D {
    return new D(this.v.div(unwrap(other)))
  }

  pow(other: DValue): D {
    return new D(this.v.pow(unwrap(other)))
  }

  root(other: DValue): D {
    return new D(this.v.root(unwrap(other)))
  }

  sqrt(): D {
    return new D(this.v.sqrt())
  }

  log10(): D {
    return new D(this.v.log10())
  }

  ln(): D {
    return new D(this.v.ln())
  }

  log(base: DValue = 10): D {
    return new D(this.v.log(unwrap(base)))
  }

  /** 迭代幂 / 四级运算：this ↑↑ other */
  tetr(other: DValue, payload?: DValue): D {
    return new D(payload === undefined ? this.v.tetr(unwrap(other)) : this.v.tetr(unwrap(other), unwrap(payload)))
  }

  /** 五级运算：this ↑↑↑ other */
  pent(other: DValue): D {
    return new D(this.v.pent(unwrap(other)))
  }

  abs(): D {
    return new D(this.v.abs())
  }

  neg(): D {
    return new D(this.v.neg())
  }

  floor(): D {
    return new D(this.v.floor())
  }

  ceil(): D {
    return new D(this.v.ceil())
  }

  round(): D {
    return new D(this.v.round())
  }

  max(other: DValue): D {
    return new D(this.v.max(unwrap(other)))
  }

  min(other: DValue): D {
    return new D(this.v.min(unwrap(other)))
  }

  cmp(other: DValue): number {
    return this.v.cmp(unwrap(other))
  }

  eq(other: DValue): boolean {
    return this.v.eq(unwrap(other))
  }

  neq(other: DValue): boolean {
    return !this.v.eq(unwrap(other))
  }

  lt(other: DValue): boolean {
    return this.v.lt(unwrap(other))
  }

  lte(other: DValue): boolean {
    return this.v.lte(unwrap(other))
  }

  gt(other: DValue): boolean {
    return this.v.gt(unwrap(other))
  }

  gte(other: DValue): boolean {
    return this.v.gte(unwrap(other))
  }

  isZero(): boolean {
    return this.v.lte(0)
  }

  /** 是否是有效的有限数值 */
  isFinite(): boolean {
    return this.v.isFinite() && !this.v.isNaN()
  }

  /** 转成 JS number（仅用于 UI 进度条等，超大会被截断） */
  toNumber(): number {
    const n = this.v.toNumber()
    return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER
  }

  /** 限制在 [0,1] 之间，用于血条等百分比显示 */
  ratio(): number {
    const n = this.v.toNumber()
    if (!Number.isFinite(n)) return 1
    return Math.max(0, Math.min(1, n))
  }

  /** metanum 字母记数法，例如 1.000E10 / 1.000F6 */
  format(precision = 3): string {
    if (this.v.isNaN()) return 'NaN'
    if (!this.v.isFinite()) return '∞'
    try {
      return metaFormat(this.v, precision)
    } catch {
      return this.v.toString()
    }
  }

  /** 整数风格显示 */
  formatWhole(): string {
    if (this.v.isNaN()) return 'NaN'
    if (!this.v.isFinite()) return '∞'
    try {
      if (this.v.lt(1000)) return this.v.floor().toString()
      return metaFormat(this.v, 0)
    } catch {
      return this.v.toString()
    }
  }

  toString(): string {
    return this.format(3)
  }

  toJSON(): { $d: MetaNumLike | string } {
    try {
      return { $d: this.v.toJSON() as MetaNumLike }
    } catch {
      return { $d: this.v.toString() }
    }
  }
}

/** JSON 反序列化时把 { $d } 还原为 D */
export function reviveD(_key: string, value: unknown): unknown {
  if (value && typeof value === 'object' && !Array.isArray(value) && '$d' in (value as object)) {
    return D.from((value as { $d: MetaNumLike | string }).$d)
  }
  return value
}

/** 便捷构造 */
export function d(value: DValue = 0): D {
  return D.from(value)
}

/** base ↑^arrows operand（超运算，arrows 为箭号数量） */
export function arrow(base: DValue, arrows: DValue, operand: DValue): D {
  return new D(MN.arrow(D.from(base).v, D.from(arrows).v, D.from(operand).v))
}

/**
 * 与参考游戏 ExpantaNum.expansion(base, level) 等价：base ↑^level base。
 * 参考游戏用它把「黄金蜂蜜」直接换算成攻击力等级。
 */
export function expansion(base: DValue, level: DValue): D {
  return arrow(base, level, base)
}

/**
 * Hardy 层级 H_α(10)：α 由 level 的十进制数位按 Cantor 范式展开得到。
 * 本作用它来生成怪物血量 —— 怪物等级每提高一点，血量都会跃升一个层级。
 */
export function hardy(level: number): D {
  return new D(MN.hardy(level))
}

/** 线性插值/夹紧（number 版） */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/** 把秒数格式化为 0:00:00 */
export function formatTime(seconds: number): string {
  const s = Math.floor(Math.max(0, seconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}
