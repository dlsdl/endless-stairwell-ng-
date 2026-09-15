import { deflate, inflate } from 'pako'
import { D, reviveD } from './num'
import { replaceState, state } from './state'
import type { GameState } from './types'

const STORAGE_KEY = 'endless-stairwell-ngpp-save'
/** 存档前缀：ESNG = Endless Stairwell Next Generation，2 = 存档格式版本 */
const MAGIC = 'ESNG2|'

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

function base64ToBytes(text: string): Uint8Array {
  const binary = atob(text)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

/** 把当前状态压缩成一段可复制的文本 */
export function serializeState(): string {
  const json = JSON.stringify(state)
  const deflated = deflate(new TextEncoder().encode(json), { level: 9 })
  return MAGIC + bytesToBase64(deflated)
}

function deserialize(text: string): GameState {
  const raw = text.trim()
  const json =
    raw.startsWith(MAGIC) || /^[A-Za-z0-9+/=]+$/.test(raw)
      ? new TextDecoder().decode(inflate(base64ToBytes(raw.replace(MAGIC, ''))))
      : raw
  const parsed = JSON.parse(json, reviveD) as GameState
  if (!parsed || typeof parsed !== 'object' || !parsed.res) {
    throw new Error('存档格式无法识别')
  }
  return parsed
}

export function saveToLocal(): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, serializeState())
    state.lastSaved = Date.now()
    return true
  } catch (err) {
    console.error('[save] 写入本地存档失败', err)
    return false
  }
}

export function loadFromLocal(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    return importSave(raw)
  } catch (err) {
    console.error('[save] 读取本地存档失败', err)
    return false
  }
}

export function hasLocalSave(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null
}

/** 导入一段存档文本（压缩格式或明文 JSON 均可） */
export function importSave(text: string): boolean {
  try {
    const parsed = deserialize(text)
    replaceState(parsed)
    return true
  } catch (err) {
    console.error('[save] 导入失败', err)
    return false
  }
}

export function exportSaveFile(): void {
  const data = serializeState()
  const blob = new Blob([data], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const stamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19)
  a.href = url
  a.download = `endless-stairwell-ngpp-${stamp}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** 把存档文本复制到剪贴板 */
export async function copySaveToClipboard(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(serializeState())
    return true
  } catch {
    return false
  }
}

export function wipeLocalSave(): void {
  localStorage.removeItem(STORAGE_KEY)
}

/** 供 UI 显示的存档体积信息 */
export function saveSizeInfo(): { raw: number; packed: number } {
  const packed = serializeState()
  const json = JSON.stringify(state)
  return { raw: new TextEncoder().encode(json).length, packed: packed.length }
}

export function ensureFinite(value: D): D {
  return value.isFinite() ? value : D.zero
}
