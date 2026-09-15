<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Component } from 'vue'
import LogPanel from '@/components/LogPanel.vue'
import PlayerPanel from '@/components/PlayerPanel.vue'
import ResourceBar from '@/components/ResourceBar.vue'
import StairwellPanel from '@/components/StairwellPanel.vue'
import AltarPanel from '@/components/panels/AltarPanel.vue'
import BloodPanel from '@/components/panels/BloodPanel.vue'
import CombinatorPanel from '@/components/panels/CombinatorPanel.vue'
import GoldenPanel from '@/components/panels/GoldenPanel.vue'
import PlasmPanel from '@/components/panels/PlasmPanel.vue'
import RunesPanel from '@/components/panels/RunesPanel.vue'
import SavePanel from '@/components/panels/SavePanel.vue'
import StatsPanel from '@/components/panels/StatsPanel.vue'
import { startGame } from '@/game/loop'
import { formatTime } from '@/game/num'
import { state } from '@/game/state'

interface Tab {
  id: string
  name: string
  comp: Component
}

const tabs: Tab[] = [
  { id: 'runes', name: '符文', comp: RunesPanel },
  { id: 'altar', name: '祭坛', comp: AltarPanel },
  { id: 'plasm', name: '蜂浆', comp: PlasmPanel },
  { id: 'combinator', name: '合成器', comp: CombinatorPanel },
  { id: 'blood', name: '魔血', comp: BloodPanel },
  { id: 'golden', name: '黄金', comp: GoldenPanel },
  { id: 'stats', name: '统计', comp: StatsPanel },
  { id: 'save', name: '存档', comp: SavePanel },
]

const active = ref('runes')
const current = computed(() => tabs.find((t) => t.id === active.value)?.comp ?? RunesPanel)

onMounted(() => {
  startGame()
})
</script>

<template>
  <div>
    <header class="panel" style="display: flex; justify-content: space-between; align-items: center; gap: 10px">
      <div>
        <h1 style="color: var(--gold); font-size: 18px">无尽的楼梯间 NG++</h1>
        <div class="sub">ENDLESS STAIRWELL NG++ · 一栋永远走不到顶的楼</div>
      </div>
      <div style="text-align: right">
        <div class="sub">游戏时间 {{ formatTime(state.playTime) }}</div>
        <div class="sub">
          第 {{ state.floor }} 层 · 最高 {{ state.maxFloor }} 层 · Lv.{{ state.level.formatWhole() }}
        </div>
      </div>
    </header>

    <div class="panel" style="margin-bottom: 12px">
      <ResourceBar />
    </div>

    <div class="top-row">
      <PlayerPanel />
      <StairwellPanel />
      <LogPanel />
    </div>

    <div class="bottom-row">
      <nav class="tabs">
        <button
          v-for="t in tabs"
          :key="t.id"
          class="tab"
          :class="{ active: active === t.id }"
          @click="active = t.id"
        >
          {{ t.name }}
        </button>
      </nav>
      <component :is="current" />
    </div>

    <footer class="sub" style="text-align: center; margin-top: 14px">
      无尽的楼梯间 NG++ v1.0 · 使用 Vue 3 + TypeScript · 大数引擎 metanum · 存档压缩 pako
    </footer>
  </div>
</template>
