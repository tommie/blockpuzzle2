<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { useGameStore } from '@/stores/game'
import { useHighscoreStore } from '@/stores/highscore'

const gameStore = useGameStore()
const highscoreStore = useHighscoreStore()

const isVisible = ref(false)
const isNewBest = computed(() => gameStore.score > highscoreStore.localBestScore)

watch(
  () => gameStore.canMakeMove,
  (canMakeMove) => {
    if (!canMakeMove) isVisible.value = true
  },
  { immediate: true },
)

function handlePlayAgain() {
  gameStore.newGame()
  isVisible.value = false
}

function handleClose() {
  isVisible.value = false
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      class="game-over-modal modal fade show d-block"
      tabindex="-1"
      role="dialog"
      aria-labelledby="gameOverTitle"
    >
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header text-center border-0 pb-0">
            <h3 id="gameOverTitle" class="modal-title w-100 text-danger">Game Over!</h3>
          </div>

          <div class="modal-body text-center py-4">
            <div class="score-summary mb-4">
              <h4 class="text-primary mb-2">Final Score</h4>
              <div class="display-4 text-success fw-bold mb-3">{{ gameStore.score }}</div>

              <div v-if="isNewBest" class="alert alert-warning py-2">
                <i class="fas fa-trophy me-2"></i>
                <strong>New Best Score!</strong>
              </div>

              <div class="text-muted small">Previous Best: {{ highscoreStore.localBestScore }}</div>
            </div>
          </div>

          <div class="modal-footer border-0 justify-content-center gap-4">
            <button type="button" class="btn btn-primary" @click="handlePlayAgain">
              Play Again
            </button>
            <button type="button" class="btn btn-secondary" @click="handleClose">Close</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal backdrop -->
    <div v-if="isVisible" class="modal-backdrop fade show"></div>
  </Teleport>
</template>

<style scoped>
.game-over-modal {
  z-index: 1055;
}

.modal-backdrop {
  z-index: 1050;
}

.modal-content {
  border: none;
  border-radius: 15px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.modal-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 15px 15px 0 0;
}

.score-summary .display-4 {
  font-size: 3rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.game-stats {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 1rem;
}

.btn-lg {
  padding: 0.75rem 2rem;
  border-radius: 25px;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

@media (max-width: 576px) {
  .modal-dialog {
    margin: 1rem;
  }

  .score-summary .display-4 {
    font-size: 2.5rem;
  }

  .btn-lg {
    padding: 0.5rem 1.5rem;
    font-size: 1rem;
  }
}
</style>
