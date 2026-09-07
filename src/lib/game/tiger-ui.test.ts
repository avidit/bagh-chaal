import { describe, expect, it } from 'vitest';
import { applyMove, createGame, getLegalMoves, moveSource, moveTarget } from './engine';
import { getStandardTigerLegalMoves, resolveStandardTiger } from './tiger-ui';
import type { GameState } from './types';

function finishPlacement(state: ReturnType<typeof createGame>) {
  let game = state;
  while (game.phase === 'placement' && game.goatsToPlace > 0) {
    const placement = getLegalMoves(game)[0];
    if (!placement) break;
    game = applyMove(game, placement);
  }
  return game;
}

describe('standard tiger UI move filtering', () => {
  it('filters all moves to one active tiger when selection is missing', () => {
    const game = finishPlacement(createGame({ variant: 'standard', humanSide: 'tiger' }));
    const all = getLegalMoves(game);
    const movableTigers = [...new Set(all.map((move) => moveSource(move)))];
    expect(movableTigers.length).toBeGreaterThan(1);

    const filtered = getStandardTigerLegalMoves(game, null, null);
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.length).toBeLessThan(all.length);
    expect(filtered.every((move) => moveSource(move) === moveSource(filtered[0]))).toBe(true);
  });

  it('only shows moves for the selected tiger', () => {
    const game = finishPlacement(createGame({ variant: 'standard', humanSide: 'tiger' }));
    const all = getLegalMoves(game);
    const movableTigers = [...new Set(all.map((move) => moveSource(move)))];
    const selected = movableTigers[1] ?? movableTigers[0]!;

    const filtered = getStandardTigerLegalMoves(game, selected, null);
    expect(filtered.every((move) => moveSource(move) === selected)).toBe(true);
    expect(filtered.length).toBe(all.filter((move) => moveSource(move) === selected).length);
  });

  it('hides another tiger capture when a different tiger is selected', () => {
    const game: GameState = {
      ...createGame({ variant: 'standard', humanSide: 'tiger' }),
      phase: 'placement',
      turn: 'tiger',
      pieces: {
        n0: 'tiger',
        n8: 'tiger',
        n6: 'tiger',
        n11: 'goat',
        n22: 'goat'
      },
      goatsRemaining: 18,
      goatsOnBoard: 2,
      goatsToPlace: 18
    };

    expect(
      getStandardTigerLegalMoves(game, 'n6', null).some((move) => moveTarget(move) === 'n16')
    ).toBe(true);
    expect(
      getStandardTigerLegalMoves(game, 'n8', null).some((move) => moveTarget(move) === 'n16')
    ).toBe(false);
  });

  it('prefers the selected tiger over the last moved tiger', () => {
    const game: GameState = {
      ...createGame({ variant: 'standard', humanSide: 'tiger' }),
      phase: 'movement',
      turn: 'tiger',
      pieces: { n0: 'tiger', n4: 'tiger' },
      goatsToPlace: 0
    };

    expect(resolveStandardTiger(game, 'n4', 'n0')).toBe('n4');
    expect(resolveStandardTiger(game, null, 'n0')).toBe('n0');
  });
});
