export enum PieceType {
  BISHOP = 'B',
  KING = 'K',
  KNIGHT = 'N',
  PAWN = 'P',
  QUEEN = 'Q',
  ROOK = 'R',
}

export function pieceTypeToPieceNotation(pieceType: PieceType): string {
  if (pieceType === PieceType.PAWN) {
    return '';
  }
  return pieceType;
}
