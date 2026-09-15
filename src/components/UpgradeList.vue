<script setup lang="ts">
import { buyUpgrade, canBuy, costOf, isBought, isVisible } from '@/game/actions'
import { CURRENCY_NAMES } from '@/game/content'
import type { UpgradeDef } from '@/game/types'

defineProps<{ defs: UpgradeDef[] }>()
</script>

<template>
  <div>
    <div
      v-for="def in defs"
      :key="def.id"
      class="up"
      :class="{ owned: isBought(def), locked: !isBought(def) && !canBuy(def) }"
    >
      <div class="up-main">
        <div class="up-name">{{ def.name }}</div>
        <div class="up-desc">{{ def.desc }}</div>
      </div>
      <div style="text-align: right; white-space: nowrap">
        <button v-if="isBought(def)" class="btn small" disabled>已购买</button>
        <button v-else class="btn small primary" :disabled="!canBuy(def)" @click="buyUpgrade(def)">
          {{ costOf(def).format() }} {{ CURRENCY_NAMES[def.currency] }}
        </button>
        <div v-if="!isBought(def) && !isVisible(def)" class="up-desc">前置条件未达成</div>
      </div>
    </div>
  </div>
</template>
