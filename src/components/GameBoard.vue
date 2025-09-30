<script setup lang="ts">
import { ref, onMounted, onUnmounted, shallowRef, watch, computed } from 'vue'
import * as PIXI from 'pixi.js'

import { easeIn, easeOut, interp, useAnimations } from '@/animation'
import { useAudio } from '@/audio'
import blockImage from '@/assets/block.png'
import { NUM_AVAILABLE_PIECES, PIECES, useGameStore } from '@/stores/game'

declare module 'pixi.js' {
  interface Container {
    userData?: {
      index: number
      pieceIndex: number
    }
  }
}

interface DraggedPiece {
  index: number
  offset: PIXI.PointData
  container: PIXI.Container
  gridGraphics: PIXI.Graphics
  animation?: {
    ease: (v: number) => number
    scale: [from: number, to: number]
    point?: [from: PIXI.PointData, to: PIXI.PointData]
  }
}

const GRID_PADDING = 20
const GRID_LINE_COLOR = 0x4477ff
const SCALE_ANIMATION_DURATION = 150 // milliseconds
const CLEAR_ANIMATION_DURATION = 250 // milliseconds
const NEW_PIECES_ANIMATION_DURATION = 300 // milliseconds

const gameStore = useGameStore()
const audio = useAudio()

const containerRef = shallowRef<HTMLElement>()
const canvasRef = shallowRef<HTMLCanvasElement>()
const app = shallowRef<PIXI.Application | null>(null)
const animations = useAnimations(app)
let blockTexture: PIXI.Texture | null = null

// Grid and piece rendering variables
const gridSize = ref(NaN)
const gridBlockSize = computed(() => gridSize.value / gameStore.gridSize)
const pickupScale = computed(
  () => gridSize.value / NUM_AVAILABLE_PIECES / (5 + 2) / gridBlockSize.value,
)

const gridContainer = new PIXI.Container()
const piecesContainer = new PIXI.Container()
const dragPreviewContainer = new PIXI.Container()
const gridPreviewContainer = new PIXI.Container()
const gridBackground = new PIXI.Graphics()
const gridLines = new PIXI.Graphics()
const occupiedCellSprites: PIXI.Sprite[] = []

// Drag and drop state
const dragged = shallowRef<DraggedPiece>()
let clearingCells: number[] | null = null

onMounted(async () => {
  app.value = new PIXI.Application()

  await app.value.init({
    canvas: canvasRef.value!,
    backgroundAlpha: 0,
    antialias: true,
    resolution: window.devicePixelRatio,
    autoDensity: true,
    resizeTo: containerRef.value!,
  })

  window.addEventListener('resize', handleResize)

  blockTexture = await PIXI.Assets.load(blockImage)

  setupContainers()
  updateOccupiedCells()
  handleResize()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)

  app.value?.destroy(true)
  app.value = null
})

function setupContainers() {
  if (!app.value || !blockTexture) return

  gridContainer.addChild(gridBackground)
  gridContainer.addChild(gridLines)

  for (let y = 0; y < gameStore.gridSize; y++) {
    for (let x = 0; x < gameStore.gridSize; x++) {
      const sprite = new PIXI.Sprite(blockTexture)

      // Position and size is set in updateCellSizes
      sprite.visible = false
      gridContainer.addChild(sprite)
      occupiedCellSprites.push(sprite)
    }
  }

  gridContainer.addChild(gridPreviewContainer)

  app.value.stage.addChild(gridContainer)

  // Create persistent piece containers
  for (let i = 0; i < NUM_AVAILABLE_PIECES; ++i) {
    const container = new PIXI.Container()
    container.eventMode = 'static'
    container.cursor = 'grab'
    container.userData = {
      index: i,
      pieceIndex: -1,
    }

    piecesContainer.addChild(container)
  }

  app.value.stage.addChild(piecesContainer)

  dragPreviewContainer.eventMode = 'static'
  dragPreviewContainer.cursor = 'grabbing'

  app.value.stage.addChild(dragPreviewContainer)

  // Set up global interaction
  app.value.stage.eventMode = 'static'
  app.value.stage.hitArea = app.value.renderer.screen
  app.value.stage.on('pointerdown', onPointerDown)
  app.value.stage.on('pointermove', onPointerMove)
  app.value.stage.on('pointerup', onPointerUp)
  app.value.stage.on('pointerupoutside', onPointerUp)
}

function handleResize() {
  if (!app.value) return

  gridSize.value = Math.min(app.value.renderer.width, app.value.renderer.height) - 2 * GRID_PADDING

  updateContainerLayout()
  updateGridBackground()
  updateGridLines()
  updateCellSizes()
  updateAvailablePieces()
}

function updateContainerLayout() {
  if (!app.value) return

  const width = app.value.renderer.width
  const height = app.value.renderer.height

  gridContainer.x = width >= height ? GRID_PADDING : (width - gridSize.value) / 2
  gridContainer.y = width >= height ? (height - gridSize.value) / 2 : GRID_PADDING

  piecesContainer.x = width >= height ? gridSize.value + 3 * GRID_PADDING : GRID_PADDING
  piecesContainer.y = width >= height ? GRID_PADDING : gridSize.value + 3 * GRID_PADDING
}

function updateGridBackground() {
  gridBackground.clear()
  gridBackground.rect(0, 0, gridSize.value, gridSize.value)
  gridBackground.fill({ color: 0xffffff, alpha: 0.6 })
}

function updateGridLines() {
  gridLines.clear()

  // Vertical lines
  for (let x = 1; x < gameStore.gridSize; x++) {
    gridLines.moveTo(x * gridBlockSize.value, 0)
    gridLines.lineTo(x * gridBlockSize.value, gridSize.value)
    gridLines.stroke({ width: x === 0 || x === gameStore.gridSize ? 2 : 1, color: GRID_LINE_COLOR })
  }

  // Horizontal lines
  for (let y = 1; y < gameStore.gridSize; y++) {
    gridLines.moveTo(0, y * gridBlockSize.value)
    gridLines.lineTo(gridSize.value, y * gridBlockSize.value)
    gridLines.stroke({ width: y === 0 || y === gameStore.gridSize ? 2 : 1, color: GRID_LINE_COLOR })
  }
}

function updateCellSizes() {
  // Update size and position based on grid size
  for (let i = 0; i < occupiedCellSprites.length; ++i) {
    const x = i % gameStore.gridSize
    const y = Math.floor(i / gameStore.gridSize)
    const sprite = occupiedCellSprites[i]

    sprite.x = (x + 0.5) * gridBlockSize.value
    sprite.y = (y + 0.5) * gridBlockSize.value
    sprite.width = gridBlockSize.value
    sprite.height = gridBlockSize.value

    sprite.pivot.set(gridBlockSize.value / sprite.scale.x / 2)
  }
}

function updateOccupiedCells() {
  for (let i = 0; i < occupiedCellSprites.length; i++) {
    occupiedCellSprites[i].visible = gameStore.occupiedCells[i] || !!clearingCells?.includes(i)
  }
}

async function updateAvailablePieces() {
  if (!blockTexture || !app.value) return

  const width = app.value.renderer.width
  const height = app.value.renderer.height

  const animationPromises: Promise<void>[] = []

  gameStore.availablePieces.forEach((pieceIndex, i) => {
    const container = piecesContainer.getChildAt<PIXI.ContainerChild>(i)
    const wasVisible = container.visible

    container.visible = pieceIndex >= 0

    container.removeChildren()

    if (pieceIndex < 0) return

    const maxAlong = PIECES[pieceIndex].reduce(
      (acc, [x, y]) => Math.max(acc, (width >= height ? y : x) + 1),
      0,
    )

    // Draw piece blocks
    for (const [x, y] of PIECES[pieceIndex]) {
      const blockSprite = new PIXI.Sprite(blockTexture!)

      blockSprite.width = gridBlockSize.value
      blockSprite.height = gridBlockSize.value
      blockSprite.x = x * gridBlockSize.value
      blockSprite.y = y * gridBlockSize.value

      container.addChild(blockSprite)
    }

    container.scale = pickupScale.value
    container.pivot.set(
      width >= height ? 0 : (maxAlong * gridBlockSize.value) / 2,
      width >= height ? (maxAlong * gridBlockSize.value) / 2 : 0,
    )

    container.userData!.pieceIndex = pieceIndex

    // If this piece was invisible but is now becoming visible, animate it
    if (!wasVisible && container.visible) {
      container.scale.set(0)
      container.alpha = 0
      animationPromises.push(
        (async () => {
          await animateNewPiece(container)
          container.scale.set(pickupScale.value)
          container.alpha = 1
        })(),
      )
    }
  })

  // Wait for all animations to complete
  await Promise.all(animationPromises)

  updateAvailablePiecesBounds()
}

function updateAvailablePiecesBounds() {
  if (!app.value) return

  const width = app.value.renderer.width
  const height = app.value.renderer.height
  const pieceSpacing = gridSize.value / NUM_AVAILABLE_PIECES

  const along = 5 * gridBlockSize.value
  const across = (5 + 2) * gridBlockSize.value
  const w = width >= height ? across : along
  const h = width >= height ? along : across

  for (let i = 0; i < piecesContainer.children.length; ++i) {
    const container = piecesContainer.getChildAt<PIXI.ContainerChild>(i)
    const bounds = container.getBounds()
    container.hitArea = new PIXI.Rectangle(
      width >= height ? 0 : -(5 * gridBlockSize.value - bounds.width / pickupScale.value) / 2,
      width >= height ? -(5 * gridBlockSize.value - bounds.height / pickupScale.value) / 2 : 0,
      w,
      h,
    )

    // Position piece in pieces area
    const along = (i + 0.5) * pieceSpacing
    container.x = width >= height ? 0 : along
    container.y = width >= height ? along : 0
  }
}

async function animateNewPiece(container: PIXI.Container) {
  await animations.animate((elapsed: number) => {
    const easeProgress = easeIn(elapsed / NEW_PIECES_ANIMATION_DURATION)

    // Scale up from 0 to 1 and fade in
    container.scale.set(interp(easeProgress, 0, pickupScale.value))
    container.alpha = interp(easeProgress, 0, 1)

    return easeProgress >= 1
  })
}

// Drag and Drop Event Handlers
function onPointerDown(event: PIXI.FederatedPointerEvent) {
  // Check if we clicked on a piece
  if (event.target.parent !== piecesContainer) return

  const pieceData = event.target.userData
  if (!pieceData) return

  startDrag(pieceData.index, event.global, event.target.toLocal(event.global))

  // Prevent event from bubbling
  event.stopPropagation()
}

function onPointerMove(event: PIXI.FederatedPointerEvent) {
  if (!dragged.value) return

  updateDragPreview(event.global, dragged.value)
  updateGridPreview(event.global, dragged.value)
}

function onPointerUp(event: PIXI.FederatedPointerEvent) {
  if (!dragged.value) return

  endDrag(event.global, dragged.value)
}

async function startDrag(index: number, global: PIXI.PointData, offset: PIXI.PointData) {
  if (!blockTexture) return

  dragged.value = {
    index,
    offset,
    container: new PIXI.Container(),
    gridGraphics: new PIXI.Graphics(),
    animation: {
      ease: easeOut,
      scale: [pickupScale.value, 1],
    },
  }

  // Create sprites at pickup size initially for animation
  for (const [x, y] of PIECES[gameStore.availablePieces[index]]) {
    const blockSprite = new PIXI.Sprite(blockTexture)

    blockSprite.width = gridBlockSize.value
    blockSprite.height = gridBlockSize.value
    blockSprite.x = x * gridBlockSize.value
    blockSprite.y = y * gridBlockSize.value
    blockSprite.alpha = 0.8

    dragged.value.container.addChild(blockSprite)
  }

  dragged.value.container.pivot.copyFrom(offset)

  dragPreviewContainer.addChild(dragged.value.container)
  gridPreviewContainer.addChild(dragged.value.gridGraphics)

  piecesContainer.getChildAt<PIXI.ContainerChild>(index).visible = false

  updateDragPreview(global, dragged.value)

  await animations.animate(animateDrag)
}

function updateDragPreview(global: PIXI.PointData, piece: DraggedPiece) {
  const localPos = dragPreviewContainer.toLocal(global)

  // Always position container at cursor
  piece.container.x = localPos.x
  piece.container.y = localPos.y
}

function animateDrag(elapsed: number) {
  if (!dragged.value?.animation) return true

  const animation = dragged.value.animation

  dragged.value.container.scale.set(
    interp(
      animation.ease(elapsed / SCALE_ANIMATION_DURATION),
      animation.scale[0],
      animation.scale[1],
    ),
  )

  if (animation.point) {
    dragged.value.container.position.set(
      interp(
        animation.ease(elapsed / SCALE_ANIMATION_DURATION),
        animation.point[0].x,
        animation.point[1].x,
      ),
      interp(
        animation.ease(elapsed / SCALE_ANIMATION_DURATION),
        animation.point[0].y,
        animation.point[1].y,
      ),
    )
  }

  return elapsed >= SCALE_ANIMATION_DURATION
}

function globalToGrid(global: PIXI.PointData, offset: PIXI.PointData) {
  const gridPos = gridContainer.toLocal(global)

  // Convert to grid coordinates, accounting for pointer offset
  const gridX = Math.round(gridPos.x / gridBlockSize.value - offset.x / gridBlockSize.value)
  const gridY = Math.round(gridPos.y / gridBlockSize.value - offset.y / gridBlockSize.value)

  return new PIXI.Point(gridX, gridY)
}

function updateGridPreview(global: PIXI.PointData, piece: DraggedPiece) {
  // Check if placement is valid
  const grid = globalToGrid(global, piece.offset)

  piece.gridGraphics.x = grid.x * gridBlockSize.value
  piece.gridGraphics.y = grid.y * gridBlockSize.value

  const canPlace = gameStore.canPlacePiece(piece.index, grid.x, grid.y)
  const previewColor = canPlace ? 0x00ff00 : 0xff0000

  piece.gridGraphics.clear()

  for (const [x, y] of PIECES[gameStore.availablePieces[piece.index]]) {
    // TODO: can we use clipping instead of having to check for blocks outside the grid?
    if (
      grid.x + x < 0 ||
      grid.x + x >= gameStore.gridSize ||
      grid.y + y < 0 ||
      grid.y + y >= gameStore.gridSize
    ) {
      continue
    }

    piece.gridGraphics.rect(
      x * gridBlockSize.value + 1,
      y * gridBlockSize.value + 1,
      gridBlockSize.value - 2,
      gridBlockSize.value - 2,
    )
    piece.gridGraphics.fill({ color: previewColor, alpha: 0.1 })
  }
}

async function animateClearedCells(cellIndices: number[]) {
  clearingCells = cellIndices

  try {
    // Get the sprites that need to be animated
    const spritesToAnimate = cellIndices.map((index) => occupiedCellSprites[index])
    const origScale = spritesToAnimate[0].scale.clone()

    // Animate the sprites
    await animations.animate((elapsed: number) => {
      const easeProgress = easeOut(elapsed / CLEAR_ANIMATION_DURATION)

      for (const sprite of spritesToAnimate) {
        // Scale down to 1e-2 and fade out
        sprite.scale.set(interp(easeProgress, origScale.x, origScale.x * 1e-2))
        sprite.alpha = interp(easeProgress, 1, 0)
      }

      return easeProgress >= 1
    })

    // Reset sprites to normal state
    for (const sprite of spritesToAnimate) {
      sprite.scale.copyFrom(origScale)
      sprite.alpha = 1
    }
  } finally {
    clearingCells = null

    updateOccupiedCells()
  }
}

async function endDrag(global: PIXI.PointData, piece: DraggedPiece) {
  // Clear grid preview
  gridPreviewContainer.removeChildren()

  const grid = globalToGrid(global, piece.offset)

  const placing = gameStore.canPlacePiece(piece.index, grid.x, grid.y)

  if (placing) {
    const toPoint = dragPreviewContainer.toLocal(
      occupiedCellSprites[grid.y * gameStore.gridSize + grid.x].toGlobal({ x: 0, y: 0 }),
    )
    toPoint.x += piece.offset.x
    toPoint.y += piece.offset.y

    piece.animation = {
      ease: easeIn,
      scale: [1, 1],
      point: [piece.container.position.clone(), toPoint],
    }
  } else {
    const toPoint = dragPreviewContainer.toLocal(
      piecesContainer.getChildAt<PIXI.ContainerChild>(piece.index).toGlobal({ x: 0, y: 0 }),
    )
    toPoint.x += piece.offset.x * pickupScale.value
    toPoint.y += piece.offset.y * pickupScale.value

    piece.animation = {
      ease: easeOut,
      scale: [1, pickupScale.value],
      point: [piece.container.position.clone(), toPoint],
    }
  }

  try {
    await animations.animate(animateDrag)
  } finally {
    // Clear drag preview
    dragPreviewContainer.removeChildren()

    dragged.value = undefined

    if (placing) {
      const clearedCells = gameStore.placePiece(piece.index, grid.x, grid.y)

      // Play successful placement sound
      audio.playSound('drop')

      if (clearedCells) {
        // Play line clearing sound
        audio.playSound('solved')

        // This temporarily enables visibility for cleared cells.
        await animateClearedCells(clearedCells)
      }

      // Check for game over after placement
      if (!gameStore.canMakeMove) {
        audio.playSound('lose')
      }
    } else {
      // Play invalid placement sound
      audio.playSound('wrong')
      piecesContainer.getChildAt<PIXI.ContainerChild>(piece.index).visible = true
    }
  }
}

watch(
  () => gameStore.occupiedCells,
  () => updateOccupiedCells(),
  { deep: true },
)
watch(
  () => gameStore.availablePieces,
  () => updateAvailablePieces(),
  { deep: true },
)
</script>

<template>
  <main class="flex-fill d-flex">
    <div ref="containerRef" class="game-canvas mw-100 position-relative">
      <canvas ref="canvasRef" class="position-absolute" />
    </div>
  </main>
</template>

<style scoped>
/* Portrait orientation - taller canvas (game board above, shapes below) */
@media (orientation: portrait) {
  .game-canvas {
    aspect-ratio: 10/14;
  }
}

/* Landscape orientation - wider canvas (game board left, shapes right) */
@media (orientation: landscape) {
  .game-canvas {
    aspect-ratio: 14/10;
  }
}
</style>
