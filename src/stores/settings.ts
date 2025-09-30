import { defineStore } from 'pinia'
import { ref } from 'vue'

interface StoredSettings {
  animationsEnabled: boolean
  soundEnabled: boolean
}

export const useSettingsStore = defineStore('settings', () => {
  // State
  const animationsEnabled = ref(true)
  const soundEnabled = ref(false)

  // Actions
  function toggleSound() {
    soundEnabled.value = !soundEnabled.value
    saveToStorage()
  }

  function toggleAnimations() {
    animationsEnabled.value = !animationsEnabled.value
    saveToStorage()
  }

  function saveToStorage() {
    try {
      localStorage.setItem(
        'blockpuzzle-settings',
        JSON.stringify({
          animationsEnabled: animationsEnabled.value,
          soundEnabled: soundEnabled.value,
        }),
      )
    } catch (error) {
      console.warn('Failed to save settings to localStorage:', error)
    }
  }

  function loadFromStorage() {
    try {
      // Load from localStorage first
      const settingsData: StoredSettings = JSON.parse(
        localStorage.getItem('blockpuzzle-settings') ?? 'null',
      )

      if (settingsData) {
        animationsEnabled.value = settingsData.animationsEnabled
        soundEnabled.value = settingsData.soundEnabled
      }
    } catch (error) {
      console.warn('Failed to load from localStorage, trying cookies:', error)
    }
  }

  function resetSettings() {
    soundEnabled.value = false
    animationsEnabled.value = true
    saveToStorage()
  }

  // Initialize settings on store creation
  loadFromStorage()

  return {
    // State
    soundEnabled,
    animationsEnabled,

    // Actions
    toggleSound,
    toggleAnimations,
    saveToStorage,
    loadFromStorage,
    resetSettings,
  }
})
