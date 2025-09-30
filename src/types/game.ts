export type PieceCoordinate = [x: number, y: number]

export interface GameState {
  gridSize: number
  occupiedCells: boolean[]
  availablePieces: number[] // indices into global piece definitions, -1 for used pieces
  score: number
}
