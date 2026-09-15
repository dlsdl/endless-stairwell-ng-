<script setup lang="ts">
import { computed } from 'vue'
import {
  anotherRoom,
  attack,
  enterRoom,
  flee,
  goDown,
  goUp,
  returnToStairwell,
  TELEPORTS,
  teleport,
  toGround,
} from '@/game/actions'
import { ATTACK_COST, ENTER_ROOM_COST, FLEE_COST, tierOf } from '@/game/multipliers'
import { D } from '@/game/num'
import { state } from '@/game/state'

const tier = computed(() => tierOf(state.floor))
const monster = computed(() => state.monster)
const mHpPct = computed(() => {
  const m = state.monster
  if (!m) return 0
  return D.from(m.hp).div(D.from(m.maxHp)).ratio() * 100
})
const unlockedTeleports = computed(() => TELEPORTS.filter((t) => t.requires()))
const canEnter = computed(() => D.from(state.energy).gte(ENTER_ROOM_COST))
const canAttack = computed(() => D.from(state.energy).gte(ATTACK_COST) && state.attackCooldown <= 0)
const canFlee = computed(() => D.from(state.energy).gte(FLEE_COST))
</script>

<template>
  <div class="panel stairwell">
    <div class="panel-title">
      <span>楼梯间</span>
      <span class="sub">最高 {{ state.maxFloor }} 层</span>
    </div>

    <div class="stairwell-body">
      <div style="text-align: center; margin: 6px 0 12px">
        <div class="floor-label">{{ state.floor === 0 ? '地面层' : `第 ${state.floor} 层` }}</div>
        <div class="sub">
          {{ state.floor === 0 ? 'YOU ARE ON THE GROUND FLOOR' : `危险等级 ${tier} 阶` }}
        </div>
      </div>

      <!-- 楼梯间 -->
    <template v-if="!state.inRoom">
      <div class="row">
        <button class="btn" @click="goUp()">上一层 <span class="kbd">↑</span></button>
        <button class="btn" :disabled="state.floor <= 0" @click="goDown()">
          下一层 <span class="kbd">↓</span>
        </button>
        <button class="btn primary" :disabled="!canEnter" @click="enterRoom()">
          进入本层 <span class="kbd">→</span>
        </button>
      </div>
      <div class="row" style="margin-top: 6px">
        <button class="btn small" @click="toGround()">回到地面层</button>
        <button v-for="t in unlockedTeleports" :key="t.floor" class="btn small" @click="teleport(t.floor)">
          {{ t.floor }} 层
        </button>
      </div>
      <div class="sub" style="margin-top: 6px">
        进入房间消耗 {{ ENTER_ROOM_COST }} 点能量，攻击消耗 {{ ATTACK_COST }} 点能量。
      </div>
    </template>

    <!-- 房间内 -->
    <template v-else>
      <div class="sub" style="margin-bottom: 8px">{{ state.roomMessage }}</div>

      <template v-if="monster">
        <div class="monster-head">
          <b style="color: var(--pink)">Lv.{{ monster.level }} · {{ monster.name }}</b>
          <span class="sub">{{ monster.tier }} 阶{{ monster.boss ? ' · BOSS' : '' }}</span>
        </div>
        <div class="bar monster" style="margin: 4px 0">
          <i :style="{ width: mHpPct + '%' }" />
          <span>{{ monster.hp.format() }} / {{ monster.maxHp.format() }}</span>
        </div>
        <div class="between sub">
          <span>下次攻击：{{ Math.max(0, monster.timer).toFixed(1) }} 秒</span>
          <span>伤害：{{ monster.dmg.format() }}</span>
        </div>
        <div class="sub">血量 = MetaNum.hardy(Lv.{{ monster.level }})</div>
        <div class="row" style="margin-top: 8px">
          <button class="btn primary" :disabled="!canAttack" @click="attack()">
            攻击 <span class="kbd">A</span>
          </button>
          <button class="btn" :disabled="!canFlee" @click="flee()">逃跑 <span class="kbd">F</span></button>
        </div>
      </template>

      <template v-else>
        <div class="row">
          <button class="btn primary" :disabled="!canEnter" @click="anotherRoom()">
            探索新房间 <span class="kbd">→</span>
          </button>
        </div>
      </template>

      <div class="row" style="margin-top: 8px">
        <button class="btn small" @click="returnToStairwell()">返回楼梯间 <span class="kbd">←</span></button>
        <button
          class="btn small"
          :class="{ primary: state.settings.autoFloor }"
          @click="state.settings.autoFloor = !state.settings.autoFloor"
        >
          自动探索：{{ state.settings.autoFloor ? '开' : '关' }}
        </button>
      </div>
    </template>
    </div>
  </div>
</template>
