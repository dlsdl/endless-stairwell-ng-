<script setup lang="ts">
import { computed } from 'vue'
import { eatHoney, eatVanilla } from '@/game/actions'
import * as M from '@/game/multipliers'
import { D } from '@/game/num'
import { state } from '@/game/state'

const maxHp = computed(() => M.playerMaxHp())
const hpPct = computed(() => D.from(state.hp).div(maxHp.value).ratio() * 100)
const maxEnergy = computed(() => M.maxEnergy())
const energyPct = computed(() => D.from(state.energy).div(maxEnergy.value).ratio() * 100)
const nextXp = computed(() => M.xpToNext(D.from(state.level)))
const xpPct = computed(() => D.from(state.xp).div(nextXp.value).ratio() * 100)
const damage = computed(() => M.playerDamage())
const regen = computed(() => M.energyRegen())
</script>

<template>
  <div class="panel">
    <div class="panel-title">
      <span>角色状态</span>
      <span class="sub">Lv.{{ state.level.formatWhole() }}</span>
    </div>

    <div class="grid" style="gap: 8px">
      <div>
        <div class="between sub">
          <span>生命</span>
          <span>{{ state.hp.format() }} / {{ maxHp.format() }}</span>
        </div>
        <div class="bar hp"><i :style="{ width: hpPct + '%' }" /></div>
      </div>

      <div>
        <div class="between sub">
          <span>能量</span>
          <span>{{ state.energy.format(2) }} / {{ maxEnergy.formatWhole() }} (+{{ regen.format(2) }}/秒)</span>
        </div>
        <div class="bar energy"><i :style="{ width: energyPct + '%' }" /></div>
      </div>

      <div>
        <div class="between sub">
          <span>经验</span>
          <span>{{ state.xp.format() }} / {{ nextXp.format() }}</span>
        </div>
        <div class="bar xp"><i :style="{ width: xpPct + '%' }" /></div>
      </div>
    </div>

    <div class="grid" style="margin-top: 10px; gap: 4px">
      <div class="between"><span class="sub">攻击伤害</span><b>{{ damage.format() }}</b></div>
      <div class="between"><span class="sub">累计经验</span><b>{{ state.totalXp.format() }}</b></div>
      <div class="between"><span class="sub">击杀 / 死亡</span><b>{{ state.kills.formatWhole() }} / {{ state.deaths.formatWhole() }}</b></div>
      <div class="between"><span class="sub">经验倍率</span><b>×{{ M.xpMult().format(2) }}</b></div>
      <div class="between"><span class="sub">全局倍率</span><b>×{{ M.globalMult().format(2) }}</b></div>
    </div>

    <div class="row" style="margin-top: 10px">
      <button class="btn small" :disabled="state.res.honey.lt(1)" @click="eatHoney()">
        食用蜂蜜 ({{ state.res.honey.formatWhole() }})
      </button>
      <button class="btn small" :disabled="state.res.vanilla.lt(1)" @click="eatVanilla()">
        食用香草蜂蜜 ({{ state.res.vanilla.formatWhole() }})
      </button>
      <button
        class="btn small"
        :class="{ primary: state.settings.autoAttack }"
        @click="state.settings.autoAttack = !state.settings.autoAttack"
      >
        自动攻击：{{ state.settings.autoAttack ? '开' : '关' }}
      </button>
    </div>
    <div class="sub" style="margin-top: 6px">
      蜂蜜：立刻获得当前升级所需经验的 20%，并永久小幅提升经验获取。<br />
      生命只在没有敌人时回复；进入战斗后不再自然回血。
    </div>
  </div>
</template>
