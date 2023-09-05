/*
The only reason for this file to exist is pure horror:
Without it rollup can make the bundling fail at any point in time; when it rolls up the files in the wrong order
it will cause undefined errors (for example because super classes or local variables not being hoisted).
With this file that will still happen,
but at least in this file we can magically reorder the imports with trial and error until the build succeeds again.

See:
https://medium.com/visual-development/how-to-fix-nasty-circular-dependency-issues-once-and-for-all-in-javascript-typescript-a04c987cf0de#9afb
*/

export * from './enumeration/gameState';
export * from './enumeration/pieceSide';
export * from './enumeration/pieceType';
export * from './exception/movementNotAllowedException';
export * from './exception/multiplePiecesFoundRuntimeException';
export * from './exception/notYourTurnException';
export * from './exception/pieceNotFoundOnGameBoardException';
export * from './exception/promotionNotAllowedException';
export * from './exception/wantedPromotionPieceTypeNotProvidedException';
export * from './constant';
export * from './coordinate';
export * from './piece/possibleMovement';
export * from './piece/piece';
export * from './piece/king';
export * from './piece/bishop';
export * from './piece/knight';
export * from './piece/pawn';
export * from './piece/queen';
export * from './piece/rook';
export * from './game';
export * from './exception/gameOverException';
