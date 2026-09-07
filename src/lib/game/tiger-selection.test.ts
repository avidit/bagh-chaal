import { describe, expect, it } from 'vitest';
import { applyMove, createGame, getLegalMoves, moveTarget } from './engine';

describe('tiger selection targets', () => {
  it('does not list occupied tiger squares as move targets', () => {
    let game = createGame({ variant: 'standard', humanSide: 'tiger' });
    game = applyMove(game, getLegalMoves(game)[0]);
    const moves = getLegalMoves(game);
    const targets = new Set(moves.map((move) => moveTarget(move)));

    expect(game.pieces.n0).toBe('tiger');
    expect(game.pieces.n4).toBe('tiger');
    expect(targets.has('n4')).toBe(false);
    expect(targets.has('n0')).toBe(false);
  });
});
