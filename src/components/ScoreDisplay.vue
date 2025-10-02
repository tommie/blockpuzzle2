<script setup lang="ts">
import { ref, watch } from 'vue'
import { useGameStore } from '@/stores/game'
import { useHighscoreStore } from '@/stores/highscore'

const gameStore = useGameStore()
const highscoreStore = useHighscoreStore()

const scoreBadgeText = ref('')
const isAnimating = ref(false)

// Watch for score changes to trigger badge animation
watch(
  () => gameStore.score,
  (newScore, oldScore) => {
    const pointsGained = newScore - oldScore

    if (pointsGained > 0) {
      scoreBadgeText.value = `+${pointsGained}`
      isAnimating.value = true
    }
  },
)

// Handle animation end
function onAnimationEnd() {
  isAnimating.value = false
}
</script>

<template>
  <div class="position-relative">
    <h2 class="text-primary text-center">
      Score: {{ gameStore.score }}
      <!-- Score Badge Animation -->
      <span
        :class="[
          'badge text-bg-dark position-absolute right-0 pointer-events-none score-badge',
          { 'score-animate': isAnimating },
        ]"
        @animationend="onAnimationEnd"
      >
        {{ scoreBadgeText }}
      </span>
    </h2>
    <p class="text-muted text-center">Best: {{ highscoreStore.localBestScore }}</p>
  </div>
</template>

<style scoped>
.score-badge {
  z-index: 1070; /* $zindex-popover */

  opacity: 0;
  scale: 0.2;
}

.score-animate {
  animation: fadeZoom 400ms ease-in-out;
}

@keyframes fadeZoom {
  0% {
    opacity: 0;
    scale: 0.2;
  }
  50% {
    opacity: 0.7;
    scale: 1;
  }
  100% {
    opacity: 0;
    scale: 0.2;
  }
}
</style>
