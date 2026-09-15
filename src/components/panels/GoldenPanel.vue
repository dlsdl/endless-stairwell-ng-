<script setup lang="ts">
import PrestigeCard from '@/components/PrestigeCard.vue'
import UpgradeList from '@/components/UpgradeList.vue'
import { GOLDEN_UPGRADES } from '@/game/content'
import * as M from '@/game/multipliers'
import { state } from '@/game/state'
</script>

<template>
  <div>
    <div class="panel">
      <div class="panel-title">
        <span>黄金蜂蜜</span>
        <span class="sub">{{ state.res.golden.format() }}（倍率 ×{{ M.goldenGainMult().format(2) }}）</span>
      </div>
      <div class="sub">
        500 层（8 阶）以上的敌人会掉落黄金蜂蜜。它是本作最后一层资源，用于把倍率推向荒谬的规模。
      </div>
    </div>

    <div class="panel">
      <div class="panel-title"><span>黄金升级</span></div>
      <UpgradeList :defs="GOLDEN_UPGRADES" />
    </div>

    <PrestigeCard id="orb" />
  </div>
</template>
