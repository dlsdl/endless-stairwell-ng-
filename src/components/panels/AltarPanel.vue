<script setup lang="ts">
import PrestigeCard from '@/components/PrestigeCard.vue'
import UpgradeList from '@/components/UpgradeList.vue'
import { ALTAR_UPGRADES } from '@/game/content'
</script>

<template>
  <div>
    <PrestigeCard id="altar" />
    <div class="panel">
      <div class="panel-title"><span>祭坛升级</span><span class="sub">货币：可可蜂蜜</span></div>
      <UpgradeList :defs="ALTAR_UPGRADES" />
    </div>
  </div>
</template>
