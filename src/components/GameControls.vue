<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { useSettingsStore } from '@/stores/settings'

const gameStore = useGameStore()
const settingsStore = useSettingsStore()

function handleNewGame() {
  gameStore.newGame()
}

function toggleAnimations() {
  settingsStore.toggleAnimations()
}

function toggleSound() {
  settingsStore.toggleSound()
}
</script>

<template>
  <div class="d-flex justify-content-center gap-3">
    <button @click="handleNewGame" class="btn btn-primary" :disabled="false">New Game</button>

    <button
      class="btn"
      :class="[settingsStore.animationsEnabled ? 'btn-light' : 'btn-outline-light']"
      @click="toggleAnimations"
    >
      Animations
    </button>

    <button
      class="btn"
      :class="[settingsStore.soundEnabled ? 'btn-light' : 'btn-outline-light']"
      @click="toggleSound"
    >
      Sound
    </button>
  </div>
</template>
