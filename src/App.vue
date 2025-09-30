<script setup lang="ts">
import { watch } from 'vue'

import GameBoard from '@/components/GameBoard.vue'
import ScoreDisplay from '@/components/ScoreDisplay.vue'
import GameControls from '@/components/GameControls.vue'
import GameOverModal from '@/components/GameOverModal.vue'
import ScorePopup from '@/components/ScorePopup.vue'
import { useGameStore } from '@/stores/game'
import { useHighscoreStore } from '@/stores/highscore'

const gameStore = useGameStore()
const highscoreStore = useHighscoreStore()

watch(
  () => gameStore.score,
  (score) => {
    highscoreStore.updateScore(score)
  },
)
</script>

<template>
  <div class="flex-fill d-flex flex-column align-items-center overflow-hidden gap-5 m-4">
    <header>
      <h1 class="display-6 text-center">Block Puzzle</h1>

      <ScoreDisplay />
      <GameControls />
    </header>

    <GameBoard />

    <ScorePopup />
    <GameOverModal />
  </div>
</template>
