<script setup lang="ts">
import UpgradeList from '@/components/UpgradeList.vue'
import { craft, maxCraft, RECIPES } from '@/game/actions'
import { COMBINATOR_UPGRADES, CURRENCY_NAMES } from '@/game/content'
import { d } from '@/game/num'
import { state } from '@/game/state'
</script>

<template>
  <div>
    <div class="panel">
      <div class="panel-title"><span>合成器</span><span class="sub">把低级资源压成高级资源</span></div>
      <div v-for="r in RECIPES" :key="r.id" class="up" :class="{ locked: !r.unlocked() }">
        <div class="up-main">
          <div class="up-name">
            {{ CURRENCY_NAMES[r.from] }} → {{ CURRENCY_NAMES[r.to] }}
          </div>
          <div class="up-desc">
            {{ r.rate.formatWhole() }} {{ CURRENCY_NAMES[r.from] }} 合成 1 {{ CURRENCY_NAMES[r.to] }} ·
            当前可合成 {{ maxCraft(r).formatWhole() }}
          </div>
        </div>
        <div class="row">
          <button class="btn small" :disabled="!r.unlocked() || maxCraft(r).lt(1)" @click="craft(r, d(1))">×1</button>
          <button class="btn small" :disabled="!r.unlocked() || maxCraft(r).lt(10)" @click="craft(r, d(10))">×10</button>
          <button class="btn small primary" :disabled="!r.unlocked() || maxCraft(r).lt(1)" @click="craft(r, maxCraft(r))">
            最大
          </button>
        </div>
      </div>
      <div class="sub">
        可可棒不会在转生中消失，每根提供 ×1.5 全局倍率，里程碑额外 ×2。当前：{{
          state.res.cocoaBar.formatWhole()
        }}
      </div>
    </div>

    <div class="panel">
      <div class="panel-title"><span>合成器升级</span></div>
      <UpgradeList :defs="COMBINATOR_UPGRADES" />
    </div>
  </div>
</template>
