<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { useHighscoreStore } from '@/stores/highscore'

const gameStore = useGameStore()
const highscoreStore = useHighscoreStore()
</script>

<template>
  <div>
    <h2 class="text-primary text-center">Score: {{ gameStore.score }}</h2>
    <p class="text-muted text-center">Best: {{ highscoreStore.localBestScore }}</p>
  </div>
</template>
