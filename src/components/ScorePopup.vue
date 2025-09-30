<script setup lang="ts">
import { ref, watch } from 'vue'
import { useGameStore } from '@/stores/game'

const gameStore = useGameStore()

const currentAccolade = ref<string>('')
const isVisible = ref(false)
const lastScore = ref(0)

// Watch for score changes to show accolades
watch(
  () => gameStore.score,
  (newScore, oldScore) => {
    if (newScore > oldScore) {
      const pointsGained = newScore - oldScore

      // Only show accolades for significant score increases (line clearing)
      if (pointsGained >= 20) {
        const messages = ['👍 Awesome!!!', '👑 Excellent!!!', '⭐ Perfect!!!']
        const randomMessage = messages[Math.floor(Math.random() * messages.length)]

        currentAccolade.value = `${randomMessage} +${pointsGained}`
        isVisible.value = true

        // Hide after 800ms
        setTimeout(() => {
          isVisible.value = false
        }, 800)
      }
    }

    lastScore.value = newScore
  },
)
</script>

<template>
  <!-- Score Accolade -->
  <div class="score-accolades">
    <Transition name="slide-fade" appear>
      <div v-if="isVisible" class="alert alert-success score-popup">
        <i class="fas fa-star me-2"></i>
        {{ currentAccolade }}
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.score-accolades {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  max-width: 300px;
  pointer-events: none;
}

.score-popup {
  margin-bottom: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  border-radius: 25px;
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

/* Slide and fade transitions */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from {
  transform: translateX(100%) scale(0.8);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(100%) scale(0.8);
  opacity: 0;
}

.slide-fade-enter-to,
.slide-fade-leave-from {
  transform: translateX(0) scale(1);
  opacity: 1;
}

@media (max-width: 768px) {
  .score-accolades {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }

  .score-popup {
    text-align: center;
    font-size: 0.8rem;
  }
}

@media (max-width: 400px) {
  .score-popup {
    font-size: 0.75rem;
    padding: 0.5rem 1rem;
  }
}
</style>
