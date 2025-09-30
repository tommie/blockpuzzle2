import { defineStore } from 'pinia'
import { ref } from 'vue'

interface StoredScoreData {
  localBest: number
  localBestTimestamp: number
}

export const useHighscoreStore = defineStore('highscore', () => {
  // State
  const localBestScore = ref(0)
  const localBestTimestamp = ref(-1)

  function updateScore(newScore: number) {
    if (newScore > localBestScore.value) {
      localBestScore.value = newScore
      saveToStorage()
    }
  }

  function saveToStorage() {
    try {
      localStorage.setItem(
        'blockpuzzle-score',
        JSON.stringify({
          localBest: localBestScore.value,
          localBestTimestamp: localBestTimestamp.value,
        } satisfies StoredScoreData),
      )
    } catch (error) {
      console.warn('Failed to save highscore to localStorage:', error)
    }
  }

  function loadFromStorage() {
    try {
      const scoreData: StoredScoreData = JSON.parse(
        localStorage.getItem('blockpuzzle-score') ?? 'null',
      )

      if (scoreData) {
        localBestScore.value = scoreData.localBest
        localBestTimestamp.value = scoreData.localBestTimestamp
      }
    } catch (error) {
      console.warn('Failed to load from localStorage:', error)
    }
  }

  function resetLocalScore() {
    localBestScore.value = 0
    localBestTimestamp.value = -1
    saveToStorage()
  }

  loadFromStorage()

  return {
    // State
    localBestScore,

    // Actions
    updateScore,
    saveToStorage,
    loadFromStorage,
    resetLocalScore,
  }
})
