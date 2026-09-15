<script setup lang="ts">
import PrestigeCard from '@/components/PrestigeCard.vue'
import UpgradeList from '@/components/UpgradeList.vue'
import { PLASM_UPGRADES } from '@/game/content'
</script>

<template>
  <div>
    <PrestigeCard id="plasm" />
    <div class="panel">
      <div class="panel-title"><span>蜂浆商店</span><span class="sub">货币：蜂浆</span></div>
      <div class="sub" style="margin-bottom: 8px">
        「哇哦——我的天哪，是顾客！欢迎欢迎！我这里有货！请买点什么吧！！！！！！！」
      </div>
      <UpgradeList :defs="PLASM_UPGRADES" />
    </div>
  </div>
</template>
