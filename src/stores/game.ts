import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'

import { type GameState, type PieceCoordinate } from '@/types/game'

export const NUM_AVAILABLE_PIECES = 3
export const MAX_NUM_PIECE_BLOCKS = 5

const STORAGE_KEY = 'blockpuzzle-game-state'

// The 19 predefined pieces as string patterns
export const PIECES = [
  'XXXXX', // 0: 5-block horizontal line
  'X\nX\nX\nX\nX', // 1: 5-block vertical line
  'XXXX', // 2: 4-block horizontal line
  'X\nX\nX\nX', // 3: 4-block vertical line
  'XXX\nXXX\nXXX', // 4: 3x3 square
  'X__\nX__\nXXX', // 5: 3-block L
  '__X\n__X\nXXX', // 6: 3-block L variant
  'XXX\nX__\nX__', // 7: 3-block L variant
  'XXX\n__X\n__X', // 8: 3-block L variant
  'X\nX\nX', // 9: 3-block vertical line
  'XXX', // 10: 3-block horizontal line
  'X_\nXX', // 11: 2-block L
  '_X\nXX', // 12: 2-block L variant
  'XX\nX_', // 13: 2-block L variant
  'XX\n_X', // 14: 2-block L variant
  'X\nX', // 15: 2-block vertical line
  'XX', // 16: 2-block horizontal line
  'XX\nXX', // 17: 2x2 square
  'X', // 18: single block
].map(parsePiecePattern)

// Local storage functions
function saveGameState(gameState: GameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState))
  } catch (error) {
    console.warn('Failed to save game state to localStorage:', error)
  }
}

function loadGameState(): GameState | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      // Validate the loaded state has required properties
      if (parsed.occupiedCells && parsed.availablePieces && typeof parsed.score === 'number') {
        return parsed as GameState
      }
    }
  } catch (error) {
    console.warn('Failed to load game state from localStorage:', error)
  }
  return null
}

export const useGameStore = defineStore('game', () => {
  // State
  const gridSize = ref(10)
  const occupiedCells = ref<boolean[]>([])
  const availablePieces = ref<number[]>([])
  const score = ref(0)

  // Computed
  const canMakeMove = computed(() => {
    for (let i = 0; i < NUM_AVAILABLE_PIECES; ++i) {
      if (availablePieces.value[i] < 0) continue

      for (let y = 0; y < gridSize.value; ++y) {
        for (let x = 0; x < gridSize.value; ++x) {
          if (canPlacePiece(i, x, y)) {
            return true
          }
        }
      }
    }

    return false
  })

  function initializeGame() {
    // Try to load saved game state first
    const savedState = loadGameState()
    if (savedState) {
      gridSize.value = savedState.gridSize
      occupiedCells.value = savedState.occupiedCells
      availablePieces.value = savedState.availablePieces
      score.value = savedState.score
      return
    }

    // If no saved state, start fresh
    // Clear occupied cells
    const n = gridSize.value * gridSize.value
    occupiedCells.value = new Array(n)
    for (let i = 0; i < n; ++i) {
      occupiedCells.value[i] = false
    }

    // Generate initial pieces
    generatePieces()

    score.value = 0
  }

  // Actions
  function newGame() {
    // Clear saved state
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.warn('Failed to clear saved game state:', error)
    }

    initializeGame()
  }

  function generatePieces() {
    const indices = []
    for (let i = 0; i < PIECES.length; ++i) {
      indices.push(i)
    }

    availablePieces.value = []
    for (let i = 0; i < NUM_AVAILABLE_PIECES; ++i) {
      const randomIndex = Math.floor(Math.random() * indices.length)
      availablePieces.value.push(indices[randomIndex]!)
      indices[randomIndex] = indices.pop()
    }
  }

  function getCellIndexAt(x: number, y: number) {
    return y * gridSize.value + x
  }

  function getPieceCoordinates(pieceIndex: number): PieceCoordinate[] {
    if (pieceIndex >= 0 && pieceIndex < PIECES.length) {
      return PIECES[pieceIndex]
    }
    return []
  }

  function canPlacePiece(index: number, startX: number, startY: number): boolean {
    const coordinates = getPieceCoordinates(availablePieces.value[index])

    for (const [x, y] of coordinates) {
      const targetX = startX + x
      const targetY = startY + y

      // Check bounds
      if (targetX < 0 || targetX >= gridSize.value || targetY < 0 || targetY >= gridSize.value) {
        return false
      }

      // Check if cell is already occupied
      if (occupiedCells.value[getCellIndexAt(targetX, targetY)]) {
        return false
      }
    }

    return true
  }

  function placePiece(index: number, startX: number, startY: number) {
    const pieceIndex = availablePieces.value[index]

    if (!canPlacePiece(index, startX, startY)) {
      return null
    }

    const coordinates = getPieceCoordinates(pieceIndex)

    // Add cells to occupied cells
    for (const [x, y] of coordinates) {
      const targetX = startX + x
      const targetY = startY + y
      occupiedCells.value[getCellIndexAt(targetX, targetY)] = true
    }

    // Mark piece as used (-1)
    availablePieces.value[index] = -1

    // Add placement points
    addScore(5)

    // Generate new pieces if all are used
    if (availablePieces.value.every((p) => p === -1)) {
      generatePieces()
    }

    return clearLines()
  }

  function clearLines() {
    let linesCleared = 0
    const cellIndicesToClear: Set<number> = new Set()

    // Check rows
    for (let y = 0; y < gridSize.value; y++) {
      let rowComplete = true
      for (let x = 0; x < gridSize.value; x++) {
        if (!occupiedCells.value[getCellIndexAt(x, y)]) {
          rowComplete = false
          break
        }
      }
      if (!rowComplete) continue

      linesCleared++

      // Add all cells in this row to clear list
      for (let x = 0; x < gridSize.value; x++) {
        cellIndicesToClear.add(getCellIndexAt(x, y))
      }
    }

    // Check columns
    for (let x = 0; x < gridSize.value; x++) {
      let colComplete = true
      for (let y = 0; y < gridSize.value; y++) {
        if (!occupiedCells.value[getCellIndexAt(x, y)]) {
          colComplete = false
          break
        }
      }
      if (!colComplete) continue

      linesCleared++

      // Add all cells in this column to clear list
      for (let y = 0; y < gridSize.value; y++) {
        cellIndicesToClear.add(getCellIndexAt(x, y))
      }
    }

    // Clear the cells from game state
    for (const cellIndex of cellIndicesToClear) {
      occupiedCells.value[cellIndex] = false
    }

    // Add line clearing points
    addScore(20 * Math.pow(linesCleared, 2))

    return cellIndicesToClear.size > 0 ? Array.from(cellIndicesToClear) : null
  }

  function addScore(points: number) {
    score.value += points
  }

  initializeGame()

  // Watch for changes and auto-save to localStorage
  watch(
    () => ({
      gridSize: gridSize.value,
      occupiedCells: occupiedCells.value,
      availablePieces: availablePieces.value,
      score: score.value,
    }),
    (gameState) => {
      saveGameState(gameState)
    },
    { deep: true },
  )

  return {
    // State
    gridSize,
    occupiedCells,
    availablePieces,
    score,

    // Computed
    canMakeMove,
    numAvailablePieces: computed(() =>
      availablePieces.value.reduce((acc, i) => acc + (i >= 0 ? 1 : 0), 0),
    ),

    // Actions
    newGame,
    canPlacePiece,
    placePiece,
  }
})

// Parse piece string patterns into coordinate arrays
function parsePiecePattern(pattern: string): PieceCoordinate[] {
  const lines = pattern.split('\n')
  const coordinates: PieceCoordinate[] = []

  for (let y = 0; y < lines.length; y++) {
    const line = lines[y]
    for (let x = 0; x < line.length; x++) {
      if (line[x] === 'X') {
        coordinates.push([x, y])
      }
    }
  }

  return coordinates
}
