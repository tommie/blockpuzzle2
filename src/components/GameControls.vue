<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { useSettingsStore } from '@/stores/settings'
import { useId } from 'vue'

const gameStore = useGameStore()
const settingsStore = useSettingsStore()

const animId = useId()
const soundId = useId()

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

    <input
      type="checkbox"
      class="btn-check"
      :id="animId"
      :value="settingsStore.animationsEnabled"
      @change="toggleAnimations"
    />
    <label class="btn btn-secondary" :for="animId">
      <i class="bi bi-film" />
    </label>

    <input
      type="checkbox"
      class="btn-check"
      :id="soundId"
      :value="settingsStore.soundEnabled"
      @change="toggleSound"
    />
    <label class="btn btn-secondary" :for="soundId">
      <i v-if="settingsStore.soundEnabled" class="bi bi-volume-up-fill" />
      <i v-else class="bi bi-volume-mute-fill" />
    </label>
  </div>
</template>
