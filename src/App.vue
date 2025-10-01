<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'

import GameBoard from '@/components/GameBoard.vue'
import ScoreDisplay from '@/components/ScoreDisplay.vue'
import GameControls from '@/components/GameControls.vue'
import GameOverModal from '@/components/GameOverModal.vue'
import ScorePopup from '@/components/ScorePopup.vue'
import PageFooter from '@/components/PageFooter.vue'
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

function useMediaQuery(query: string) {
  const match = window.matchMedia(query)
  const matches = ref(match.matches)

  function onChange() {
    matches.value = match.matches
  }

  onMounted(() => match.addEventListener('change', onChange))
  onUnmounted(() => match.removeEventListener('change', onChange))
  console.log(query, matches.value)

  return matches
}

const isPortrait = useMediaQuery('(orientation: portrait)')
</script>

<template>
  <div
    :class="[
      'flex-fill d-flex gap-4 m-4 overflow-hidden',
      isPortrait ? 'flex-column' : 'flex-row justify-content-center',
    ]"
  >
    <header class="d-flex flex-column">
      <div class="flex-fill" />

      <h1 class="display-6 text-center">Block Puzzle</h1>

      <ScoreDisplay />
      <GameControls />

      <div class="flex-fill" />

      <PageFooter v-if="!isPortrait" />
    </header>

    <GameBoard class="flex-fill" />

    <ScorePopup />
    <GameOverModal />

    <PageFooter v-if="isPortrait" />
  </div>
</template>
