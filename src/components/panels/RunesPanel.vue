<script setup lang="ts">
import {
  forgeRune,
  PERM_RUNE_MAX,
  permRuneCost,
  RUNE_NAMES,
  upgradePermRune,
  useRune,
} from '@/game/actions'
import { state } from '@/game/state'
import type { RuneColor } from '@/game/types'

const colors: RuneColor[] = ['red', 'green', 'blue']

const TEMP_EFFECT: Record<RuneColor, string> = {
  red: '+50% 攻击伤害与经验获取',
  green: '+50% 物品发现率',
  blue: '+50% 能量回复速度',
}

const PERM_EFFECT: Record<RuneColor, (lv: number) => string> = {
  red: (lv) => `+${lv * 10}% 经验获取`,
  green: (lv) => `+${lv * 10}% 物品发现率`,
  blue: (lv) => `+${lv * 10}% 能量回复速度`,
}

const COLOR_STYLE: Record<RuneColor, string> = {
  red: 'var(--hp)',
  green: 'var(--green)',
  blue: 'var(--energy)',
}
</script>

<template>
  <div class="panel">
    <div class="panel-title">
      <span>铁匠铺 · 本尼 B. 史密斯</span>
      <span class="sub">「需要点符文吗？我这儿什么都能打。」</span>
    </div>

    <div class="sub" style="margin-bottom: 6px">临时符文（持续 60 秒）</div>
    <div
      v-for="c in colors"
      :key="c"
      class="up"
      :class="{ locked: state.res.honey.lt(3) || state.res.vanilla.lt(1) }"
    >
      <div class="up-main">
        <div class="up-name" :style="{ color: COLOR_STYLE[c] }">{{ RUNE_NAMES[c] }}</div>
        <div class="up-desc">{{ TEMP_EFFECT[c] }} · 持有 {{ state.runes[c].formatWhole() }}</div>
        <div v-if="state.buffTime[c] > 0" class="up-desc" style="color: var(--green)">
          生效中：剩余 {{ state.buffTime[c].toFixed(0) }} 秒
        </div>
      </div>
      <div class="row">
        <button class="btn small" :disabled="state.res.honey.lt(3) || state.res.vanilla.lt(1)" @click="forgeRune(c)">
          打造（3 蜂蜜 + 1 香草）
        </button>
        <button class="btn small primary" :disabled="state.runes[c].lt(1)" @click="useRune(c)">使用</button>
      </div>
    </div>

    <div class="sub" style="margin: 10px 0 6px">永久符文（每局保留）</div>
    <div v-for="c in colors" :key="'p' + c" class="up">
      <div class="up-main">
        <div class="up-name" :style="{ color: COLOR_STYLE[c] }">
          {{ RUNE_NAMES[c] }}* · {{ state.permRunes[c] }} / {{ PERM_RUNE_MAX[c] }}
        </div>
        <div class="up-desc">{{ PERM_EFFECT[c](state.permRunes[c]) }}</div>
      </div>
      <div style="text-align: right">
        <button
          v-if="state.permRunes[c] < PERM_RUNE_MAX[c]"
          class="btn small primary"
          :disabled="state.res.honey.lt(permRuneCost(c).honey) || state.res.vanilla.lt(permRuneCost(c).vanilla)"
          @click="upgradePermRune(c)"
        >
          {{ permRuneCost(c).honey.formatWhole() }} 蜂蜜 + {{ permRuneCost(c).vanilla.formatWhole() }} 香草
        </button>
        <button v-else class="btn small" disabled>已满级</button>
      </div>
    </div>
  </div>
</template>
