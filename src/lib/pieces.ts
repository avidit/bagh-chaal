import goatPiece from '../assets/goat.svg';
import tigerPiece from '../assets/tiger.svg';
import type { Piece } from '$lib/game/types';

/** Matched 512×512 SVGs — sharp at any board size. */
export const pieceImages: Record<Piece, string> = {
  goat: goatPiece,
  tiger: tigerPiece
};
