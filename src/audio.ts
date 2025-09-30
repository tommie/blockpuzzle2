import { onMounted } from 'vue'

import { useSettingsStore } from '@/stores/settings'

import dropSound from '@/assets/audio/drop.mp3'
import solvedSound from '@/assets/audio/solved.mp3'
import wrongSound from '@/assets/audio/wrong.mp3'
import loseSound from '@/assets/audio/lose.mp3'

export type SoundEffect = 'drop' | 'solved' | 'wrong' | 'lose'

export function useAudio() {
  const settingsStore = useSettingsStore()
  let audioInstances: Record<SoundEffect, HTMLAudioElement>

  function createInstance(url: string, volume: number) {
    const audio = new Audio(url)
    audio.preload = 'auto'
    audio.volume = volume
    return audio
  }

  function initializeAudio() {
    audioInstances = {
      drop: createInstance(dropSound, 0.01),
      solved: createInstance(solvedSound, 1),
      wrong: createInstance(wrongSound, 1),
      lose: createInstance(loseSound, 1),
    }
  }

  // Preload audio
  onMounted(() => initializeAudio())

  return {
    // Play a sound effect
    playSound(effect: SoundEffect) {
      if (!settingsStore.soundEnabled) return

      const audio = audioInstances[effect]
      if (!audio) return

      try {
        audio.currentTime = 0 // Reset to beginning
        audio.play().catch((error) => {
          console.warn(`Failed to play sound effect '${effect}':`, error)
        })
      } catch (error) {
        console.warn(`Failed to play sound effect '${effect}':`, error)
      }
    },
  }
}
