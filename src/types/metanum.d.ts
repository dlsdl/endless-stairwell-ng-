/// <reference types="vite/client" />

declare module 'metanum' {
  export interface MetaNumInstance {
    add(other: unknown): MetaNumInstance
    sub(other: unknown): MetaNumInstance
    mul(other: unknown): MetaNumInstance
    div(other: unknown): MetaNumInstance
    pow(other: unknown): MetaNumInstance
    root(other: unknown): MetaNumInstance
    sqrt(): MetaNumInstance
    cbrt(): MetaNumInstance
    exp(): MetaNumInstance
    ln(): MetaNumInstance
    log(base?: unknown): MetaNumInstance
    log10(): MetaNumInstance
    slog(base?: unknown): MetaNumInstance
    tetr(other: unknown, payload?: unknown): MetaNumInstance
    pent(other: unknown): MetaNumInstance
    abs(): MetaNumInstance
    neg(): MetaNumInstance
    rec(): MetaNumInstance
    floor(): MetaNumInstance
    ceil(): MetaNumInstance
    round(): MetaNumInstance
    mod(other: unknown): MetaNumInstance
    max(other: unknown): MetaNumInstance
    min(other: unknown): MetaNumInstance
    cmp(other: unknown): number
    eq(other: unknown): boolean
    neq(other: unknown): boolean
    lt(other: unknown): boolean
    lte(other: unknown): boolean
    gt(other: unknown): boolean
    gte(other: unknown): boolean
    ispos(): boolean
    isneg(): boolean
    isint(): boolean
    isNaN(): boolean
    isFinite(): boolean
    toNumber(): number
    toString(): string
    toFixed(digits?: number): string
    toExponential(digits?: number): string
    toJSON(): { sign: number; array: number[][]; layer: number }
  }

  interface MetaNumStatic {
    (value?: unknown): MetaNumInstance
    new (value?: unknown): MetaNumInstance
    fromNumber(value: number): MetaNumInstance
    fromString(value: string): MetaNumInstance
    fromObject(value: unknown): MetaNumInstance
    fromJSON(value: string): MetaNumInstance
    fromArray(array: number[], layer?: number): MetaNumInstance
    fromBigInt(value: bigint): MetaNumInstance
    add(a: unknown, b: unknown): MetaNumInstance
    sub(a: unknown, b: unknown): MetaNumInstance
    mul(a: unknown, b: unknown): MetaNumInstance
    div(a: unknown, b: unknown): MetaNumInstance
    pow(a: unknown, b: unknown): MetaNumInstance
    max(a: unknown, b: unknown): MetaNumInstance
    min(a: unknown, b: unknown): MetaNumInstance
    tetr(a: unknown, b: unknown): MetaNumInstance
    arrow(a: unknown, b: unknown, c: unknown): MetaNumInstance
    hardy(value: unknown): MetaNumInstance
    config(options: Record<string, number>): MetaNumStatic
    MAX_SAFE_INTEGER: number
    POSITIVE_INFINITY: MetaNumInstance
    NEGATIVE_INFINITY: MetaNumInstance
  }

  const MetaNum: MetaNumStatic
  export default MetaNum
}

declare module 'metanum/format-metanum.js' {
  export function format(value: unknown, precision?: number, small?: boolean): string
  export function formatWhole(value: unknown): string
  export function formatSmall(value: unknown, precision?: number): string
  export const FORMAT_OPTIONS: Record<string, boolean | number>
}
