import { describe, expect, it } from 'vitest';
import { standardBoard } from './board-standard';
import { createGame, getBlockedCaptures, getLegalMoves } from './engine';
import type { GameState } from './types';

function tigerGame(pieces: GameState['pieces']): GameState {
  return {
    ...createGame({ variant: 'standard', humanSide: 'tiger' }),
    phase: 'movement',
    turn: 'tiger',
    pieces,
    goatsOnBoard: Object.values(pieces).filter((piece) => piece === 'goat').length,
    goatsToPlace: 0
  };
}

describe('standard board jumps', () => {
  it('allows n12 to jump over n16 to n20 on a straight diagonal', () => {
    expect(standardBoard.nodes.n12.jumps.n20).toBe('n16');

    const game = tigerGame({ n12: 'tiger', n16: 'goat' });
    const jump = getLegalMoves(game).find(
      (move) =>
        move.kind === 'jump' && move.from === 'n12' && move.over === 'n16' && move.to === 'n20'
    );
    expect(jump).toBeDefined();
  });

  it('allows n4 to jump down over n9 to n14', () => {
    expect(standardBoard.nodes.n4.jumps.n14).toBe('n9');

    const game = tigerGame({ n4: 'tiger', n9: 'goat' });
    const jump = getLegalMoves(game).find(
      (move) =>
        move.kind === 'jump' && move.from === 'n4' && move.over === 'n9' && move.to === 'n14'
    );
    expect(jump).toBeDefined();
  });

  it('does not allow capturing by jumping up over n14 to n9 from n4', () => {
    expect(standardBoard.nodes.n4.jumps.n9).toBeUndefined();

    const game = tigerGame({ n4: 'tiger', n14: 'goat' });
    expect(
      getLegalMoves(game).some(
        (move) => move.kind === 'jump' && move.over === 'n14' && move.to === 'n9'
      )
    ).toBe(false);
  });

  it('does not allow bent jumps such as n12 over n16 to n21', () => {
    expect(standardBoard.nodes.n12.jumps.n21).toBeUndefined();
  });

  it('does not allow a capture when the landing square is occupied', () => {
    const game = tigerGame({ n4: 'tiger', n9: 'goat', n14: 'goat' });
    expect(
      getLegalMoves(game).some(
        (move) =>
          move.kind === 'jump' && move.from === 'n4' && move.over === 'n9' && move.to === 'n14'
      )
    ).toBe(false);
    expect(getBlockedCaptures(game, 'n4')).toEqual([{ from: 'n4', over: 'n9', to: 'n14' }]);
  });
});
