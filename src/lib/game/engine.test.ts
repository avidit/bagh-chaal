import { describe, expect, it } from 'vitest';
import { miniBoard } from './board-mini';
import { applyMove, checkWinner, createGame, getLegalMoves, getWinSummary } from './engine';
import type { GameState } from './types';

describe('mini board engine', () => {
  it('starts with tiger at A and goats at H, I, J', () => {
    const game = createGame({ variant: 'mini', humanSide: 'goat' });
    expect(game.pieces.a).toBe('tiger');
    expect(game.pieces.h).toBe('goat');
    expect(game.pieces.i).toBe('goat');
    expect(game.pieces.j).toBe('goat');
  });

  it('excludes E↔H and G↔J as playable edges', () => {
    expect(miniBoard.nodes.e.neighbors).not.toContain('h');
    expect(miniBoard.nodes.h.neighbors).not.toContain('e');
    expect(miniBoard.nodes.g.neighbors).not.toContain('j');
    expect(miniBoard.nodes.j.neighbors).not.toContain('g');
  });

  it('requires a goat on the jumped-over node', () => {
    const game = createGame({ variant: 'mini', humanSide: 'tiger' });
    const emptyJump = getLegalMoves(game).find(
      (move) => move.kind === 'jump' && move.from === 'a' && move.to === 'e'
    );
    expect(emptyJump).toBeUndefined();
  });

  it('captures a goat on jump and decrements remaining goats', () => {
    let game = createGame({ variant: 'mini', humanSide: 'tiger' });
    game = {
      ...game,
      pieces: { a: 'tiger', b: 'goat' },
      turn: 'tiger'
    };

    const jump = getLegalMoves(game).find(
      (move) => move.kind === 'jump' && move.from === 'a' && move.to === 'e' && move.over === 'b'
    );
    expect(jump).toBeDefined();

    game = applyMove(game, jump!);
    expect(game.pieces.b).toBeUndefined();
    expect(game.captures).toBe(1);
    expect(game.goatsRemaining).toBe(2);
  });

  it('captures on the E–F–G line when tiger jumps from G over F to E', () => {
    let game = createGame({ variant: 'mini', humanSide: 'tiger' });
    game = {
      ...game,
      pieces: { g: 'tiger', f: 'goat' },
      turn: 'tiger'
    };

    const jump = getLegalMoves(game).find(
      (move) => move.kind === 'jump' && move.from === 'g' && move.to === 'e' && move.over === 'f'
    );
    expect(jump).toBeDefined();

    game = applyMove(game, jump!);
    expect(game.pieces.g).toBeUndefined();
    expect(game.pieces.f).toBeUndefined();
    expect(game.pieces.e).toBe('tiger');
    expect(game.captures).toBe(1);
  });

  it('tiger wins after two captures', () => {
    const game = createGame({ variant: 'mini', humanSide: 'tiger' });
    expect(checkWinner({ ...game, captures: 2, turn: 'goat' })).toBe('tiger');
  });

  it('goats win when tiger has no legal moves', () => {
    const game: GameState = {
      ...createGame({ variant: 'mini', humanSide: 'goat' }),
      pieces: { h: 'goat' },
      goatsRemaining: 1,
      goatsOnBoard: 1,
      turn: 'tiger',
      winner: 'goat'
    };
    expect(checkWinner(game)).toBe('goat');
    expect(getWinSummary(game)).toMatchObject({
      winner: 'goat',
      reason: 'tiger-trapped',
      humanWon: true,
      title: 'You win!'
    });
  });

  it('summarizes a tiger capture win for the human player', () => {
    const game: GameState = {
      ...createGame({ variant: 'mini', humanSide: 'tiger' }),
      captures: 2,
      turn: 'goat',
      winner: 'tiger'
    };
    expect(getWinSummary(game)).toMatchObject({
      winner: 'tiger',
      reason: 'captures',
      humanWon: true,
      title: 'You win!'
    });
  });
});

describe('standard board engine', () => {
  it('starts in placement phase with goats to place', () => {
    const game = createGame({ variant: 'standard', humanSide: 'goat' });
    expect(game.phase).toBe('placement');
    expect(game.goatsToPlace).toBe(20);
    expect(game.pieces.n0).toBe('tiger');
    expect(game.pieces.n24).toBe('tiger');
  });

  it('allows goat placement on empty nodes', () => {
    const game = createGame({ variant: 'standard', humanSide: 'goat' });
    const placements = getLegalMoves(game);
    expect(placements.every((move) => move.kind === 'place')).toBe(true);
    expect(placements.some((move) => move.kind === 'place' && move.to === 'n12')).toBe(true);
  });
});
