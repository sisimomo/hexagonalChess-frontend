export class WantedPromotionPieceTypeNotProvidedException extends Error {
  constructor() {
    super('The type of the wanted Piece for the promotion was not provided');
  }
}
