import { applyMove, getLegalMoves } from './engine';
import type { GameState, Move } from './types';

function pickRandom<T>(items: T[]): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.floor(Math.random() * items.length)];
}

function wouldBlockCapture(state: GameState, move: Move): boolean {
  const after = applyMove(state, move);
  const tigerJumps = getLegalMoves({ ...after, turn: 'tiger' }).filter(
    (candidate) => candidate.kind === 'jump'
  );
  return tigerJumps.length === 0;
}

export function getCpuMove(state: GameState): Move | null {
  const legal = getLegalMoves(state);
  if (legal.length === 0) return null;

  if (state.turn === 'tiger') {
    const captures = legal.filter((move) => move.kind === 'jump');
    if (captures.length > 0) {
      return pickRandom(captures) ?? null;
    }
    return pickRandom(legal) ?? null;
  }

  const blocking = legal.filter((move) => wouldBlockCapture(state, move));
  if (blocking.length > 0) {
    return pickRandom(blocking) ?? null;
  }

  return pickRandom(legal) ?? null;
}
