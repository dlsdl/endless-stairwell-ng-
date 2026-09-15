<script setup lang="ts">
import { ref } from 'vue'
import { hardReset } from '@/game/actions'
import {
  copySaveToClipboard,
  exportSaveFile,
  importSave,
  saveSizeInfo,
  saveToLocal,
  wipeLocalSave,
} from '@/game/save'
import { pushLog, state } from '@/game/state'

const text = ref('')
const message = ref('')
const messageOk = ref(true)
const confirmReset = ref(false)
const size = ref<{ raw: number; packed: number } | null>(null)

function notify(msg: string, ok = true): void {
  message.value = msg
  messageOk.value = ok
  window.setTimeout(() => {
    if (message.value === msg) message.value = ''
  }, 4000)
}

function doSave(): void {
  notify(saveToLocal() ? '已写入本地存档。' : '本地存档写入失败（可能是隐私模式）。', true)
}

function doExport(): void {
  exportSaveFile()
  notify('存档文件已导出。')
}

async function doCopy(): Promise<void> {
  notify((await copySaveToClipboard()) ? '存档文本已复制到剪贴板。' : '复制失败，请手动复制下方文本。')
}

function doImport(): void {
  const raw = text.value.trim()
  if (!raw) {
    notify('请先粘贴存档文本或选择存档文件。', false)
    return
  }
  if (importSave(raw)) {
    notify('导入成功！')
    pushLog('已从外部存档恢复进度。')
    text.value = ''
  } else {
    notify('导入失败：存档文本无法解析。', false)
  }
}

async function onFile(ev: Event): Promise<void> {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  text.value = await file.text()
  input.value = ''
  notify(`已读取文件 ${file.name}，点击下方按钮导入。`)
}

function doHardReset(): void {
  if (!confirmReset.value) {
    confirmReset.value = true
    return
  }
  hardReset()
  wipeLocalSave()
  confirmReset.value = false
  notify('全部进度已抹除。')
}

function showSize(): void {
  size.value = saveSizeInfo()
}
</script>

<template>
  <div class="panel">
    <div class="panel-title">
      <span>存档</span>
      <span class="sub">
        上次保存：{{ state.lastSaved ? new Date(state.lastSaved).toLocaleString() : '尚未保存' }}
      </span>
    </div>

    <div class="row">
      <button class="btn primary" @click="doSave()">保存到本地</button>
      <button class="btn" @click="doExport()">导出存档文件</button>
      <button class="btn" @click="doCopy()">复制存档文本</button>
      <button class="btn small" @click="showSize()">查看体积</button>
      <button
        class="btn small"
        :class="{ primary: state.settings.autoSave }"
        @click="state.settings.autoSave = !state.settings.autoSave"
      >
        自动保存：{{ state.settings.autoSave ? '开' : '关' }}
      </button>
    </div>

    <div v-if="size" class="sub" style="margin-top: 6px">
      原始 JSON {{ size.raw }} 字节 → pako 压缩后 {{ size.packed }} 字节（约
      {{ ((size.packed / Math.max(1, size.raw)) * 100).toFixed(1) }}%）
    </div>

    <div class="sub" style="margin-top: 10px">
      存档使用 pako (deflate) 压缩并以 Base64 编码，可安全粘贴到任何地方。
    </div>

    <div class="panel-title" style="margin-top: 12px"><span>导入存档</span></div>
    <textarea v-model="text" rows="5" placeholder="在此粘贴存档文本，或从下方选择 .txt 存档文件" />
    <div class="row" style="margin-top: 6px">
      <button class="btn primary" @click="doImport()">导入</button>
      <input type="file" accept=".txt,.json,text/plain" @change="onFile" />
    </div>

    <div class="panel-title" style="margin-top: 12px"><span>危险区域</span></div>
    <div class="row">
      <button class="btn danger" @click="doHardReset()">
        {{ confirmReset ? '再点一次确认：抹除全部进度' : '硬重置' }}
      </button>
    </div>

    <div v-if="message" class="sub" :style="{ marginTop: '8px', color: messageOk ? 'var(--green)' : 'var(--hp)' }">
      {{ message }}
    </div>
  </div>
</template>
