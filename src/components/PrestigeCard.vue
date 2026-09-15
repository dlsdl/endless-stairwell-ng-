<script setup lang="ts">
import { computed } from 'vue'
import { doPrestige } from '@/game/actions'
import { CURRENCY_NAMES, PRESTIGES } from '@/game/content'
import * as M from '@/game/multipliers'
import { state } from '@/game/state'

const props = defineProps<{ id: string }>()

const def = computed(() => PRESTIGES.find((p) => p.id === props.id)!)

const gain = computed(() => {
  const g = def.value.gain(state)
  switch (def.value.currency) {
    case 'cocoa':
      return g.mul(M.cocoaGainMult())
    case 'plasm':
      return g.mul(M.plasmGainMult())
    default:
      return g
  }
})
</script>

<template>
  <div class="panel">
    <div class="panel-title">
      <span>{{ def.name }}</span>
      <span class="sub">{{ CURRENCY_NAMES[def.currency] }}：{{ state.res[def.currency].format() }}</span>
    </div>
    <div class="sub" style="margin-bottom: 8px">{{ def.desc }}</div>
    <div class="between">
      <span>可获得：<b style="color: var(--gold)">{{ gain.format() }}</b> {{ CURRENCY_NAMES[def.currency] }}</span>
      <button class="btn primary" :disabled="!def.can(state)" @click="doPrestige(def.id)">
        {{ def.button }}
      </button>
    </div>
    <div class="sub" style="margin-top: 6px">{{ def.reqText(state) }}</div>
  </div>
</template>
