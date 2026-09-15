import {
  anotherRoom,
  applyOffline,
  attack,
  eatHoney,
  eatVanilla,
  enterRoom,
  flee,
  goDown,
  goUp,
  returnToStairwell,
  tick,
} from './actions'
import { loadFromLocal, saveToLocal } from './save'
import { state } from './state'

const TICK_MS = 50
const AUTOSAVE_SECONDS = 30

let timer: number | null = null
let last = 0
let autosaveAcc = 0

function step(): void {
  const now = performance.now()
  let dt = (now - last) / 1000
  last = now
  if (dt > 5) dt = 5
  tick(dt)
  autosaveAcc += dt
  if (autosaveAcc >= AUTOSAVE_SECONDS) {
    autosaveAcc = 0
    if (state.settings.autoSave) saveToLocal()
  }
}

function setupHotkeys(): void {
  window.addEventListener('keydown', (ev) => {
    const target = ev.target as HTMLElement | null
    if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return
    if (ev.ctrlKey || ev.metaKey || ev.altKey) return
    switch (ev.key) {
      case 'ArrowUp':
        goUp()
        break
      case 'ArrowDown':
        goDown()
        break
      case 'ArrowRight':
        if (state.inRoom) anotherRoom()
        else enterRoom()
        break
      case 'ArrowLeft':
        returnToStairwell()
        break
      case 'a':
      case 'A':
        attack()
        break
      case 'f':
      case 'F':
        flee()
        break
      case '1':
        eatHoney()
        break
      case '2':
        eatVanilla()
        break
      default:
        return
    }
    ev.preventDefault()
  })
}

export function startGame(): void {
  const loaded = loadFromLocal()
  if (loaded && state.lastSaved > 0) {
    const seconds = (Date.now() - state.lastSaved) / 1000
    if (seconds > 60) applyOffline(seconds)
  }
  last = performance.now()
  if (timer === null) timer = window.setInterval(step, TICK_MS)
  setupHotkeys()
  window.addEventListener('beforeunload', () => saveToLocal())
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) saveToLocal()
  })
}

export function stopGame(): void {
  if (timer !== null) {
    window.clearInterval(timer)
    timer = null
  }
}
