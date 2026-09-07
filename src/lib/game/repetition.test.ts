import { describe, expect, it } from 'vitest';
import { applyMove, createGame, getWinSummary, positionKey } from './engine';
import type { Move } from './types';

const cycle: Move[] = [
  { kind: 'move', from: 'a', to: 'b' },
  { kind: 'move', from: 'i', to: 'f' },
  { kind: 'move', from: 'b', to: 'a' },
  { kind: 'move', from: 'f', to: 'i' }
];

describe('threefold repetition', () => {
  it('declares a draw when the same position occurs three times', () => {
    let game = createGame({ variant: 'mini', humanSide: 'goat' });
    const startKey = positionKey(game);

    for (const move of [...cycle, ...cycle]) {
      game = applyMove(game, move);
    }

    expect(positionKey(game)).toBe(startKey);
    expect(game.positionCounts[startKey]).toBe(3);
    expect(game.winner).toBe('draw');
    expect(getWinSummary(game)).toMatchObject({
      winner: 'draw',
      reason: 'repetition',
      title: 'Draw'
    });
  });

  it('does not draw after only two repetitions', () => {
    let game = createGame({ variant: 'mini', humanSide: 'goat' });
    const startKey = positionKey(game);

    for (const move of cycle) {
      game = applyMove(game, move);
    }

    expect(positionKey(game)).toBe(startKey);
    expect(game.positionCounts[startKey]).toBe(2);
    expect(game.winner).toBeNull();
  });
});
