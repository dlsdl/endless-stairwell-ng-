<script setup lang="ts">
import { state } from '@/game/state'
</script>

<template>
  <div class="panel fill">
    <div class="panel-title"><span>日志</span></div>
    <div class="log">
      <div v-for="(line, i) in state.log" :key="i" class="log-entry">{{ line }}</div>
    </div>
  </div>
</template>
