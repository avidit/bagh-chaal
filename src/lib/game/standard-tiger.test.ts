import { describe, expect, it } from 'vitest';
import { applyMove, createGame, getLegalMoves, moveSource, moveTarget } from './engine';
import type { GameState, Move } from './types';

function finishPlacement(state: GameState): GameState {
  let game = state;
  while (game.phase === 'placement' && game.goatsToPlace > 0) {
    const placement = getLegalMoves(game)[0];
    if (!placement) break;
    game = applyMove(game, placement);
  }
  return game;
}

function resolveMoveToNode(
  legalMoves: Move[],
  nodeId: string,
  selected: string | null
): Move | undefined {
  const candidates = legalMoves.filter((candidate) => moveTarget(candidate) === nodeId);
  if (candidates.length === 0) return undefined;
  if (candidates.length === 1) return candidates[0];
  if (selected) {
    return candidates.find((candidate) => moveSource(candidate) === selected);
  }
  return undefined;
}

describe('standard board tiger movement', () => {
  it('reaches movement phase with tiger to move after placement', () => {
    const game = finishPlacement(createGame({ variant: 'standard', humanSide: 'tiger' }));
    expect(game.phase).toBe('movement');
    expect(game.turn).toBe('tiger');
    expect(getLegalMoves(game).length).toBeGreaterThan(0);
  });

  it('reports how many destinations are ambiguous on the first tiger turn', () => {
    const game = finishPlacement(createGame({ variant: 'standard', humanSide: 'tiger' }));
    const legalMoves = getLegalMoves(game);
    const byTarget = new Map<string, string[]>();

    for (const move of legalMoves) {
      const target = moveTarget(move);
      const from = moveSource(move)!;
      const sources = byTarget.get(target) ?? [];
      sources.push(from);
      byTarget.set(target, sources);
    }

    const ambiguous = [...byTarget.entries()].filter(([, sources]) => sources.length > 1);
    expect(legalMoves.length).toBeGreaterThan(0);
    expect(ambiguous.length).toBeGreaterThan(0);
  });

  it('filters destinations to the selected tiger', () => {
    const game = finishPlacement(createGame({ variant: 'standard', humanSide: 'tiger' }));
    const all = getLegalMoves(game);
    const movableTigers = [...new Set(all.map((move) => moveSource(move)))];
    expect(movableTigers.length).toBeGreaterThan(1);

    const selected = movableTigers[0]!;
    const filtered = all.filter((move) => moveSource(move) === selected);
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((move) => moveSource(move) === selected)).toBe(true);
  });

  it('moves when the selected tiger matches the destination', () => {
    const game = finishPlacement(createGame({ variant: 'standard', humanSide: 'tiger' }));
    const legalMoves = getLegalMoves(game);
    const move = legalMoves[0];
    const from = moveSource(move)!;
    const resolved = resolveMoveToNode(legalMoves, moveTarget(move), from);
    expect(resolved).toEqual(move);
    const next = applyMove(game, resolved!);
    expect(next.pieces[moveTarget(move)]).toBe('tiger');
    expect(next.pieces[from]).toBeUndefined();
  });
});
