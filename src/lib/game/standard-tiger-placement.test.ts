import { describe, expect, it } from 'vitest';
import { applyMove, createGame, getLegalMoves, moveSource, moveTarget } from './engine';

describe('standard board tiger during placement', () => {
  it('allows tiger to move on its turn before all goats are placed', () => {
    let game = createGame({ variant: 'standard', humanSide: 'tiger' });
    expect(game.phase).toBe('placement');
    expect(game.turn).toBe('goat');

    game = applyMove(game, getLegalMoves(game)[0]);
    expect(game.turn).toBe('tiger');
    expect(game.phase).toBe('placement');
    expect(game.goatsToPlace).toBe(19);

    const moves = getLegalMoves(game);
    expect(moves.length).toBeGreaterThan(0);
    expect(moves.every((move) => move.kind === 'move' || move.kind === 'jump')).toBe(true);

    const move = moves.find((candidate) => moveSource(candidate) === 'n0');
    expect(move).toBeDefined();

    const next = applyMove(game, move!);
    expect(next.pieces[moveTarget(move!)]).toBe('tiger');
    expect(next.pieces.n0).toBeUndefined();
    expect(next.turn).toBe('goat');
  });
});
