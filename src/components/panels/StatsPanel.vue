<script setup lang="ts">
import { formatTime } from '@/game/num'
import { state } from '@/game/state'
</script>

<template>
  <div class="panel">
    <div class="panel-title"><span>统计</span><span class="sub">游戏时间 {{ formatTime(state.playTime) }}</span></div>
    <div class="grid">
      <div class="between"><span class="sub">最高等级</span><b>{{ state.stats.bestLevel.formatWhole() }}</b></div>
      <div class="between"><span class="sub">最高楼层</span><b>{{ state.maxFloor }} 层</b></div>
      <div class="between"><span class="sub">祭坛转生</span><b>{{ state.stats.altars.formatWhole() }}</b></div>
      <div class="between"><span class="sub">蜂浆转生</span><b>{{ state.stats.plasms.formatWhole() }}</b></div>
      <div class="between"><span class="sub">暗球</span><b>{{ state.stats.orbs.formatWhole() }}</b></div>
      <div class="between"><span class="sub">累计击杀</span><b>{{ state.kills.formatWhole() }}</b></div>
      <div class="between"><span class="sub">死亡次数</span><b>{{ state.deaths.formatWhole() }}</b></div>
      <div class="between"><span class="sub">打开宝箱</span><b>{{ state.stats.chests.formatWhole() }}</b></div>
      <div class="between"><span class="sub">神龛祈福</span><b>{{ state.stats.shrines.formatWhole() }}</b></div>
      <div class="between"><span class="sub">宝石鳗</span><b>{{ state.stats.gemEels.formatWhole() }}</b></div>
      <div class="between"><span class="sub">吃掉的蜂蜜</span><b>{{ state.stats.honeyEaten.formatWhole() }}</b></div>
    </div>

    <div class="panel-title" style="margin-top: 12px"><span>快捷键</span></div>
    <div class="grid">
      <div class="between"><span class="sub">上 / 下楼</span><b><span class="kbd">↑</span> <span class="kbd">↓</span></b></div>
      <div class="between"><span class="sub">进入 / 探索房间</span><b><span class="kbd">→</span></b></div>
      <div class="between"><span class="sub">返回楼梯间</span><b><span class="kbd">←</span></b></div>
      <div class="between"><span class="sub">攻击</span><b><span class="kbd">A</span></b></div>
      <div class="between"><span class="sub">逃跑</span><b><span class="kbd">F</span></b></div>
      <div class="between"><span class="sub">食用蜂蜜 / 香草蜂蜜</span><b><span class="kbd">1</span> <span class="kbd">2</span></b></div>
    </div>
  </div>
</template>
