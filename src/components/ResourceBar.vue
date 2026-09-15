<script setup lang="ts">
import { computed } from 'vue'
import { CURRENCY_NAMES } from '@/game/content'
import { D } from '@/game/num'
import { state } from '@/game/state'
import type { CurrencyId } from '@/game/types'

const ALWAYS: CurrencyId[] = ['honey', 'vanilla', 'cocoa']

const items = computed(() => {
  const list: { id: CurrencyId; name: string; value: D }[] = []
  for (const id of ALWAYS) {
    list.push({ id, name: CURRENCY_NAMES[id], value: D.from(state.res[id]) })
  }
  for (const id of Object.keys(state.res) as CurrencyId[]) {
    if (ALWAYS.includes(id)) continue
    const v = D.from(state.res[id])
    if (v.gt(0)) list.push({ id, name: CURRENCY_NAMES[id], value: v })
  }
  return list
})

function fmt(v: D): string {
  return v.lt(1e6) ? v.formatWhole() : v.format(3)
}
</script>

<template>
  <div class="res">
    <div v-for="it in items" :key="it.id" class="res-item">
      <span>{{ it.name }}</span>
      <b>{{ fmt(it.value) }}</b>
    </div>
  </div>
</template>
