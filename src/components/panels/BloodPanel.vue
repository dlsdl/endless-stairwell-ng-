<script setup lang="ts">
import UpgradeList from '@/components/UpgradeList.vue'
import { buyProducer } from '@/game/actions'
import { BLOOD_UPGRADES } from '@/game/content'
import * as M from '@/game/multipliers'
import { state } from '@/game/state'

const perSecond = () => M.bloodPerSecond()
</script>

<template>
  <div>
    <div class="panel">
      <div class="panel-title">
        <span>魔血</span>
        <span class="sub">{{ state.res.blood.format() }}（+{{ perSecond().format() }}/秒）</span>
      </div>
      <div class="sub" style="margin-bottom: 8px">
        100 层以上的敌人会掉落魔血；魔血按对数放大全局倍率（当前 ×{{
          state.res.blood.add(1).pow(0.1).format(2)
        }}）。
      </div>
      <div v-for="(count, i) in state.producers" :key="i" class="up">
        <div class="up-main">
          <div class="up-name">{{ i + 1 }} 阶生产者 · {{ count.formatWhole() }}</div>
          <div class="up-desc">
            每个 {{ M.producerRate(i).formatWhole() }}/秒 · 合计
            {{ count.mul(M.producerRate(i)).format() }}/秒
          </div>
        </div>
        <button class="btn small primary" :disabled="state.res.blood.lt(M.producerCost(i))" @click="buyProducer(i)">
          {{ M.producerCost(i).format() }} 魔血
        </button>
      </div>
    </div>

    <div class="panel">
      <div class="panel-title">
        <span>血宝石</span>
        <span class="sub">{{ state.res.bloodGem.formatWhole() }} 颗</span>
      </div>
      <div class="sub">
        每 25 层（125 层起）会出现宝石鳗，击败可获得血宝石。已击败 {{ state.stats.gemEels.formatWhole() }} 条。
      </div>
    </div>

    <div class="panel">
      <div class="panel-title"><span>魔血升级</span></div>
      <UpgradeList :defs="BLOOD_UPGRADES" />
    </div>
  </div>
</template>
