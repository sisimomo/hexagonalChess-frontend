export enum GameStateDto {
  IN_PROGRESS = 'inProgress',
  WHITE_WON = 'whiteWon',
  BLACK_WON = 'blackWon',
  WHITE_IN_CHECK = 'whiteInCheck',
  BLACK_IN_CHECK = 'blackInCheck',
  DRAW_STALEMATE = 'drawStalemate',
  DRAW_INSUFFICIENT_MATERIAL = 'drawInsufficientMaterial',
  DRAW_THREEFOLD_REPETITION = 'drawThreefoldRepetition',
}
